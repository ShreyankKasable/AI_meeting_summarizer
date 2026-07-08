import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Calendar } from "lucide-react";
import Tabs from "common/components/Tabs";
import { H1 } from "common/global-styled-components";
import { formatDate, getTranscriptText } from "common/utils/utils";
import ShareService from "services/share.service";
import TranscriptPane from "pages/MeetingContentView/TranscriptPane";
import ChatTab from "pages/MeetingContentView/ChatTab";
import SummaryTab from "pages/MeetingContentView/SummaryTab";
import ActionsTab from "pages/MeetingContentView/ActionsTab";
import InvalidToken from "pages/InvalidToken";

const Wrapper = styled.div`
    padding: var(--Size-Padding-XXL);
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
    max-width: 1280px;
    margin: 0 auto;
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-4-d);
    margin-bottom: var(--Size-Gap-S);
`;

const Split = styled.div`
    flex: 1;
    display: grid;
    grid-template-columns: 7fr 3fr;
    gap: var(--Size-Gap-XXL);
    min-height: 0;
    margin-top: var(--Size-Gap-XXL);

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

// Read-only view for anyone holding a valid share token — no login, no
// host-only actions (edit/export/share). Renders InvalidToken if the token
// doesn't resolve to a meeting.
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
    if (!meeting) return null;

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
        <Wrapper>
            <MetaRow>
                <Calendar size={14} />
                {formatDate(meeting.start_time)}
            </MetaRow>
            <H1 style={{ fontSize: "var(--h2-d)" }}>{meeting.title}</H1>

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
                    <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
                    <TabContent>
                        {activeTab === "chat" && (
                            <ChatTab messages={chatMessages} onSend={handleSendChat} sending={chatSending} />
                        )}
                        {activeTab === "summary" && <SummaryTab summary={meeting.summary} />}
                        {activeTab === "actions" && <ActionsTab items={meeting.action_items} readOnly />}
                    </TabContent>
                </SidePanel>
            </Split>
        </Wrapper>
    );
};

export default MeetingContentViewParticipant;
