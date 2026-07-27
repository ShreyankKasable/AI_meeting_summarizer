import React from "react";
import styled from "styled-components";
import { FileText } from "lucide-react";
import { H3, Body3 } from "common/global-styled-components";

const Wrapper = styled.div`
    padding: var(--Size-Padding-XXL);
`;

const EmptyState = styled.div`
    min-height: 220px;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXL);
    border: 1px dashed var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XL);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--Size-Gap-L);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Accent-Info);
    color: var(--Color-Icon-Info);
`;

const MarkdownBody = styled.div`
    color: var(--Color-Text-Default);
    font-size: var(--body-2-d);
    line-height: var(--line-height-160);

    > *:first-child {
        margin-top: 0;
    }

    > *:last-child {
        margin-bottom: 0;
    }

    h2,
    h3,
    h4 {
        margin: var(--Size-Gap-XXL) 0 var(--Size-Gap-M);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-weight: var(--bold);
        line-height: var(--line-height-120);
    }

    h2 {
        font-size: var(--subtitle-1-d);
    }

    h3 {
        font-size: var(--subtitle-2-d);
    }

    h4 {
        font-size: var(--body-2-d);
    }

    p {
        margin: 0 0 var(--Size-Gap-L);
    }

    ul,
    ol {
        margin: 0 0 var(--Size-Gap-XL);
        padding-left: 22px;
    }

    li {
        margin: var(--Size-Gap-S) 0;
        padding-left: var(--Size-Gap-S);
    }

    strong {
        color: var(--Color-Text-Bold);
        font-weight: var(--bold);
    }

    em {
        color: var(--Color-Text-Default);
    }

    code {
        padding: 1px 5px;
        border-radius: var(--Size-CornerRadius-S);
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Bold);
        font-family: var(--mono-font);
        font-size: 0.92em;
    }

    blockquote {
        margin: 0 0 var(--Size-Gap-XL);
        padding: var(--Size-Padding-M) var(--Size-Padding-XL);
        border-left: 3px solid var(--Color-Border-Action);
        border-radius: var(--Size-CornerRadius-M);
        background: var(--Color-Background-Accent-Action);
        color: var(--Color-Text-Default);
    }
`;

function renderInline(text) {
    const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    const nodes = [];
    let lastIndex = 0;
    let match = pattern.exec(text);

    while (match) {
        if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

        const token = match[0];
        const key = `${match.index}-${token}`;
        if (token.startsWith("**")) {
            nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith("`")) {
            nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
        } else {
            nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
        }

        lastIndex = match.index + token.length;
        match = pattern.exec(text);
    }

    if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
    return nodes;
}

function readParagraph(lines, startIndex) {
    const paragraph = [];
    let index = startIndex;

    while (
        index < lines.length &&
        lines[index].trim() &&
        !/^(#{1,4})\s+/.test(lines[index]) &&
        !/^[-*]\s+/.test(lines[index]) &&
        !/^\d+\.\s+/.test(lines[index]) &&
        !/^>\s?/.test(lines[index])
    ) {
        paragraph.push(lines[index].trim());
        index += 1;
    }

    return { text: paragraph.join(" "), index };
}

function renderMarkdown(markdown) {
    const lines = String(markdown || "")
        .replace(/\r\n/g, "\n")
        .split("\n");
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index].trim();

        if (!line) {
            index += 1;
        } else if (/^(#{1,4})\s+/.test(line)) {
            const heading = line.match(/^(#{1,4})\s+(.+)$/);
            const level = Math.min(heading[1].length, 4);
            const Tag = `h${Math.max(level, 2)}`;
            blocks.push(<Tag key={`heading-${index}`}>{renderInline(heading[2])}</Tag>);
            index += 1;
        } else if (/^[-*]\s+/.test(line)) {
            const items = [];
            while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
                items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
                index += 1;
            }
            blocks.push(
                <ul key={`ul-${index}`}>
                    {items.map((item, itemIndex) => (
                        <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
                    ))}
                </ul>,
            );
        } else if (/^\d+\.\s+/.test(line)) {
            const items = [];
            while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
                items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
                index += 1;
            }
            blocks.push(
                <ol key={`ol-${index}`}>
                    {items.map((item, itemIndex) => (
                        <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
                    ))}
                </ol>,
            );
        } else if (/^>\s?/.test(line)) {
            const quotes = [];
            while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
                quotes.push(lines[index].trim().replace(/^>\s?/, ""));
                index += 1;
            }
            blocks.push(
                <blockquote key={`quote-${index}`}>{renderInline(quotes.join(" "))}</blockquote>,
            );
        } else {
            const paragraph = readParagraph(lines, index);
            blocks.push(<p key={`p-${index}`}>{renderInline(paragraph.text)}</p>);
            index = paragraph.index;
        }
    }

    return blocks;
}

const SummaryTab = ({ summary }) => {
    if (!summary) {
        return (
            <Wrapper>
                <EmptyState>
                    <div>
                        <EmptyIcon>
                            <FileText size={20} />
                        </EmptyIcon>
                        <H3 style={{ fontSize: "var(--subtitle-2-d)" }}>No summary yet</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>
                            The summary will appear after processing.
                        </Body3>
                    </div>
                </EmptyState>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <MarkdownBody>{renderMarkdown(summary)}</MarkdownBody>
        </Wrapper>
    );
};

export default SummaryTab;
