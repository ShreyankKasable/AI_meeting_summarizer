import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Square, Pause, Bookmark } from "lucide-react";
import PageContainer from "common/components/PageContainer";
import Badge from "common/components/Badge";
import AudioVisualizer from "common/components/AudioVisualizer";
import { H1, Body3 } from "common/global-styled-components";
import useAudioRecorder from "common/hooks/useAudioRecorder";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import { formatElapsed } from "common/utils/utils";
import TranscriptPanel from "./TranscriptPanel";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--Size-Padding-XXXL);
    text-align: center;
`;

const LiveBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-S) var(--Size-Padding-L);
    background: var(--Color-Background-Accent-Danger);
    color: var(--Color-Text-Danger);
    border-radius: var(--Size-CornerRadius-Full);
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    margin-bottom: var(--Size-Gap-L);

    &::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--Color-Text-Danger);
        animation: meetai-pulse 1.5s ease infinite;
    }
`;

const Timer = styled.div`
    font-family: var(--mono-font);
    font-size: 40px;
    font-weight: var(--bold);
    color: var(--Color-Text-Action);
    letter-spacing: var(--letter-spacing-tight);
    margin: var(--Size-Gap-XL) 0;
`;

const Controls = styled.div`
    display: flex;
    gap: var(--Size-Gap-XXL);
    margin-top: var(--Size-Gap-XXXL);
`;

const ControlButton = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--Size-Gap-S);
    background: none;
    border: none;
    color: var(--Color-Text-Subtle);
`;

const CircleButton = styled.div`
    width: ${({ large }) => (large ? "88px" : "64px")};
    height: ${({ large }) => (large ? "88px" : "64px")};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: ${({ danger }) => (danger ? "var(--Color-Text-Danger)" : "var(--Color-Background-Subtle-2)")};
    color: ${({ danger }) => (danger ? "var(--Color-Text-Inverse)" : "var(--Color-Text-Default)")};
    box-shadow: ${({ danger }) => (danger ? "0 12px 24px rgba(186, 26, 26, 0.25)" : "none")};
    transition: transform 0.15s ease;

    &:hover {
        transform: scale(1.05);
    }
`;

const ProcessingBanner = styled.div`
    margin-top: var(--Size-Gap-XL);
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Text-Action);
    border-radius: var(--Size-CornerRadius-L);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
`;

const RecordMeeting = () => {
    const dispatch = useDispatch();
    const activeId = useSelector((state) => state.meetingDetails.activeId);
    const liveTranscript = useSelector((state) => state.meetingDetails.liveTranscript);
    const processingStatus = useSelector((state) => state.meetingDetails.processingStatus);
    const meeting = useSelector((state) =>
        state.meetingDetails.list.find((m) => m.id === state.meetingDetails.activeId),
    );

    const { start, stop, isRecording, elapsedMs, analyser } = useAudioRecorder(activeId);
    const [isStopping, setIsStopping] = useState(false);
    const startedRef = useRef(false);

    useEffect(() => {
        if (activeId && !startedRef.current) {
            startedRef.current = true;
            start().catch((err) => {
                // eslint-disable-next-line no-alert
                alert(`Could not access microphone: ${err.message}`);
            });
        }
    }, [activeId, start]);

    useEffect(() => {
        if (processingStatus?.status === "complete") {
            dispatch(setHostView(HOST_VIEWS.Meeting));
        }
    }, [processingStatus, dispatch]);

    const handleStop = async () => {
        setIsStopping(true);
        await stop();
    };

    return (
        <Wrapper>
            <LiveBadge>LIVE</LiveBadge>
            <H1 style={{ fontSize: "var(--h2-d)" }}>Recording: {meeting?.title || "New Meeting"}</H1>
            <Timer>{formatElapsed(elapsedMs)}</Timer>

            <AudioVisualizer analyser={analyser} active={isRecording} />

            <TranscriptPanel entries={liveTranscript} />

            {isStopping ? (
                <ProcessingBanner>
                    {processingStatus
                        ? `${processingStatus.status.replace(/_/g, " ")} (${processingStatus.progress}%)`
                        : "Processing your recording..."}
                </ProcessingBanner>
            ) : (
                <Controls>
                    <ControlButton type="button" disabled title="Pause (coming soon)">
                        <CircleButton>
                            <Pause size={22} />
                        </CircleButton>
                        <Body3>Pause</Body3>
                    </ControlButton>

                    <ControlButton type="button" onClick={handleStop} id="stop-recording-btn">
                        <CircleButton large danger>
                            <Square size={26} fill="currentColor" />
                        </CircleButton>
                        <Body3>Stop Recording</Body3>
                    </ControlButton>

                    <ControlButton type="button" disabled title="Marker (coming soon)">
                        <CircleButton>
                            <Bookmark size={22} />
                        </CircleButton>
                        <Body3>Marker</Body3>
                    </ControlButton>
                </Controls>
            )}
        </Wrapper>
    );
};

export default RecordMeeting;
