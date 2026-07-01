import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { Body2 } from "common/global-styled-components";

const Panel = styled.div`
    width: 100%;
    max-width: 640px;
    max-height: 200px;
    overflow-y: auto;
    margin-top: var(--Size-Gap-XXL);
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
    text-align: left;
`;

const Label = styled.div`
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Action);
    margin-bottom: var(--Size-Gap-M);
`;

const Placeholder = styled(Body2)`
    color: var(--Color-Text-Subtlest);
`;

// Live transcript entries, dimmer for older text and full-opacity for the
// most recent — appended in real time from the live_transcript_update socket
// event (see common/hooks/useSocket.js).
const TranscriptPanel = ({ entries = [] }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [entries]);

    return (
        <Panel ref={scrollRef}>
            <Label>Live Transcript</Label>
            {entries.length === 0 ? (
                <Placeholder>Listening for speech...</Placeholder>
            ) : (
                <Body2 style={{ lineHeight: "var(--line-height-140)" }}>
                    {entries.map((text, i) => (
                        <span key={i} style={{ opacity: i === entries.length - 1 ? 1 : 0.6 }}>
                            {text}{" "}
                        </span>
                    ))}
                </Body2>
            )}
        </Panel>
    );
};

export default TranscriptPanel;
