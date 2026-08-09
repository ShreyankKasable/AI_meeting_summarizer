import { useCallback, useRef, useState } from "react";
import { concatFloat32, encodeWav } from "common/utils/audio";
import MeetingService from "services/meeting.service";
import { LIVE_CHUNK_MS } from "common/constants";

const MULTIPART_TIMESLICE_MS = 5000;
const DEFAULT_MIN_PART_SIZE = 5 * 1024 * 1024;
const RECORDING_MIME_TYPES = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
];

function chooseRecordingMimeType() {
    if (!window.MediaRecorder) return "";
    return RECORDING_MIME_TYPES.find((type) => window.MediaRecorder.isTypeSupported(type)) || "";
}

function extensionForMimeType(mimeType) {
    if (mimeType.includes("mp4")) return ".m4a";
    return ".webm";
}

// Captures audio through Web Audio for live WAV transcript chunks and through
// MediaRecorder for production final recording upload. The final recording is
// uploaded to R2 multipart in joined-safe WebM/Opus parts while recording.
const useAudioRecorder = (meetingId) => {
    const [isRecording, setIsRecording] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [analyser, setAnalyser] = useState(null);

    const meetingIdRef = useRef(meetingId);
    meetingIdRef.current = meetingId;

    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const processorRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunkBlocksRef = useRef([]);
    const chunkTimerRef = useRef(null);
    const elapsedTimerRef = useRef(null);
    const startTimeRef = useRef(null);
    const multipartRef = useRef(null);
    const partUploadChainRef = useRef(Promise.resolve());
    const multipartErrorRef = useRef(null);

    const abortMultipart = useCallback(async () => {
        const state = multipartRef.current;
        multipartRef.current = null;
        partUploadChainRef.current = Promise.resolve();
        if (!state?.uploadId || !state?.key) return;
        try {
            await MeetingService.abortMultipartAudio(meetingIdRef.current, {
                uploadId: state.uploadId,
                key: state.key,
            });
        } catch {
            // Best-effort cleanup; R2 also expires incomplete multipart uploads.
        }
    }, []);

    const enqueueMultipartPart = useCallback((force = false) => {
        const id = meetingIdRef.current;
        const state = multipartRef.current;
        if (!id || !state || !state.pendingSize) return Promise.resolve();
        if (!force && state.pendingSize < state.minPartSize) return Promise.resolve();

        const blob = new Blob(state.pendingBlobs, { type: state.contentType });
        state.pendingBlobs = [];
        state.pendingSize = 0;
        const partNumber = state.nextPartNumber;
        state.nextPartNumber += 1;

        const upload = partUploadChainRef.current.then(async () => {
            const { data } = await MeetingService.uploadMultipartAudioPart(id, {
                uploadId: state.uploadId,
                key: state.key,
                partNumber,
                blob,
            });
            state.parts.push(data.part);
        });

        const tracked = upload.catch((error) => {
            multipartErrorRef.current = error;
            throw error;
        });
        partUploadChainRef.current = tracked.catch(() => {});
        return tracked;
    }, []);

    const flushChunk = useCallback(async () => {
        const id = meetingIdRef.current;
        if (!id || !chunkBlocksRef.current.length) return;
        const samples = concatFloat32(chunkBlocksRef.current);
        chunkBlocksRef.current = [];
        try {
            await MeetingService.uploadAudioChunk(id, encodeWav(samples, audioContextRef.current.sampleRate));
        } catch {
            // Live chunk upload is best-effort; final recording processing is authoritative.
        }
    }, []);

    const setupMultipartRecorder = useCallback(async (stream) => {
        const id = meetingIdRef.current;
        const mimeType = chooseRecordingMimeType();
        if (!id || !mimeType) return false;

        try {
            const extension = extensionForMimeType(mimeType);
            const { data } = await MeetingService.startMultipartAudio(id, {
                contentType: mimeType,
                extension,
            });
            if (!data?.enabled || !data.uploadId || !data.key) return false;

            multipartRef.current = {
                uploadId: data.uploadId,
                key: data.key,
                contentType: data.contentType || mimeType,
                extension: data.extension || extension,
                minPartSize: Number(data.minPartSize) || DEFAULT_MIN_PART_SIZE,
                nextPartNumber: 1,
                pendingBlobs: [],
                pendingSize: 0,
                parts: [],
            };
            multipartErrorRef.current = null;
            partUploadChainRef.current = Promise.resolve();

            const recorder = new MediaRecorder(stream, { mimeType });
            recorder.ondataavailable = (event) => {
                const state = multipartRef.current;
                if (!state || !event.data?.size) return;
                state.pendingBlobs.push(event.data);
                state.pendingSize += event.data.size;
                if (state.pendingSize >= state.minPartSize) enqueueMultipartPart(false);
            };
            recorder.onerror = (event) => {
                multipartErrorRef.current = event.error || new Error("MediaRecorder failed");
            };
            recorder.start(MULTIPART_TIMESLICE_MS);
            mediaRecorderRef.current = recorder;
            return true;
        } catch {
            multipartRef.current = null;
            mediaRecorderRef.current = null;
            return false;
        }
    }, [enqueueMultipartPart]);

    const stopMediaRecorder = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        mediaRecorderRef.current = null;
        if (!recorder || recorder.state === "inactive") return Promise.resolve();

        return new Promise((resolve) => {
            recorder.onstop = () => resolve();
            try {
                recorder.requestData();
                recorder.stop();
            } catch {
                resolve();
            }
        });
    }, []);

    const completeMultipartRecording = useCallback(async () => {
        const id = meetingIdRef.current;
        const state = multipartRef.current;
        if (!id || !state) return null;

        try {
            await enqueueMultipartPart(true);
            await partUploadChainRef.current;
            if (multipartErrorRef.current) throw multipartErrorRef.current;
            if (!state.parts.length) throw new Error("No recording data captured");

            const result = await MeetingService.completeMultipartAudio(id, {
                uploadId: state.uploadId,
                key: state.key,
                parts: state.parts,
            });
            multipartRef.current = null;
            partUploadChainRef.current = Promise.resolve();
            return result;
        } catch (error) {
            await abortMultipart();
            throw error;
        }
    }, [abortMultipart, enqueueMultipartPart]);

    const start = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const multipartReady = await setupMultipartRecorder(stream);
        if (!multipartReady) {
            stream.getTracks().forEach((track) => track.stop());
            throw new Error("Cloud recording upload could not start.");
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;

        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        source.connect(analyserNode);
        setAnalyser(analyserNode);

        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        chunkBlocksRef.current = [];

        processor.onaudioprocess = (e) => {
            const copy = new Float32Array(e.inputBuffer.getChannelData(0));
            chunkBlocksRef.current.push(copy);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        chunkTimerRef.current = setInterval(flushChunk, LIVE_CHUNK_MS);

        startTimeRef.current = Date.now();
        setElapsedMs(0);
        elapsedTimerRef.current = setInterval(() => {
            setElapsedMs(Date.now() - startTimeRef.current);
        }, 1000);

        setIsRecording(true);
    }, [flushChunk, setupMultipartRecorder]);

    const stop = useCallback(async () => {
        clearInterval(chunkTimerRef.current);
        clearInterval(elapsedTimerRef.current);
        await flushChunk();

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
        }
        sourceRef.current?.disconnect();

        if (audioContextRef.current) await audioContextRef.current.close();

        setIsRecording(false);
        setAnalyser(null);

        await stopMediaRecorder();
        streamRef.current?.getTracks().forEach((t) => t.stop());

        if (multipartRef.current) {
            chunkBlocksRef.current = [];
            return completeMultipartRecording();
        }

        chunkBlocksRef.current = [];
        throw new Error("Cloud recording upload session is not active.");
    }, [completeMultipartRecording, flushChunk, stopMediaRecorder]);

    return { start, stop, isRecording, elapsedMs, analyser };
};

export default useAudioRecorder;
