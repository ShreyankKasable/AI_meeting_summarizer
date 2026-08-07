import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { MessageSquareText } from "lucide-react";
import { Body2, Body3 } from "common/global-styled-components";

const Panel = styled.div`
    width: min(100%, 760px);
    max-height: 240px;
    overflow-y: auto;
    margin: 0 auto;
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-Card);
    text-align: left;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    margin-bottom: var(--Size-Gap-L);
`;

const Label = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    color: var(--Color-Text-Action);
`;

const Count = styled(Body3)`
    color: var(--Color-Text-Subtlest);
`;

const Placeholder = styled.div`
    min-height: 88px;
    display: grid;
    place-items: center;
    border: 1px dashed var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    color: var(--Color-Text-Subtlest);
`;

const TranscriptText = styled(Body2)`
    line-height: var(--line-height-160);
`;

const TranscriptPanel = ({ entries = [] }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [entries]);

    return (
        <Panel ref={scrollRef}>
            <Header>
                <Label>
                    <MessageSquareText size={14} />
                    Live Transcript
                </Label>
                <Count>{entries.length} chunks</Count>
            </Header>
            {entries.length === 0 ? (
                <Placeholder>
                    <Body3>Listening for speech...</Body3>
                </Placeholder>
            ) : (
                <TranscriptText>
                    {entries.map((text, i) => (
                        <span key={i} style={{ opacity: i === entries.length - 1 ? 1 : 0.56 }}>
                            {text}{" "}
                        </span>
                    ))}
                </TranscriptText>
            )}
        </Panel>
    );
};

export default TranscriptPanel;
