import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Play, Pause, Rewind, FastForward, Volume2 } from "lucide-react";
import { Body3 } from "common/global-styled-components";
import { formatElapsed } from "common/utils/utils";

const Bar = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    background: var(--Color-Background-Subtle-2);
    border-top: 1px solid var(--Color-Border-Subtle);
`;

const PlayButton = styled.button`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
`;

const Track = styled.div`
    flex: 1;
    height: 6px;
    background: var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-Full);
    position: relative;
    cursor: pointer;
`;

const Fill = styled.div`
    position: absolute;
    inset: 0;
    width: ${({ pct }) => pct}%;
    background: var(--Color-Background-Action);
    border-radius: var(--Size-CornerRadius-Full);
`;

const IconButton = styled.button`
    background: none;
    border: none;
    color: var(--Color-Icon-Subtle);
    display: flex;
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
            <IconButton type="button" onClick={() => seek(-10)} title="Rewind 10s">
                <Rewind size={16} />
            </IconButton>
            <PlayButton type="button" onClick={togglePlay}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
            </PlayButton>
            <IconButton type="button" onClick={() => seek(10)} title="Forward 10s">
                <FastForward size={16} />
            </IconButton>
            <Body3>{formatElapsed(currentMs)}</Body3>
            <Track onClick={seekToClick}>
                <Fill pct={pct} />
            </Track>
            <Body3>{formatElapsed(durationMs)}</Body3>
            <Volume2 size={16} color="var(--Color-Icon-Subtle)" />
        </Bar>
    );
};

export default AudioScrubber;
