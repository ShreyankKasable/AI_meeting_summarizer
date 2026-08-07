import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { ArrowLeft, Calendar, FileText, MessageSquareText, Share2, Sparkles } from "lucide-react";
import Button from "common/components/Button";
import Tabs from "common/components/Tabs";
import Badge from "common/components/Badge";
import { SkeletonBlock, SkeletonCard, SkeletonStack } from "common/components/Skeleton";
import { H1, H2, H3, Body2, Body3, Eyebrow, MonoLabel } from "common/global-styled-components";
import { formatDate, getTranscriptText } from "common/utils/utils";
import {
    fetchMeeting,
    toggleActionItem,
    exportToNotion,
    renameSpeaker,
} from "common/redux/actions/meetingActions";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import MeetingService from "services/meeting.service";
import TranscriptPane from "./TranscriptPane";
import ChatTab from "./ChatTab";
import SummaryTab from "./SummaryTab";
import ActionsTab from "./ActionsTab";

const Wrapper = styled.div`
    min-height: 100vh;
    padding: var(--Size-Padding-4XL) var(--Size-Padding-XXXL);

    @media (max-width: 768px) {
        padding: var(--Size-Padding-XXL) var(--Size-Padding-XL);
    }
`;

const Frame = styled.div`
    max-width: var(--layout-max);
    margin: 0 auto;
    display: grid;
    gap: var(--Size-Gap-XXXL);
`;

const Header = styled.header`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--Size-Gap-XXXL);
    align-items: start;
    padding-bottom: var(--Size-Padding-XXXL);
    border-bottom: 1px solid var(--Color-Border-Subtle);

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const TitleBlock = styled.div`
    display: grid;
    gap: var(--Size-Gap-L);
    min-width: 0;
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;

    @media (max-width: 980px) {
        justify-content: flex-start;
    }
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.62fr);
    gap: var(--Size-Gap-XXXL);
    align-items: start;

    @media (max-width: 1180px) {
        grid-template-columns: 1fr;
    }
`;

const TranscriptColumn = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const ColumnHeader = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--Size-Gap-XXL);
    flex-wrap: wrap;
`;

const IntelligencePanel = styled.aside`
    position: sticky;
    top: var(--Size-Gap-XXXL);
    min-width: 0;
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-Card);
    overflow: hidden;

    @media (max-width: 1180px) {
        position: static;
    }
`;

const PanelHeader = styled.div`
    display: grid;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-XXL);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    background: linear-gradient(180deg, var(--Color-Background-Default), var(--Color-Background-Subtle));
`;

const TabContent = styled.div`
    min-height: 580px;
    max-height: calc(100vh - 300px);
    overflow-y: auto;

    @media (max-width: 1180px) {
        max-height: none;
    }
`;

const EmptyState = styled.div`
    min-height: calc(100vh - 64px);
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXXL);
`;

const EmptyCard = styled(SkeletonCard)`
    max-width: 540px;
    width: 100%;
    display: grid;
    gap: var(--Size-Gap-L);
`;

const TABS = [
    { id: "summary", label: "Summary" },
    { id: "actions", label: "Actions" },
    { id: "chat", label: "AI Chat" },
];

const PANEL_TITLES = {
    summary: "Editorial Summary",
    actions: "Open Decisions & Actions",
    chat: "Meeting-Aware AI",
};

const PANEL_COPY = {
    summary: "A condensed readout of the meeting narrative, decisions, risks, and key themes.",
    actions: "Follow-up work extracted from the transcript with ownership and priority.",
    chat: "Ask targeted questions and keep the answer grounded in this meeting.",
};

const MeetingContentView = () => {
    const dispatch = useDispatch();
    const activeId = useSelector((state) => state.meetingDetails.activeId);
    const meeting = useSelector((state) =>
        state.meetingDetails.list.find((m) => m.id === activeId),
    );

    const [activeTab, setActiveTab] = useState("summary");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatSending, setChatSending] = useState(false);
    const [translatedText, setTranslatedText] = useState(null);
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        if (activeId) dispatch(fetchMeeting(activeId));
    }, [activeId, dispatch]);

    useEffect(() => {
        if (!activeId) return;
        MeetingService.getChatHistory(activeId).then(({ data }) => setChatMessages(data));
    }, [activeId]);

    if (!activeId) {
        return (
            <EmptyState>
                <EmptyCard>
                    <Eyebrow>No meeting selected</Eyebrow>
                    <H3>Open a meeting from the dashboard.</H3>
                    <Body2 style={{ color: "var(--Color-Text-Subtle)" }}>
                        The meeting workspace needs a selected recording before it can show transcript,
                        summary, actions, or chat.
                    </Body2>
                    <Button onClick={() => dispatch(setHostView(HOST_VIEWS.Dashboard))}>
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Button>
                </EmptyCard>
            </EmptyState>
        );
    }

    if (!meeting) {
        return (
            <Wrapper>
                <Frame>
                    <SkeletonStack>
                        <SkeletonBlock width="180px" height="14px" />
                        <SkeletonBlock width="52%" height="46px" />
                        <SkeletonBlock width="68%" height="16px" />
                    </SkeletonStack>
                </Frame>
            </Wrapper>
        );
    }

    const transcriptText = getTranscriptText(meeting.transcript);
    const actionCount = (meeting.action_items || []).length;

    const handleSendChat = async (question) => {
        setChatMessages((prev) => [...prev, { role: "user", content: question }]);
        setChatSending(true);
        try {
            const { data } = await MeetingService.sendChatMessage(activeId, question);
            setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
        } finally {
            setChatSending(false);
        }
    };

    const handleTranslate = async (language) => {
        setTranslating(true);
        try {
            const { data } = await MeetingService.translate(activeId, language);
            setTranslatedText(data.translated_transcript);
        } finally {
            setTranslating(false);
        }
    };

    const handleExportNotion = async () => {
        try {
            await dispatch(exportToNotion(activeId));
        } catch {
            // The thunk shows the failure toast.
        }
    };

    const handleRenameSpeaker = async (speaker, name) => {
        try {
            await dispatch(renameSpeaker(activeId, speaker, name));
        } catch {
            // The thunk shows the failure toast.
        }
    };

    const handleToggleActionItem = async (itemId) => {
        try {
            await dispatch(toggleActionItem(activeId, itemId));
        } catch {
            // The thunk shows the failure toast.
        }
    };

    return (
        <Wrapper>
            <Frame>
                <Header>
                    <TitleBlock>
                        <Button
                            type="button"
                            mode="ghost"
                            size="small"
                            onClick={() => dispatch(setHostView(HOST_VIEWS.Dashboard))}
                            style={{ width: "fit-content", paddingLeft: 0 }}
                        >
                            <ArrowLeft size={16} />
                            Dashboard
                        </Button>
                        <Eyebrow>Meeting dossier</Eyebrow>
                        <H1>{meeting.title}</H1>
                        <MetaRow>
                            <Badge tone="neutral">
                                <Calendar size={13} />
                                {formatDate(meeting.start_time)}
                            </Badge>
                            <Badge tone={meeting.summary ? "success" : "warning"}>
                                <Sparkles size={13} />
                                {meeting.summary ? "Summary ready" : "Processing"}
                            </Badge>
                            <Badge tone="neutral">
                                <FileText size={13} />
                                {actionCount} actions
                            </Badge>
                        </MetaRow>
                    </TitleBlock>
                    <HeaderActions>
                        <Button mode="secondary" onClick={handleExportNotion}>
                            <FileText size={16} />
                            Export to Notion
                        </Button>
                        <Button onClick={() => dispatch(setHostView(HOST_VIEWS.Share))}>
                            <Share2 size={16} />
                            Share
                        </Button>
                    </HeaderActions>
                </Header>

                <ContentGrid>
                    <TranscriptColumn>
                        <ColumnHeader>
                            <div>
                                <MonoLabel>Transcript</MonoLabel>
                                <H2 style={{ marginTop: "var(--Size-Gap-S)" }}>Source Record</H2>
                            </div>
                            <Body3 style={{ maxWidth: 420 }}>
                                Speaker turns, search, translation, and audio remain connected to the
                                original meeting record.
                            </Body3>
                        </ColumnHeader>
                        <TranscriptPane
                            text={translatedText ?? transcriptText}
                            segments={translatedText ? null : meeting.transcript?.segments}
                            speakerNames={meeting.transcript?.speakerNames}
                            audioSrc={meeting.audio_file_path}
                            onTranslate={handleTranslate}
                            translating={translating}
                            editable
                            onRenameSpeaker={handleRenameSpeaker}
                        />
                    </TranscriptColumn>

                    <IntelligencePanel>
                        <PanelHeader>
                            <Badge tone="action">
                                <MessageSquareText size={13} />
                                Intelligence
                            </Badge>
                            <H3>{PANEL_TITLES[activeTab]}</H3>
                            <Body3>{PANEL_COPY[activeTab]}</Body3>
                        </PanelHeader>
                        <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
                        <TabContent>
                            {activeTab === "summary" && <SummaryTab summary={meeting.summary} />}
                            {activeTab === "actions" && (
                                <ActionsTab
                                    items={meeting.action_items}
                                    onToggle={handleToggleActionItem}
                                />
                            )}
                            {activeTab === "chat" && (
                                <ChatTab
                                    messages={chatMessages}
                                    onSend={handleSendChat}
                                    sending={chatSending}
                                />
                            )}
                        </TabContent>
                    </IntelligencePanel>
                </ContentGrid>
            </Frame>
        </Wrapper>
    );
};

export default MeetingContentView;
