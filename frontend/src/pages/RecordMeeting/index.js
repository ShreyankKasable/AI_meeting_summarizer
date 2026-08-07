import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Bookmark, Pause, Square } from "lucide-react";
import Badge from "common/components/Badge";
import AudioVisualizer from "common/components/AudioVisualizer";
import { H1, H3, Body2, Body3 } from "common/global-styled-components";
import useAudioRecorder from "common/hooks/useAudioRecorder";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import { toast } from "common/utils/toast";
import { formatElapsed } from "common/utils/utils";
import TranscriptPanel from "./TranscriptPanel";

const Wrapper = styled.div`
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
    padding: var(--Size-Padding-XXXL);

    @media (max-width: 640px) {
        padding: var(--Size-Padding-XL);
    }
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    margin-bottom: var(--Size-Gap-XXXL);
    flex-wrap: wrap;
`;

const LiveBadge = styled(Badge)`
    &::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
        animation: meetai-pulse 1.5s ease infinite;
    }
`;

const Studio = styled(motion.div)`
    align-self: center;
    width: min(100%, 940px);
    margin: 0 auto;
    display: grid;
    gap: var(--Size-Gap-XXXL);
    text-align: center;
`;

const RecordingCard = styled.div`
    padding: var(--Size-Padding-4XL);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-1);

    @media (max-width: 640px) {
        padding: var(--Size-Padding-XXL);
    }
`;

const Timer = styled.div`
    font-family: var(--mono-font);
    font-size: clamp(44px, 9vw, 82px);
    font-weight: var(--bold);
    color: var(--Color-Text-Bold);
    letter-spacing: 0;
    margin: var(--Size-Gap-XXL) 0;
`;

const VisualFrame = styled.div`
    width: min(100%, 720px);
    margin: 0 auto;
    padding: var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
`;

const Controls = styled.div`
    display: flex;
    justify-content: center;
    gap: var(--Size-Gap-XXL);
    flex-wrap: wrap;
`;

const ControlButton = styled.button`
    display: grid;
    justify-items: center;
    gap: var(--Size-Gap-M);
    min-width: 104px;
    background: none;
    border: none;
    color: var(--Color-Text-Subtle);

    &:disabled {
        opacity: 0.46;
    }
`;

const CircleButton = styled.div`
    width: ${({ $large }) => ($large ? "88px" : "62px")};
    height: ${({ $large }) => ($large ? "88px" : "62px")};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-Full);
    background: ${({ $danger }) => ($danger ? "var(--Color-Text-Danger)" : "var(--Color-Background-Default)")};
    color: ${({ $danger }) => ($danger ? "var(--Color-Text-Inverse)" : "var(--Color-Text-Bold)")};
    border: 1px solid ${({ $danger }) => ($danger ? "transparent" : "var(--Color-Border-Subtle)")};
    box-shadow: ${({ $danger }) => ($danger ? "0 20px 42px rgba(180, 35, 24, 0.24)" : "var(--Color-Shadow-Card)")};
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);

    ${ControlButton}:hover:not(:disabled) & {
        transform: translateY(-2px) scale(1.02);
        box-shadow: ${({ $danger }) => ($danger ? "0 22px 46px rgba(180, 35, 24, 0.28)" : "var(--Color-Shadow-1)")};
    }
`;

const ProcessingBanner = styled.div`
    width: min(100%, 640px);
    margin: 0 auto;
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-Card);
    text-align: left;
`;

const ProgressTrack = styled.div`
    height: 8px;
    margin-top: var(--Size-Gap-L);
    border-radius: var(--Size-CornerRadius-Full);
    background: var(--Color-Background-Subtle-2);
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${({ value }) => value}%;
    border-radius: inherit;
    background: var(--Color-Background-Action);
    transition: width var(--transition-med);
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
                toast.error("Could not access microphone", { message: err.message });
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

    const progress = Math.max(4, Math.min(100, processingStatus?.progress || 12));

    return (
        <Wrapper>
            <TopBar>
                <LiveBadge tone="danger">Live recording</LiveBadge>
                <Body3>{meeting?.title || "New Meeting"}</Body3>
            </TopBar>

            <Studio initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                <RecordingCard>
                    <H1 style={{ fontSize: "var(--h2-d)" }}>{meeting?.title || "New Meeting"}</H1>
                    <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-M)" }}>
                        Recording audio and listening for transcript updates.
                    </Body2>
                    <Timer>{formatElapsed(elapsedMs)}</Timer>
                    <VisualFrame>
                        <AudioVisualizer analyser={analyser} active={isRecording} />
                    </VisualFrame>
                </RecordingCard>

                <TranscriptPanel entries={liveTranscript} />

                {isStopping ? (
                    <ProcessingBanner>
                        <H3 style={{ fontSize: "var(--subtitle-2-d)" }}>Processing recording</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>
                            {processingStatus
                                ? `${processingStatus.status.replace(/_/g, " ")} (${processingStatus.progress}%)`
                                : "Preparing transcript and summary..."}
                        </Body3>
                        <ProgressTrack>
                            <ProgressFill value={progress} />
                        </ProgressTrack>
                    </ProcessingBanner>
                ) : (
                    <Controls>
                        <ControlButton type="button" disabled title="Pause">
                            <CircleButton>
                                <Pause size={22} />
                            </CircleButton>
                            <Body3>Pause</Body3>
                        </ControlButton>

                        <ControlButton type="button" onClick={handleStop} id="stop-recording-btn">
                            <CircleButton $large $danger>
                                <Square size={26} fill="currentColor" />
                            </CircleButton>
                            <Body3>Stop</Body3>
                        </ControlButton>

                        <ControlButton type="button" disabled title="Marker">
                            <CircleButton>
                                <Bookmark size={22} />
                            </CircleButton>
                            <Body3>Marker</Body3>
                        </ControlButton>
                    </Controls>
                )}
            </Studio>
        </Wrapper>
    );
};

export default RecordMeeting;
