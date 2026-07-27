import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const BAR_COUNT = 64;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    height: 104px;
`;

const Bar = styled.div`
    flex: 1;
    max-width: 5px;
    min-height: 4px;
    border-radius: var(--Size-CornerRadius-Full);
    background: linear-gradient(180deg, #54d1c4, var(--Color-Background-Action));
    opacity: 0.36;
    transition:
        height 0.08s ease,
        opacity 0.08s ease;
`;

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
                    const height = Math.max(4, (value / 255) * 104);
                    const bar = barRefs.current[i];
                    if (bar) {
                        bar.style.height = `${height}px`;
                        bar.style.opacity = String(0.38 + (value / 255) * 0.62);
                    }
                }
            } else {
                idleTRef.current += 0.12;
                for (let i = 0; i < BAR_COUNT; i++) {
                    const wave = Math.sin(idleTRef.current + i * 0.35) * 0.5 + 0.5;
                    const bar = barRefs.current[i];
                    if (bar) {
                        bar.style.height = `${10 + wave * 18}px`;
                        bar.style.opacity = String(0.18 + wave * 0.28);
                    }
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        tick();
        return () => cancelAnimationFrame(rafRef.current);
    }, [analyser, active]);

    return (
        <Wrapper aria-hidden="true">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <Bar key={i} ref={(el) => (barRefs.current[i] = el)} />
            ))}
        </Wrapper>
    );
};

export default AudioVisualizer;
