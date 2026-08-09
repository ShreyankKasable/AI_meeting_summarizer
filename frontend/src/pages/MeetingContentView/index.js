import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { ArrowLeft, Calendar, Clock3, FileText, Share2, Sparkles } from "lucide-react";
import Button from "common/components/Button";
import Tabs from "common/components/Tabs";
import Badge from "common/components/Badge";
import Modal from "common/components/Modal";
import { SkeletonBlock, SkeletonCard, SkeletonStack } from "common/components/Skeleton";
import { H1, H3, Body2, Body3, Eyebrow, MonoLabel } from "common/global-styled-components";
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
    background: var(--Color-Background-Root);
`;

const Frame = styled.div`
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: var(--Size-Padding-XXXL) var(--Size-Padding-4XL) var(--Size-Padding-4XL);

    @media (max-width: 768px) {
        padding: var(--Size-Padding-XXL) var(--Size-Padding-XL);
    }
`;

const Header = styled.header`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--Size-Gap-XXXL);
    align-items: start;
    padding-bottom: var(--Size-Padding-XXL);
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
    gap: var(--Size-Gap-L);
    flex-wrap: wrap;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;

    button {
        font-size: var(--body-4-d);
        line-height: var(--line-height-140);
    }

    @media (max-width: 980px) {
        justify-content: flex-start;
    }
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
    gap: var(--Size-Gap-4XL);
    align-items: start;

    @media (max-width: 1180px) {
        grid-template-columns: 1fr;
    }
`;

const MeetingDocument = styled.section`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-4XL);
`;

const TranscriptColumn = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-XXL);
`;

const TranscriptHeading = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-L);
    flex-wrap: wrap;
`;

const SummaryTrigger = styled.button`
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--Size-Gap-S);
    padding: 0 var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Accent-Action);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Text-Action);
    font-family: var(--body-font);
    font-size: var(--body-5-d);
    line-height: var(--line-height-140);
    font-weight: var(--medium);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    box-shadow: 0 10px 20px rgba(120, 86, 0, 0.08);
    transition: all var(--transition-fast);

    &:hover {
        border-color: var(--Color-Border-Action);
        background: var(--Color-Background-Action-Soft);
        transform: translateY(-1px);
    }

    svg {
        flex-shrink: 0;
    }
`;

const IntelligencePanel = styled.aside`
    position: sticky;
    top: var(--Size-Gap-XXXL);
    min-width: 0;
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-S);
    box-shadow: var(--Color-Shadow-Card);
    overflow: hidden;
    height: calc(100vh - 64px);
    min-height: 560px;
    display: flex;
    flex-direction: column;

    [role="tab"] {
        font-family: var(--mono-font);
        font-size: var(--body-5-d);
        line-height: var(--line-height-140);
        font-weight: var(--medium);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
    }

    @media (max-width: 1180px) {
        position: static;
        height: auto;
        min-height: 560px;
    }
`;

const TabContent = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 1180px) {
        max-height: none;
    }
`;

const SummaryModalContent = styled.div`
    min-height: min(680px, calc(90vh - 120px));
    max-height: calc(90vh - 96px);
    overflow-y: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
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
    { id: "chat", label: "AI Chat" },
    { id: "actions", label: "Actions" },
];

const MeetingContentView = () => {
    const dispatch = useDispatch();
    const activeId = useSelector((state) => state.meetingDetails.activeId);
    const meeting = useSelector((state) =>
        state.meetingDetails.list.find((m) => m.id === activeId),
    );

    const [activeTab, setActiveTab] = useState("chat");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatSending, setChatSending] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [translatedText, setTranslatedText] = useState(null);
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        if (activeId) dispatch(fetchMeeting(activeId));
    }, [activeId, dispatch]);

    useEffect(() => {
        if (!activeId) return;
        MeetingService.getChatHistory(activeId).then(({ data }) => setChatMessages(data));
    }, [activeId]);

    useEffect(() => {
        if (!TABS.some((tab) => tab.id === activeTab)) setActiveTab("chat");
    }, [activeTab]);

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
                <ContentGrid>
                    <MeetingDocument>
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
                                    Back to Meetings
                                </Button>
                                <H1>{meeting.title}</H1>
                                <MetaRow>
                                    <Body3 as="span" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <Calendar size={13} />
                                        {formatDate(meeting.start_time)}
                                    </Body3>
                                    <Body3 as="span" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <Clock3 size={13} />
                                        Recorded
                                    </Body3>
                                    <Badge tone="neutral">
                                        <FileText size={13} />
                                        {actionCount} Actions
                                    </Badge>
                                </MetaRow>
                            </TitleBlock>
                            <HeaderActions>
                                <Button mode="secondary" size="small" onClick={handleExportNotion}>
                                    <FileText size={14} />
                                    Export to Notion
                                </Button>
                                <Button size="small" onClick={() => dispatch(setHostView(HOST_VIEWS.Share))}>
                                    <Share2 size={14} />
                                    Share
                                </Button>
                            </HeaderActions>
                        </Header>

                        <TranscriptColumn>
                            <TranscriptHeading>
                                <MonoLabel>Transcript</MonoLabel>
                                <SummaryTrigger type="button" onClick={() => setSummaryOpen(true)}>
                                    <Sparkles size={13} />
                                    Summarize
                                </SummaryTrigger>
                            </TranscriptHeading>
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
                    </MeetingDocument>

                    <IntelligencePanel>
                        <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
                        <TabContent>
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
            {summaryOpen && (
                <Modal
                    title="Meeting Summary"
                    onClose={() => setSummaryOpen(false)}
                    width="min(1080px, calc(100vw - 48px))"
                    bare
                >
                    <SummaryModalContent>
                        <SummaryTab summary={meeting.summary} />
                    </SummaryModalContent>
                </Modal>
            )}
        </Wrapper>
    );
};

export default MeetingContentView;
