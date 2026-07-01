import { useCallback, useRef, useState } from "react";
import { concatFloat32, encodeWav } from "common/utils/audio";
import MeetingService from "services/meeting.service";
import { LIVE_CHUNK_MS } from "common/constants";

// Ports the Web Audio capture pipeline from the old frontend/app.js +
// bridge.js: getUserMedia -> AudioContext -> ScriptProcessorNode, buffering
// raw PCM into a full-recording buffer and a "since last flush" chunk
// buffer that's uploaded every LIVE_CHUNK_MS. `meetingId` is read from a
// ref (not a closure) so the chunk-flush interval always sees the latest
// value even though the meeting is typically created moments after
// recording starts (the socket's `recording_started` event lands the id).
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
    const blocksRef = useRef([]);
    const chunkBlocksRef = useRef([]);
    const chunkTimerRef = useRef(null);
    const elapsedTimerRef = useRef(null);
    const startTimeRef = useRef(null);

    const flushChunk = useCallback(async () => {
        const id = meetingIdRef.current;
        if (!id || !chunkBlocksRef.current.length) return;
        const samples = concatFloat32(chunkBlocksRef.current);
        chunkBlocksRef.current = [];
        try {
            await MeetingService.uploadAudioChunk(id, encodeWav(samples, audioContextRef.current.sampleRate));
        } catch {
            // live chunk upload is best-effort — the full recording is what matters
        }
    }, []);

    const start = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

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

        blocksRef.current = [];
        chunkBlocksRef.current = [];

        processor.onaudioprocess = (e) => {
            const copy = new Float32Array(e.inputBuffer.getChannelData(0));
            blocksRef.current.push(copy);
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
    }, [flushChunk]);

    const stop = useCallback(async () => {
        clearInterval(chunkTimerRef.current);
        clearInterval(elapsedTimerRef.current);

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
        }
        sourceRef.current?.disconnect();
        streamRef.current?.getTracks().forEach((t) => t.stop());

        const sampleRate = audioContextRef.current?.sampleRate;
        if (audioContextRef.current) await audioContextRef.current.close();

        setIsRecording(false);
        setAnalyser(null);

        const samples = concatFloat32(blocksRef.current);
        blocksRef.current = [];
        chunkBlocksRef.current = [];

        const id = meetingIdRef.current;
        if (id && samples.length) {
            return MeetingService.uploadAudio(id, encodeWav(samples, sampleRate));
        }
        return null;
    }, []);

    return { start, stop, isRecording, elapsedMs, analyser };
};

export default useAudioRecorder;
