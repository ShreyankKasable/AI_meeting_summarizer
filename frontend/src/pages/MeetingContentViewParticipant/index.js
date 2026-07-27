import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AudioWaveform, Calendar, ShieldCheck } from "lucide-react";
import Tabs from "common/components/Tabs";
import Badge from "common/components/Badge";
import { SkeletonBlock, SkeletonCard, SkeletonStack } from "common/components/Skeleton";
import { H1 } from "common/global-styled-components";
import { formatDate, getTranscriptText } from "common/utils/utils";
import ShareService from "services/share.service";
import TranscriptPane from "pages/MeetingContentView/TranscriptPane";
import ChatTab from "pages/MeetingContentView/ChatTab";
import SummaryTab from "pages/MeetingContentView/SummaryTab";
import ActionsTab from "pages/MeetingContentView/ActionsTab";
import InvalidToken from "pages/InvalidToken";

const Page = styled.div`
    min-height: 100vh;
    background: var(--Color-Background-Subtle);
`;

const TopNav = styled.header`
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid var(--Color-Border-Subtle);
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(16px);
`;

const TopNavInner = styled.div`
    width: min(1320px, calc(100% - 32px));
    min-height: 64px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
`;

const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    color: var(--Color-Text-Bold);
    font-weight: var(--bold);
`;

const BrandMark = styled.span`
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);
`;

const Wrapper = styled.div`
    width: min(1320px, calc(100% - 32px));
    height: calc(100vh - 64px);
    margin: 0 auto;
    padding: var(--Size-Padding-XXXL) 0;
    display: flex;
    flex-direction: column;

    @media (max-width: 1024px) {
        height: auto;
    }
`;

const Header = styled.div`
    display: grid;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XXL);
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
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

const SidePanel = styled.div`
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--Color-Background-Default);
    border: 12px solid var(--Color-Background-Action);
    border-radius: var(--Size-CornerRadius-XXL);
    box-shadow: 0 18px 42px rgba(15, 118, 110, 0.22), var(--Color-Shadow-Card);
    overflow: hidden;
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

const LoadingShell = styled.div`
    width: min(960px, calc(100% - 32px));
    margin: 0 auto;
    padding: var(--Size-Padding-XXXL) 0;
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

const MeetingContentViewParticipant = ({ token }) => {
    const [meeting, setMeeting] = useState(null);
    const [invalid, setInvalid] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatSending, setChatSending] = useState(false);
    const [translatedText, setTranslatedText] = useState(null);
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        ShareService.get(token)
            .then(({ data }) => setMeeting(data))
            .catch(() => setInvalid(true));
        ShareService.getChatHistory(token)
            .then(({ data }) => setChatMessages(data))
            .catch(() => {});
    }, [token]);

    if (invalid) return <InvalidToken />;

    if (!meeting) {
        return (
            <Page>
                <TopNav>
                    <TopNavInner>
                        <Brand>
                            <BrandMark>
                                <AudioWaveform size={16} />
                            </BrandMark>
                            MeetAI
                        </Brand>
                        <Badge tone="neutral">Shared meeting</Badge>
                    </TopNavInner>
                </TopNav>
                <LoadingShell>
                    <SkeletonStack>
                        <SkeletonBlock width="180px" height="16px" />
                        <SkeletonBlock width="52%" height="34px" />
                        <SkeletonCard>
                            <SkeletonBlock height="16px" width="92%" />
                            <SkeletonBlock height="16px" width="76%" style={{ marginTop: 12 }} />
                        </SkeletonCard>
                    </SkeletonStack>
                </LoadingShell>
            </Page>
        );
    }

    const transcriptText = getTranscriptText(meeting.transcript);

    const handleSendChat = async (question) => {
        setChatMessages((prev) => [...prev, { role: "user", content: question }]);
        setChatSending(true);
        try {
            const { data } = await ShareService.sendChatMessage(token, question);
            setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
        } finally {
            setChatSending(false);
        }
    };

    const handleTranslate = async (language) => {
        setTranslating(true);
        try {
            const { data } = await ShareService.translate(token, language);
            setTranslatedText(data.translated_transcript);
        } finally {
            setTranslating(false);
        }
    };

    return (
        <Page>
            <TopNav>
                <TopNavInner>
                    <Brand>
                        <BrandMark>
                            <AudioWaveform size={16} />
                        </BrandMark>
                        MeetAI
                    </Brand>
                    <Badge tone="success">
                        <ShieldCheck size={13} />
                        Shared access
                    </Badge>
                </TopNavInner>
            </TopNav>
            <Wrapper>
                <Header>
                    <MetaRow>
                        <Badge tone="neutral">
                            <Calendar size={13} />
                            {formatDate(meeting.start_time)}
                        </Badge>
                    </MetaRow>
                    <H1 style={{ fontSize: "var(--h2-d)" }}>{meeting.title}</H1>
                </Header>

                <Split>
                    <TranscriptPane
                        text={translatedText ?? transcriptText}
                        segments={translatedText ? null : meeting.transcript?.segments}
                        speakerNames={meeting.transcript?.speakerNames}
                        audioSrc={meeting.audio_file_path}
                        onTranslate={handleTranslate}
                        translating={translating}
                    />
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
                                <ActionsTab items={meeting.action_items} readOnly />
                            )}
                        </TabContent>
                    </SidePanel>
                </Split>
            </Wrapper>
        </Page>
    );
};

export default MeetingContentViewParticipant;
