import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Search, Download, Pencil } from "lucide-react";
import { Body2, Body3 } from "common/global-styled-components";
import { SUPPORTED_LANGUAGES } from "common/constants";
import Avatar from "common/components/Avatar";
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

const Turn = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);

    & + & {
        margin-top: var(--Size-Gap-L);
    }
`;

const TurnBody = styled.div`
    flex: 1;
    min-width: 0;
`;

const TurnHeader = styled.div`
    display: flex;
    align-items: baseline;
    gap: var(--Size-Gap-S);
`;

const SpeakerName = styled(Body2)`
    font-weight: var(--bold);
`;

const Timestamp = styled(Body3)`
    color: var(--Color-Text-Subtlest);
`;

const RenameButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    display: inline-flex;
    color: var(--Color-Icon-Subtle);
`;

const RenameInput = styled.input`
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-S);
    padding: 2px var(--Size-Padding-S);
`;

// One speaker turn: avatar, name (editable in host view via the pencil icon),
// timestamp, and the spoken text for that turn.
const SpeakerTurn = ({ segment, displayName, search, editable, onRename }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(displayName);

    const startEdit = () => {
        setDraft(displayName);
        setEditing(true);
    };

    const save = () => {
        setEditing(false);
        const trimmed = draft.trim();
        if (trimmed && trimmed !== displayName) onRename?.(segment.speaker, trimmed);
    };

    return (
        <Turn>
            <Avatar name={displayName} size="small" />
            <TurnBody>
                <TurnHeader>
                    {editing ? (
                        <RenameInput
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={save}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") save();
                                if (e.key === "Escape") setEditing(false);
                            }}
                        />
                    ) : (
                        <SpeakerName>{displayName}</SpeakerName>
                    )}
                    {typeof segment.start === "number" && (
                        <Timestamp>{formatSeconds(segment.start)}</Timestamp>
                    )}
                    {editable && !editing && (
                        <RenameButton type="button" title="Rename speaker" onClick={startEdit}>
                            <Pencil size={12} />
                        </RenameButton>
                    )}
                </TurnHeader>
                <Body2 style={{ marginTop: 2 }}>{highlight(segment.text, search)}</Body2>
            </TurnBody>
        </Turn>
    );
};

function formatSeconds(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${String(rem).padStart(2, "0")}`;
}

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
// is called with a language code when the dropdown changes. `segments` (when
// present and no translation is active) renders speaker-attributed turns
// instead of a flat paragraph; `editable` shows the rename-speaker affordance
// (host view only — participants get a read-only transcript).
const TranscriptPane = ({
    text,
    segments,
    speakerNames = {},
    audioSrc,
    onTranslate,
    translating = false,
    editable = false,
    onRenameSpeaker,
}) => {
    const [search, setSearch] = useState("");
    const [language, setLanguage] = useState("");

    const showTurns = Array.isArray(segments) && segments.length > 0;

    const content = useMemo(() => highlight(text || "No transcript available yet.", search), [text, search]);
    const flatDownloadText = useMemo(() => {
        if (!showTurns) return text || "";
        return segments.map((s) => `${speakerNames[s.speaker] || s.speaker}: ${s.text}`).join("\n\n");
    }, [showTurns, segments, speakerNames, text]);

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
                    onClick={() => downloadText("transcript.txt", flatDownloadText)}
                >
                    <Download size={16} />
                </IconButton>
            </Header>
            <Body>
                {translating ? (
                    <Body3>Translating...</Body3>
                ) : showTurns ? (
                    segments.map((segment, i) => (
                        <SpeakerTurn
                            key={i}
                            segment={segment}
                            displayName={speakerNames[segment.speaker] || segment.speaker}
                            search={search}
                            editable={editable}
                            onRename={onRenameSpeaker}
                        />
                    ))
                ) : (
                    <Body2 style={{ whiteSpace: "pre-wrap", lineHeight: "var(--line-height-140)" }}>{content}</Body2>
                )}
            </Body>
            {audioSrc && <AudioScrubber src={audioSrc} />}
        </Wrapper>
    );
};

export default TranscriptPane;
