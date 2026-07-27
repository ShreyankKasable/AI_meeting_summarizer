import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Calendar, FileText, Share2 } from "lucide-react";
import Button from "common/components/Button";
import Tabs from "common/components/Tabs";
import Badge from "common/components/Badge";
import { SkeletonBlock, SkeletonCard, SkeletonStack } from "common/components/Skeleton";
import { H1, H3, Body2 } from "common/global-styled-components";
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
    height: 100vh;
    padding: var(--Size-Padding-XXXL);
    display: flex;
    flex-direction: column;
    min-width: 0;

    @media (max-width: 1024px) {
        height: auto;
    }

    @media (max-width: 640px) {
        padding: var(--Size-Padding-XL);
    }
`;

const Header = styled.div`
    display: grid;
    align-items: start;
    gap: var(--Size-Gap-XL);
    margin-bottom: var(--Size-Gap-XXL);
`;

const TitleBlock = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-M);
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-3-d);
`;

const Actions = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    justify-content: flex-start;
    flex-wrap: wrap;
`;

const Split = styled.div`
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(340px, 0.78fr);
    gap: var(--Size-Gap-XXL);

    @media (max-width: 1120px) {
        grid-template-columns: 1fr;
    }
`;

const TranscriptColumn = styled.div`
    min-height: 0;
    display: flex;
    flex-direction: column;
`;

const TranscriptPaneShell = styled.div`
    flex: 1;
    min-height: 0;
`;

const SidePanel = styled.div`
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--Color-Background-Default);
    border: 12px solid var(--Color-Background-Action);
    border-radius: var(--Size-CornerRadius-XXL);
    box-shadow: 0 18px 42px rgba(15, 118, 110, 0.22), var(--Color-Shadow-Card);
    overflow: hidden;

    @media (max-width: 1120px) {
        min-height: 620px;
    }
`;

const PanelTitle = styled.div`
    min-height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--Size-Padding-XL);
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    font-size: var(--body-2-d);
    font-weight: var(--bold);
    text-align: center;
`;

const TabContent = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
`;

const EmptyState = styled.div`
    min-height: calc(100vh - 64px);
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXXL);
`;

const TABS = [
    { id: "chat", label: "AI Chat" },
    { id: "summary", label: "Summary" },
    { id: "actions", label: "Actions" },
];

const PANEL_TITLES = {
    chat: "Chat with AI",
    summary: "Summary",
    actions: "Actions",
};

const MeetingContentView = () => {
    const dispatch = useDispatch();
    const activeId = useSelector((state) => state.meetingDetails.activeId);
    const meeting = useSelector((state) =>
        state.meetingDetails.list.find((m) => m.id === activeId),
    );

    const [activeTab, setActiveTab] = useState("chat");
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
                <SkeletonCard style={{ maxWidth: 520, width: "100%" }}>
                    <H3>No meeting selected</H3>
                    <Body2
                        style={{
                            color: "var(--Color-Text-Subtle)",
                            marginTop: "var(--Size-Gap-M)",
                        }}
                    >
                        Open a meeting from the dashboard.
                    </Body2>
                    <Button
                        style={{ marginTop: "var(--Size-Gap-XXL)" }}
                        onClick={() => dispatch(setHostView(HOST_VIEWS.Dashboard))}
                    >
                        Back to Dashboard
                    </Button>
                </SkeletonCard>
            </EmptyState>
        );
    }

    if (!meeting) {
        return (
            <Wrapper>
                <SkeletonStack>
                    <SkeletonBlock width="220px" height="16px" />
                    <SkeletonBlock width="48%" height="34px" />
                </SkeletonStack>
            </Wrapper>
        );
    }

    const transcriptText = getTranscriptText(meeting.transcript);

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
            // eslint-disable-next-line no-alert
            alert("Exported to Notion successfully!");
        } catch (err) {
            // eslint-disable-next-line no-alert
            alert(`Export failed: ${err.message}`);
        }
    };

    return (
        <Wrapper>
            <Split>
                <TranscriptColumn>
                    <Header>
                        <TitleBlock>
                            <MetaRow>
                                <Badge tone="neutral">
                                    <Calendar size={13} />
                                    {formatDate(meeting.start_time)}
                                </Badge>
                            </MetaRow>
                            <H1 style={{ fontSize: "var(--h2-d)" }}>{meeting.title}</H1>
                        </TitleBlock>
                        <Actions>
                            <Button mode="secondary" onClick={handleExportNotion}>
                                <FileText size={16} />
                                Export to Notion
                            </Button>
                            <Button onClick={() => dispatch(setHostView(HOST_VIEWS.Share))}>
                                <Share2 size={16} />
                                Share
                            </Button>
                        </Actions>
                    </Header>
                    <TranscriptPaneShell>
                        <TranscriptPane
                            text={translatedText ?? transcriptText}
                            segments={translatedText ? null : meeting.transcript?.segments}
                            speakerNames={meeting.transcript?.speakerNames}
                            audioSrc={meeting.audio_file_path}
                            onTranslate={handleTranslate}
                            translating={translating}
                            editable
                            onRenameSpeaker={(speaker, name) =>
                                dispatch(renameSpeaker(activeId, speaker, name))
                            }
                        />
                    </TranscriptPaneShell>
                </TranscriptColumn>
                <SidePanel>
                    <PanelTitle>{PANEL_TITLES[activeTab]}</PanelTitle>
                    <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
                    <TabContent>
                        {activeTab === "chat" && (
                            <ChatTab
                                messages={chatMessages}
                                onSend={handleSendChat}
                                sending={chatSending}
                            />
                        )}
                        {activeTab === "summary" && <SummaryTab summary={meeting.summary} />}
                        {activeTab === "actions" && (
                            <ActionsTab
                                items={meeting.action_items}
                                onToggle={(itemId) => dispatch(toggleActionItem(activeId, itemId))}
                            />
                        )}
                    </TabContent>
                </SidePanel>
            </Split>
        </Wrapper>
    );
};

export default MeetingContentView;
