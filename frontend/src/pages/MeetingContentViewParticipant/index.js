import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { ArrowLeft, AudioWaveform, Calendar, Clock3, Home, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import Tabs from "common/components/Tabs";
import Badge from "common/components/Badge";
import Button from "common/components/Button";
import { SkeletonBlock, SkeletonCard, SkeletonStack } from "common/components/Skeleton";
import { H1, H3, Body2 } from "common/global-styled-components";
import { HOST_VIEWS } from "common/constants";
import { setHostView } from "common/redux/actions/sessionActions";
import { formatDate, getTranscriptText } from "common/utils/utils";
import { toast } from "common/utils/toast";
import ShareService from "services/share.service";
import TranscriptPane from "pages/MeetingContentView/TranscriptPane";
import ChatTab from "pages/MeetingContentView/ChatTab";
import SummaryTab from "pages/MeetingContentView/SummaryTab";
import ActionsTab from "pages/MeetingContentView/ActionsTab";
import InvalidToken from "pages/InvalidToken";

const Page = styled.div`
    min-height: 100vh;
    background: transparent;
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
    width: min(var(--layout-max), calc(100% - 32px));
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
    background: var(--Color-Background-Accent-Action);
    border: 1px solid var(--Color-Border-Accent-Action);
    color: var(--Color-Icon-Action);
`;

const RightActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
`;

const Wrapper = styled.div`
    width: min(var(--layout-max), calc(100% - 32px));
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
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-Card);
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
    background: var(--Color-Background-Subtle);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    color: var(--Color-Text-Bold);
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

const StateShell = styled.div`
    width: min(680px, calc(100% - 32px));
    margin: 0 auto;
    padding: var(--Size-Padding-4XL) 0;
`;

const StateCard = styled.div`
    display: grid;
    gap: var(--Size-Gap-XL);
    padding: var(--Size-Padding-XXXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-Card);
    text-align: center;
`;

const StateIcon = styled.div`
    width: 58px;
    height: 58px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Warning);
    color: var(--Color-Text-Warning);
`;

const StateActions = styled.div`
    display: flex;
    justify-content: center;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
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
    const dispatch = useDispatch();
    const [meeting, setMeeting] = useState(null);
    const [invalid, setInvalid] = useState(false);
    const [activeTab, setActiveTab] = useState("summary");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatSending, setChatSending] = useState(false);
    const [translatedText, setTranslatedText] = useState(null);
    const [translating, setTranslating] = useState(false);
    const [accessState, setAccessState] = useState({ status: "checking" });
    const [accessChecking, setAccessChecking] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const checkAccess = async ({ createRequest = false, cancelled = () => false } = {}) => {
        setAccessChecking(true);
        try {
            const { data: access } = createRequest
                ? await ShareService.requestAccess(token)
                : await ShareService.getAccessStatus(token);

            if (cancelled()) return;

            setAccessState(access);
            if (!access.can_access) {
                setMeeting(null);
                return;
            }

            const [meetingResponse, chatResponse] = await Promise.all([
                ShareService.get(token),
                ShareService.getChatHistory(token).catch(() => ({ data: [] })),
            ]);

            if (cancelled()) return;

            setMeeting(meetingResponse.data);
            setChatMessages(chatResponse.data || []);
        } catch (err) {
            if (cancelled()) return;
            if (err.status === 404) {
                setInvalid(true);
            } else {
                setAccessState({ status: "error", message: err.message });
                setMeeting(null);
            }
        } finally {
            if (!cancelled()) setAccessChecking(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        checkAccess({ createRequest: true, cancelled: () => cancelled });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        setTranslatedText(null);
    }, [token, meeting?.id]);

    if (invalid) return <InvalidToken />;

    if (!meeting) {
        if (accessState.status && accessState.status !== "checking" && accessState.status !== "approved") {
            return (
                <AccessStatePage
                    status={accessState.status}
                    message={accessState.message}
                    checking={accessChecking}
                    onRefresh={() => checkAccess()}
                />
            );
        }

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
        if (!language) {
            setTranslatedText(null);
            return;
        }

        setTranslating(true);
        try {
            const { data } = await ShareService.translate(token, language);
            setTranslatedText(data.translated_transcript);
        } finally {
            setTranslating(false);
        }
    };

    const handleBackToJoin = () => {
        dispatch(setHostView(HOST_VIEWS.Join));
        window.location.assign("/?view=join");
    };

    const handleLeaveAccess = async () => {
        if (!window.confirm("Remove your access to this meeting? You will need to request access again.")) return;
        setLeaving(true);
        try {
            await ShareService.removeAccess(token);
            toast.success("Meeting access removed");
            handleBackToJoin();
        } catch (err) {
            toast.error("Could not remove access", { message: err.message });
        } finally {
            setLeaving(false);
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
                    <RightActions>
                        <Button mode="secondary" size="small" onClick={handleBackToJoin}>
                            <ArrowLeft size={14} />
                            Back
                        </Button>
                        <Badge tone="success">
                            <ShieldCheck size={13} />
                            Shared access
                        </Badge>
                        <Button mode="secondary" size="small" onClick={handleLeaveAccess} loader={leaving}>
                            <LogOut size={14} />
                            Leave
                        </Button>
                    </RightActions>
                </TopNavInner>
            </TopNav>
            <Wrapper>
                <Split>
                    <TranscriptColumn>
                        <Header>
                            <MetaRow>
                                <Badge tone="neutral">
                                    <Calendar size={13} />
                                    {formatDate(meeting.start_time)}
                                </Badge>
                            </MetaRow>
                            <H1 style={{ fontSize: "var(--h2-d)" }}>{meeting.title}</H1>
                        </Header>
                        <TranscriptPaneShell>
                            <TranscriptPane
                                text={translatedText ?? transcriptText}
                                segments={translatedText ? null : meeting.transcript?.segments}
                                speakerNames={meeting.transcript?.speakerNames}
                                audioSrc={meeting.audio_file_path}
                                onTranslate={handleTranslate}
                                translating={translating}
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
                                <ActionsTab items={meeting.action_items} readOnly />
                            )}
                        </TabContent>
                    </SidePanel>
                </Split>
            </Wrapper>
        </Page>
    );
};

const AccessStatePage = ({ status, message, checking, onRefresh }) => {
    const copy = accessStateCopy(status, message);
    const Icon = copy.icon;
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
                    <Badge tone={copy.badgeTone}>{copy.badge}</Badge>
                </TopNavInner>
            </TopNav>
            <StateShell>
                <StateCard>
                    <StateIcon>
                        <Icon size={26} />
                    </StateIcon>
                    <div>
                        <H3>{copy.title}</H3>
                        <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-M)" }}>
                            {copy.description}
                        </Body2>
                    </div>
                    <StateActions>
                        <Button onClick={onRefresh} loader={checking}>
                            <RefreshCw size={16} />
                            Check Status
                        </Button>
                        <Button mode="secondary" onClick={() => window.location.assign("/?view=join")}>
                            <Home size={16} />
                            Home
                        </Button>
                    </StateActions>
                </StateCard>
            </StateShell>
        </Page>
    );
};

function accessStateCopy(status, message) {
    if (status === "rejected") {
        return {
            badge: "Request declined",
            badgeTone: "danger",
            icon: ShieldCheck,
            title: "The host declined this access request",
            description: "Ask the host for approval before opening this meeting.",
        };
    }
    if (status === "removed") {
        return {
            badge: "Access removed",
            badgeTone: "neutral",
            icon: LogOut,
            title: "Your access was removed",
            description: "You can request access again if the host shared an active meeting code.",
        };
    }
    if (status === "error") {
        return {
            badge: "Access check failed",
            badgeTone: "danger",
            icon: ShieldCheck,
            title: "Could not check access",
            description: message || "Please try again in a moment.",
        };
    }
    return {
        badge: "Pending approval",
        badgeTone: "warning",
        icon: Clock3,
        title: "Waiting for host approval",
        description: "Your request was sent. This meeting will open after the host approves your account.",
    };
}

export default MeetingContentViewParticipant;
