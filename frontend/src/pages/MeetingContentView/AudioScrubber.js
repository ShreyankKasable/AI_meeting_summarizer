import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FastForward, Pause, Play, Rewind, Volume2 } from "lucide-react";
import { Body3 } from "common/global-styled-components";
import { formatElapsed } from "common/utils/utils";

const Bar = styled.div`
    display: grid;
    grid-template-columns: auto auto auto auto 1fr auto auto;
    align-items: center;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    background: var(--Color-Background-Subtle);
    border-top: 1px solid var(--Color-Border-Subtle);

    @media (max-width: 640px) {
        grid-template-columns: auto auto auto 1fr;
        gap: var(--Size-Gap-M);
    }
`;

const PlayButton = styled.button`
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--Size-CornerRadius-Full);
    background: var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);
    box-shadow: 0 12px 24px rgba(17, 19, 22, 0.18);
    transition: all var(--transition-fast);

    &:hover {
        transform: translateY(-1px);
    }
`;

const Track = styled.div`
    flex: 1;
    height: 8px;
    background: var(--Color-Background-Subtle-3);
    border-radius: var(--Size-CornerRadius-Full);
    position: relative;
    cursor: pointer;
    overflow: hidden;
`;

const Fill = styled.div`
    position: absolute;
    inset: 0;
    width: ${({ $pct }) => $pct}%;
    background: var(--Color-Background-Action);
    border-radius: var(--Size-CornerRadius-Full);
`;

const IconButton = styled.button`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    color: var(--Color-Icon-Subtle);
    transition: all var(--transition-fast);

    &:hover {
        color: var(--Color-Text-Bold);
        border-color: var(--Color-Border-Bold);
    }
`;

const Time = styled(Body3)`
    font-family: var(--mono-font);
    color: var(--Color-Text-Subtle);

    @media (max-width: 640px) {
        display: none;
    }
`;

const AudioScrubber = ({ src }) => {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentMs, setCurrentMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return undefined;
        const onTime = () => setCurrentMs(audio.currentTime * 1000);
        const onLoaded = () => setDurationMs(audio.duration * 1000);
        const onEnded = () => setPlaying(false);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);
        return () => {
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
        };
    }, [src]);

    if (!src) return null;

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) audioRef.current.pause();
        else audioRef.current.play();
        setPlaying(!playing);
    };

    const seek = (deltaSeconds) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + deltaSeconds);
    };

    const seekToClick = (e) => {
        if (!audioRef.current || !durationMs) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = pct * (durationMs / 1000);
    };

    const pct = durationMs ? (currentMs / durationMs) * 100 : 0;

    return (
        <Bar>
            <audio ref={audioRef} src={src} preload="metadata" />
            <IconButton type="button" onClick={() => seek(-10)} title="Rewind 10 seconds" aria-label="Rewind 10 seconds">
                <Rewind size={15} />
            </IconButton>
            <PlayButton type="button" onClick={togglePlay} aria-label={playing ? "Pause audio" : "Play audio"}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
            </PlayButton>
            <IconButton type="button" onClick={() => seek(10)} title="Forward 10 seconds" aria-label="Forward 10 seconds">
                <FastForward size={15} />
            </IconButton>
            <Time>{formatElapsed(currentMs)}</Time>
            <Track onClick={seekToClick} role="slider" aria-label="Audio position" aria-valuenow={Math.round(pct)}>
                <Fill $pct={pct} />
            </Track>
            <Time>{formatElapsed(durationMs)}</Time>
            <Volume2 size={16} color="var(--Color-Icon-Subtle)" />
        </Bar>
    );
};

export default AudioScrubber;
