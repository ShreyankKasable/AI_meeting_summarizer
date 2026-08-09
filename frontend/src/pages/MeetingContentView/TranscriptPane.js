import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Languages, Loader2, Pencil, Search } from "lucide-react";
import { Body2, Body3 } from "common/global-styled-components";
import { SUPPORTED_LANGUAGES } from "common/constants";
import Avatar from "common/components/Avatar";
import Badge from "common/components/Badge";
import { SkeletonBlock, SkeletonStack } from "common/components/Skeleton";
import AudioScrubber from "./AudioScrubber";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: min(760px, calc(100vh - 230px));
    overflow: visible;

    @media (max-width: 1180px) {
        height: auto;
        min-height: 620px;
    }
`;

const Header = styled.div`
    display: grid;
    grid-template-columns: minmax(220px, 1fr) auto;
    align-items: center;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XXL);

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
        align-items: stretch;
    }
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
    min-width: 160px;

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
    height: 44px;
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
    width: 100%;

    @media (max-width: 760px) {
        width: 100%;
        flex: 1;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    height: 44px;
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

const Body = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 var(--Size-Padding-M) var(--Size-Padding-XXL) 18px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const Timeline = styled.div`
    position: relative;
    min-height: 100%;
    border-left: 1px solid var(--Color-Border-Subtle);
    padding-bottom: var(--Size-Padding-XXXL);
`;

const Highlight = styled.mark`
    background: rgba(247, 189, 72, 0.34);
    color: var(--Color-Text-Bold);
    border-radius: var(--Size-CornerRadius-XS);
    padding: 0 2px;
`;

const Turn = styled.div`
    position: relative;
    padding: 0 0 var(--Size-Padding-XXL) 40px;
    transition: background var(--transition-fast);

    &:hover {
        background: rgba(244, 244, 242, 0.58);
    }
`;

const AvatarPin = styled.div`
    position: absolute;
    left: -18px;
    top: 0;
    padding: 2px;
    border-radius: var(--Size-CornerRadius-Full);
    background: var(--Color-Background-Root);
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
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    font-weight: var(--bold);
    color: var(--Color-Text-Bold);
`;

const Timestamp = styled(Body3)`
    font-family: var(--mono-font);
    font-size: var(--caption-d);
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
    font-size: var(--body-4-d);
    white-space: pre-wrap;
    line-height: var(--line-height-160);
    padding-left: 40px;
`;

const TranscriptText = styled(Body3)`
    margin-top: var(--Size-Gap-S);
    font-size: var(--body-4-d);
    line-height: var(--line-height-160);
    font-weight: var(--regular);
    color: var(--Color-Text-Default);
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
            <AvatarPin>
                <Avatar name={displayName} size="small" />
            </AvatarPin>
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
                <TranscriptText>{highlight(segment.text, search)}</TranscriptText>
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
    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        onTranslate?.(lang);
    };

    return (
        <Wrapper>
            <Header>
                <SearchBox>
                    <SearchIcon>
                        <Search size={15} />
                    </SearchIcon>
                    <SearchInput
                        placeholder="Search transcript..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </SearchBox>
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
                    {translating && (
                        <Badge tone="info">
                            <Spinner>
                                <Loader2 size={13} />
                            </Spinner>
                            Translating
                        </Badge>
                    )}
                </Controls>
            </Header>
            <Body>
                <Timeline>
                    {translating ? (
                        <SkeletonStack style={{ paddingLeft: 40 }}>
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
                </Timeline>
            </Body>
            {audioSrc && <AudioScrubber src={audioSrc} />}
        </Wrapper>
    );
};

export default TranscriptPane;
