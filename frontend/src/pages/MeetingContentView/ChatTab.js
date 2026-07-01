import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Send } from "lucide-react";
import Avatar from "common/components/Avatar";
import { Body2, Body3 } from "common/global-styled-components";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const Info = styled(Body3)`
    padding: var(--Size-Padding-L) var(--Size-Padding-XL) 0;
    color: var(--Color-Text-Subtlest);
`;

const Messages = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: var(--Size-Padding-XL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-L);
`;

const Row = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    justify-content: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
`;

const Bubble = styled(Body3)`
    max-width: 85%;
    padding: var(--Size-Padding-M) var(--Size-Padding-L);
    border-radius: var(--Size-CornerRadius-L);
    background: ${({ isUser }) => (isUser ? "var(--Color-Background-Action)" : "var(--Color-Background-Subtle-2)")};
    color: ${({ isUser }) => (isUser ? "var(--Color-Text-Inverse)" : "var(--Color-Text-Default)")};
`;

const InputRow = styled.form`
    position: relative;
    padding: var(--Size-Padding-L);
    border-top: 1px solid var(--Color-Border-Subtle);
`;

const TextArea = styled.textarea`
    width: 100%;
    resize: none;
    padding: var(--Size-Padding-M) 40px var(--Size-Padding-M) var(--Size-Padding-L);
    font-size: var(--body-3-d);
    font-family: var(--body-font);
    background: var(--Color-Background-Subtle);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    outline: none;

    &:focus {
        border-color: var(--Color-Border-Action);
    }
`;

const SendButton = styled.button`
    position: absolute;
    right: 22px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--Color-Icon-Action);

    &:disabled {
        opacity: 0.4;
    }
`;

// Presentational — works for both the host (meeting.service) and participant
// (share.service) chat flows; the parent owns fetching/sending via `onSend`.
const ChatTab = ({ messages = [], onSend, sending = false }) => {
    const [question, setQuestion] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!question.trim() || sending) return;
        onSend(question.trim());
        setQuestion("");
    };

    return (
        <Wrapper>
            <Info>Ask anything about this meeting&apos;s content.</Info>
            <Messages ref={scrollRef}>
                {messages.map((m) => (
                    <Row key={m.id || `${m.role}-${m.content}`} isUser={m.role === "user"}>
                        {m.role !== "user" && <Avatar name="AI" size="small" />}
                        <Bubble isUser={m.role === "user"}>{m.content}</Bubble>
                    </Row>
                ))}
                {sending && (
                    <Row>
                        <Avatar name="AI" size="small" />
                        <Bubble>Thinking...</Bubble>
                    </Row>
                )}
            </Messages>
            <InputRow onSubmit={handleSubmit}>
                <TextArea
                    rows={1}
                    placeholder="Ask a question about this meeting..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
                    }}
                />
                <SendButton type="submit" disabled={!question.trim() || sending}>
                    <Send size={18} />
                </SendButton>
            </InputRow>
        </Wrapper>
    );
};

export default ChatTab;
