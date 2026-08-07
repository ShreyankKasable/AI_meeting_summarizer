import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Download, Languages, Loader2, Pencil, Search } from "lucide-react";
import { H3, Body2, Body3 } from "common/global-styled-components";
import { SUPPORTED_LANGUAGES } from "common/constants";
import Avatar from "common/components/Avatar";
import Badge from "common/components/Badge";
import { SkeletonBlock, SkeletonStack } from "common/components/Skeleton";
import AudioScrubber from "./AudioScrubber";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: min(860px, calc(100vh - 260px));
    background: var(--Color-Background-Default);
    border-radius: var(--Size-CornerRadius-M);
    border: 1px solid var(--Color-Border-Subtle);
    box-shadow: var(--Color-Shadow-Card);
    overflow: hidden;

    @media (max-width: 1180px) {
        height: auto;
        min-height: 620px;
    }
`;

const Header = styled.div`
    display: grid;
    grid-template-columns: minmax(180px, 1fr) auto;
    align-items: center;
    gap: var(--Size-Gap-XL);
    padding: var(--Size-Padding-XL) var(--Size-Padding-XXL);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    background: var(--Color-Background-Default);

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
        align-items: stretch;
    }
`;

const TitleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;

    @media (max-width: 760px) {
        justify-content: stretch;
    }
`;

const SelectWrap = styled.div`
    position: relative;
    min-width: 178px;

    svg {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--Color-Icon-Subtle);
        pointer-events: none;
    }
`;

const Select = styled.select`
    width: 100%;
    min-height: 38px;
    padding: 0 32px 0 34px;
    font-size: var(--body-3-d);
    color: var(--Color-Text-Default);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
    outline: none;

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
    }
`;

const SearchBox = styled.div`
    position: relative;
    width: 230px;

    @media (max-width: 760px) {
        width: 100%;
        flex: 1;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    min-height: 38px;
    padding: 0 var(--Size-Padding-L) 0 34px;
    font-size: var(--body-3-d);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Bold);
    outline: none;

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--Color-Icon-Subtle);
    display: flex;
`;

const IconButton = styled.button`
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    color: var(--Color-Icon-Subtle);
    transition: all var(--transition-fast);

    &:hover {
        color: var(--Color-Text-Bold);
        border-color: var(--Color-Border-Bold);
        transform: translateY(-1px);
    }
`;

const Body = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--Size-Padding-XXL);
`;

const Highlight = styled.mark`
    background: rgba(247, 189, 72, 0.34);
    color: var(--Color-Text-Bold);
    border-radius: var(--Size-CornerRadius-XS);
    padding: 0 2px;
`;

const Turn = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-L);
    border-radius: var(--Size-CornerRadius-L);
    transition: background var(--transition-fast);

    &:hover {
        background: var(--Color-Background-Subtle);
    }

    & + & {
        margin-top: var(--Size-Gap-M);
    }
`;

const TurnBody = styled.div`
    flex: 1;
    min-width: 0;
`;

const TurnHeader = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    flex-wrap: wrap;
`;

const SpeakerName = styled(Body2)`
    font-weight: var(--bold);
    color: var(--Color-Text-Bold);
`;

const Timestamp = styled(Body3)`
    font-family: var(--mono-font);
    color: var(--Color-Text-Subtlest);
`;

const RenameButton = styled.button`
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: var(--Size-CornerRadius-S);
    color: var(--Color-Icon-Subtle);

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Bold);
    }
`;

const RenameInput = styled.input`
    min-height: 30px;
    font-size: var(--body-3-d);
    font-weight: var(--bold);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-S);
    background: var(--Color-Background-Default);
    color: var(--Color-Text-Bold);
    padding: 0 var(--Size-Padding-M);
    outline: none;

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
    }
`;

const FlatTranscript = styled(Body2)`
    white-space: pre-wrap;
    line-height: var(--line-height-160);
`;

const EmptyState = styled.div`
    min-height: 260px;
    display: grid;
    place-items: center;
    border: 1px dashed var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XL);
    text-align: center;
`;

const Spinner = styled.span`
    display: inline-flex;
    animation: meetai-spin 0.9s linear infinite;
`;

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
                    {typeof segment.start === "number" && <Timestamp>{formatSeconds(segment.start)}</Timestamp>}
                    {editable && !editing && (
                        <RenameButton type="button" title="Rename speaker" onClick={startEdit} aria-label="Rename speaker">
                            <Pencil size={12} />
                        </RenameButton>
                    )}
                </TurnHeader>
                <Body2 style={{ marginTop: "var(--Size-Gap-S)" }}>{highlight(segment.text, search)}</Body2>
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
                <TitleGroup>
                    <H3 style={{ fontSize: "var(--subtitle-2-d)" }}>Transcript</H3>
                    {translating && (
                        <Badge tone="info">
                            <Spinner>
                                <Loader2 size={13} />
                            </Spinner>
                            Translating
                        </Badge>
                    )}
                </TitleGroup>
                <Controls>
                    <SelectWrap>
                        <Languages size={15} />
                        <Select value={language} onChange={handleLanguageChange} disabled={translating}>
                            <option value="">English</option>
                            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {name}
                                </option>
                            ))}
                        </Select>
                    </SelectWrap>
                    <SearchBox>
                        <SearchIcon>
                            <Search size={15} />
                        </SearchIcon>
                        <SearchInput
                            placeholder="Search transcript"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </SearchBox>
                    <IconButton
                        type="button"
                        title="Download transcript"
                        aria-label="Download transcript"
                        onClick={() => downloadText("transcript.txt", flatDownloadText)}
                    >
                        <Download size={16} />
                    </IconButton>
                </Controls>
            </Header>
            <Body>
                {translating ? (
                    <SkeletonStack>
                        <SkeletonBlock height="16px" width="92%" />
                        <SkeletonBlock height="16px" width="76%" />
                        <SkeletonBlock height="16px" width="88%" />
                        <SkeletonBlock height="16px" width="62%" />
                    </SkeletonStack>
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
                ) : text ? (
                    <FlatTranscript>{content}</FlatTranscript>
                ) : (
                    <EmptyState>
                        <Body3>No transcript available yet.</Body3>
                    </EmptyState>
                )}
            </Body>
            {audioSrc && <AudioScrubber src={audioSrc} />}
        </Wrapper>
    );
};

export default TranscriptPane;
