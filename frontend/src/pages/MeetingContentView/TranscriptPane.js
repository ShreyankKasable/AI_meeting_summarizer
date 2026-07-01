import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Search, Download } from "lucide-react";
import { Body2, Body3 } from "common/global-styled-components";
import { SUPPORTED_LANGUAGES } from "common/constants";
import AudioScrubber from "./AudioScrubber";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--Color-Background-Default);
    border-radius: var(--Size-CornerRadius-XL);
    border: 1px solid var(--Color-Border-Subtle);
    overflow: hidden;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    border-bottom: 1px solid var(--Color-Border-Subtle);
`;

const Title = styled(Body2)`
    font-weight: var(--bold);
`;

const Select = styled.select`
    font-size: var(--body-4-d);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    padding: var(--Size-Padding-S) var(--Size-Padding-M);
    background: var(--Color-Background-Default);
`;

const SearchBox = styled.div`
    position: relative;
    flex: 1;
    max-width: 220px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: var(--Size-Padding-S) var(--Size-Padding-S) var(--Size-Padding-S) 30px;
    font-size: var(--body-4-d);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    outline: none;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--Color-Icon-Subtle);
    display: flex;
`;

const IconButton = styled.button`
    background: none;
    border: none;
    color: var(--Color-Icon-Subtle);
    display: flex;
`;

const Body = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: var(--Size-Padding-XL);
`;

const Highlight = styled.mark`
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Text-Action);
`;

function highlight(text, term) {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
    return parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? <Highlight key={i}>{part}</Highlight> : part,
    );
}

function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// `text` is the (possibly translated) transcript to display; `onTranslate`
// is called with a language code when the dropdown changes.
const TranscriptPane = ({ text, audioSrc, onTranslate, translating = false }) => {
    const [search, setSearch] = useState("");
    const [language, setLanguage] = useState("");

    const content = useMemo(() => highlight(text || "No transcript available yet.", search), [text, search]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        if (lang) onTranslate?.(lang);
    };

    return (
        <Wrapper>
            <Header>
                <Title>Transcript</Title>
                <Select value={language} onChange={handleLanguageChange}>
                    <option value="">English (original)</option>
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                        <option key={code} value={code}>
                            {name}
                        </option>
                    ))}
                </Select>
                <SearchBox>
                    <SearchIcon>
                        <Search size={14} />
                    </SearchIcon>
                    <SearchInput
                        placeholder="Search transcript..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </SearchBox>
                <IconButton
                    type="button"
                    title="Download transcript"
                    onClick={() => downloadText("transcript.txt", text || "")}
                >
                    <Download size={16} />
                </IconButton>
            </Header>
            <Body>
                {translating ? (
                    <Body3>Translating...</Body3>
                ) : (
                    <Body2 style={{ whiteSpace: "pre-wrap", lineHeight: "var(--line-height-140)" }}>{content}</Body2>
                )}
            </Body>
            {audioSrc && <AudioScrubber src={audioSrc} />}
        </Wrapper>
    );
};

export default TranscriptPane;
