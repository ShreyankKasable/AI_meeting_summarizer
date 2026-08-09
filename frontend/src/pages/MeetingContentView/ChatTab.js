import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Bot, CornerDownLeft, Send, Sparkles } from "lucide-react";
import Badge from "common/components/Badge";
import { H3, Body3 } from "common/global-styled-components";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 580px;
    font-family: var(--body-font);
`;

const Suggestions = styled.div`
    display: grid;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-XXL) var(--Size-Padding-XXL) 0;
`;

const SuggestionGrid = styled.div`
    display: grid;
    gap: var(--Size-Gap-M);
`;

const PromptButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-L);
    min-height: 44px;
    padding: 0 var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Default);
    font-family: var(--body-font);
    font-size: var(--body-3-d);
    line-height: var(--line-height-140);
    font-weight: var(--medium);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    text-align: left;
    transition: all var(--transition-fast);

    &:hover {
        background: var(--Color-Background-Default);
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Card);
    }

    svg {
        flex-shrink: 0;
        color: var(--Color-Icon-Action);
    }
`;

const Messages = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--Size-Padding-XXL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XL);
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const Row = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
    align-items: flex-start;
`;

const BubbleStack = styled.div`
    max-width: 82%;
    display: grid;
    gap: var(--Size-Gap-S);
`;

const Bubble = styled(Body3)`
    width: fit-content;
    max-width: 100%;
    padding: 8px 14px;
    font-family: var(--body-font);
    font-size: var(--body-5-d);
    line-height: var(--line-height-160);
    font-weight: var(--medium);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    border: 1px solid
        ${({ $isUser }) => ($isUser ? "rgba(120, 86, 0, 0.08)" : "var(--Color-Border-Subtle)")};
    border-radius: ${({ $isUser }) => ($isUser ? "20px 6px 20px 20px" : "6px 20px 20px 20px")};
    background: ${({ $isUser }) =>
        $isUser ? "var(--Color-Background-Action-Soft)" : "var(--Color-Background-Subtle)"};
    color: var(--Color-Text-Default);
    box-shadow: ${({ $isUser }) => ($isUser ? "0 8px 18px rgba(120, 86, 0, 0.08)" : "none")};
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
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Icon-Action);
`;

const InputRow = styled.form`
    position: relative;
    padding: var(--Size-Padding-XL);
    border-top: 1px solid var(--Color-Border-Subtle);
    background: var(--Color-Background-Default);
`;

const TextArea = styled.textarea`
    width: 100%;
    resize: none;
    min-height: 46px;
    max-height: 140px;
    padding: var(--Size-Padding-L) 48px var(--Size-Padding-L) var(--Size-Padding-XL);
    font-size: var(--body-5-d);
    font-family: var(--body-font);
    line-height: var(--line-height-140);
    font-weight: var(--regular);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Bold);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    outline: none;
    transition: all var(--transition-fast);

    &::placeholder {
        color: var(--Color-Text-Subtlest);
    }

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
        background: var(--Color-Background-Default);
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

const PROMPTS = [
    "What decisions were made?",
    "List open risks from the conversation.",
    "Draft a follow-up email.",
];

const ChatTab = ({ messages = [], onSend, sending = false }) => {
    const [question, setQuestion] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendQuestion = (value) => {
        if (!value.trim() || sending) return;
        onSend(value.trim());
        setQuestion("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendQuestion(question);
    };

    return (
        <Wrapper>
            {messages.length === 0 && !sending && (
                <Suggestions>
                    <Badge tone="neutral">
                        <Sparkles size={13} />
                        Suggested prompts
                    </Badge>
                    <SuggestionGrid>
                        {PROMPTS.map((prompt) => (
                            <PromptButton key={prompt} type="button" onClick={() => sendQuestion(prompt)}>
                                {prompt}
                                <CornerDownLeft size={14} />
                            </PromptButton>
                        ))}
                    </SuggestionGrid>
                </Suggestions>
            )}
            {messages.length === 0 && !sending ? (
                <EmptyState>
                    <div>
                        <EmptyIcon>
                            <Bot size={21} />
                        </EmptyIcon>
                        <H3 style={{ fontSize: "var(--subtitle-2-d)" }}>Ask about this meeting</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>
                            Questions, answers, and transcript-grounded notes will appear here.
                        </Body3>
                    </div>
                </EmptyState>
            ) : (
                <Messages ref={scrollRef}>
                    {messages.map((m, index) => (
                        <Row key={m.id || `${m.role}-${index}`} $isUser={m.role === "user"}>
                            <BubbleStack>
                                <Bubble $isUser={m.role === "user"}>{m.content}</Bubble>
                            </BubbleStack>
                        </Row>
                    ))}
                    {sending && (
                        <Row>
                            <BubbleStack>
                                <Bubble>
                                    <Thinking>
                                        <Sparkles size={13} />
                                        Thinking...
                                    </Thinking>
                                </Bubble>
                            </BubbleStack>
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
