import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Bot, Send, Sparkles } from "lucide-react";
import Avatar from "common/components/Avatar";
import Badge from "common/components/Badge";
import { H3, Body3 } from "common/global-styled-components";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
`;

const Info = styled.div`
    padding: var(--Size-Padding-XL) var(--Size-Padding-XXL) 0;
`;

const Messages = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--Size-Padding-XXL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-L);
`;

const Row = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
    align-items: flex-start;
`;

const Bubble = styled(Body3)`
    max-width: 88%;
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    border: 1px solid ${({ $isUser }) => ($isUser ? "transparent" : "var(--Color-Border-Subtle)")};
    border-radius: ${({ $isUser }) =>
        $isUser
            ? "var(--Size-CornerRadius-L) var(--Size-CornerRadius-L) var(--Size-CornerRadius-S) var(--Size-CornerRadius-L)"
            : "var(--Size-CornerRadius-L) var(--Size-CornerRadius-L) var(--Size-CornerRadius-L) var(--Size-CornerRadius-S)"};
    background: ${({ $isUser }) => ($isUser ? "var(--Color-Background-Bold)" : "var(--Color-Background-Default)")};
    color: ${({ $isUser }) => ($isUser ? "var(--Color-Text-Inverse)" : "var(--Color-Text-Default)")};
    box-shadow: ${({ $isUser }) => ($isUser ? "0 12px 24px rgba(17, 19, 22, 0.16)" : "var(--Color-Shadow-Card)")};
    white-space: pre-wrap;
`;

const EmptyState = styled.div`
    flex: 1;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXL);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--Size-Gap-L);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Icon-Action);
`;

const InputRow = styled.form`
    position: relative;
    padding: var(--Size-Padding-XL);
    border-top: 1px solid var(--Color-Border-Subtle);
    background: rgba(255, 255, 255, 0.86);
`;

const TextArea = styled.textarea`
    width: 100%;
    resize: none;
    min-height: 46px;
    max-height: 140px;
    padding: var(--Size-Padding-L) 48px var(--Size-Padding-L) var(--Size-Padding-XL);
    font-size: var(--body-3-d);
    font-family: var(--body-font);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    outline: none;
    transition: all var(--transition-fast);

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
    }
`;

const SendButton = styled.button`
    position: absolute;
    right: 28px;
    top: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
    background: var(--Color-Background-Action);
    border: none;
    border-radius: var(--Size-CornerRadius-M);
    color: var(--Color-Text-Inverse);
    transition: all var(--transition-fast);

    &:hover:not(:disabled) {
        background: var(--Color-Background-Action-Hover);
        transform: translateY(-50%) scale(1.03);
    }

    &:disabled {
        opacity: 0.42;
    }
`;

const Thinking = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
`;

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
            <Info>
                <Badge tone="neutral">
                    <Sparkles size={13} />
                    AI Chat
                </Badge>
            </Info>
            {messages.length === 0 && !sending ? (
                <EmptyState>
                    <div>
                        <EmptyIcon>
                            <Bot size={21} />
                        </EmptyIcon>
                        <H3 style={{ fontSize: "var(--subtitle-2-d)" }}>Ask about this meeting</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>
                            Questions and answers will appear here.
                        </Body3>
                    </div>
                </EmptyState>
            ) : (
                <Messages ref={scrollRef}>
                    {messages.map((m, index) => (
                        <Row key={m.id || `${m.role}-${index}`} $isUser={m.role === "user"}>
                            {m.role !== "user" && <Avatar name="AI" size="small" />}
                            <Bubble $isUser={m.role === "user"}>{m.content}</Bubble>
                        </Row>
                    ))}
                    {sending && (
                        <Row>
                            <Avatar name="AI" size="small" />
                            <Bubble>
                                <Thinking>
                                    <Sparkles size={13} />
                                    Thinking...
                                </Thinking>
                            </Bubble>
                        </Row>
                    )}
                </Messages>
            )}
            <InputRow onSubmit={handleSubmit}>
                <TextArea
                    rows={1}
                    placeholder="Ask a question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
                    }}
                />
                <SendButton type="submit" disabled={!question.trim() || sending} aria-label="Send message">
                    <Send size={17} />
                </SendButton>
            </InputRow>
        </Wrapper>
    );
};

export default ChatTab;
