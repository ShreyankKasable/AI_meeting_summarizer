import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const BAR_COUNT = 64;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 100%;
    max-width: 640px;
    height: 96px;
`;

const Bar = styled.div`
    flex: 1;
    max-width: 4px;
    min-height: 4px;
    border-radius: var(--Size-CornerRadius-Full);
    background: var(--Color-Background-Action);
    opacity: 0.4;
    transition: height 0.08s ease, opacity 0.08s ease;
`;

// 64-bar waveform. If `analyser` (a Web Audio AnalyserNode) is supplied and
// `active` is true, bars reflect real frequency data; otherwise they idle
// with a gentle sine-wave animation so the component still looks alive
// before recording starts.
const AudioVisualizer = ({ analyser, active = false }) => {
    const barRefs = useRef([]);
    const rafRef = useRef(null);
    const idleTRef = useRef(0);

    useEffect(() => {
        const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

        const tick = () => {
            if (active && analyser && dataArray) {
                analyser.getByteFrequencyData(dataArray);
                const step = Math.floor(dataArray.length / BAR_COUNT) || 1;
                for (let i = 0; i < BAR_COUNT; i++) {
                    const value = dataArray[i * step] || 0;
                    const height = Math.max(4, (value / 255) * 96);
                    const bar = barRefs.current[i];
                    if (bar) {
                        bar.style.height = `${height}px`;
                        bar.style.opacity = String(0.4 + (value / 255) * 0.6);
                    }
                }
            } else {
                idleTRef.current += 0.12;
                for (let i = 0; i < BAR_COUNT; i++) {
                    const wave = Math.sin(idleTRef.current + i * 0.35) * 0.5 + 0.5;
                    const bar = barRefs.current[i];
                    if (bar) {
                        bar.style.height = `${8 + wave * 16}px`;
                        bar.style.opacity = String(0.25 + wave * 0.25);
                    }
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        tick();
        return () => cancelAnimationFrame(rafRef.current);
    }, [analyser, active]);

    return (
        <Wrapper>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <Bar key={i} ref={(el) => (barRefs.current[i] = el)} />
            ))}
        </Wrapper>
    );
};

export default AudioVisualizer;
