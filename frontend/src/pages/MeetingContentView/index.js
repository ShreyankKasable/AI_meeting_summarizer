import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Calendar, FileText, Share2 } from "lucide-react";
import Button from "common/components/Button";
import Tabs from "common/components/Tabs";
import { H1 } from "common/global-styled-components";
import { formatDate, getTranscriptText } from "common/utils/utils";
import { fetchMeeting, toggleActionItem, exportToNotion } from "common/redux/actions/meetingActions";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import MeetingService from "services/meeting.service";
import TranscriptPane from "./TranscriptPane";
import ChatTab from "./ChatTab";
import SummaryTab from "./SummaryTab";
import ActionsTab from "./ActionsTab";

const Wrapper = styled.div`
    padding: var(--Size-Padding-XXL);
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    margin-bottom: var(--Size-Gap-XXL);
    flex-wrap: wrap;
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-4-d);
    margin-bottom: var(--Size-Gap-S);
`;

const Actions = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
`;

const Split = styled.div`
    flex: 1;
    display: grid;
    grid-template-columns: 7fr 3fr;
    gap: var(--Size-Gap-XXL);
    min-height: 0;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const SidePanel = styled.div`
    display: flex;
    flex-direction: column;
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    overflow: hidden;
`;

const TabContent = styled.div`
    flex: 1;
    overflow-y: auto;
`;

const TABS = [
    { id: "chat", label: "AI Chat" },
    { id: "summary", label: "Summary" },
    { id: "actions", label: "Actions" },
];

const MeetingContentView = () => {
    const dispatch = useDispatch();
    const activeId = useSelector((state) => state.meetingDetails.activeId);
    const meeting = useSelector((state) => state.meetingDetails.list.find((m) => m.id === activeId));

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

    if (!meeting) return null;

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
            <Header>
                <div>
                    <MetaRow>
                        <Calendar size={14} />
                        {formatDate(meeting.start_time)}
                    </MetaRow>
                    <H1 style={{ fontSize: "var(--h2-d)" }}>{meeting.title}</H1>
                </div>
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

            <Split>
                <TranscriptPane
                    text={translatedText ?? transcriptText}
                    audioSrc={meeting.audio_file_path}
                    onTranslate={handleTranslate}
                    translating={translating}
                />
                <SidePanel>
                    <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
                    <TabContent>
                        {activeTab === "chat" && (
                            <ChatTab messages={chatMessages} onSend={handleSendChat} sending={chatSending} />
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
