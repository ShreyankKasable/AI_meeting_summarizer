import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ArrowRight, Calendar, Clock3, Eye, KeyRound, LogIn, RefreshCw, ShieldCheck } from "lucide-react";
import PageContainer from "common/components/PageContainer";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import Badge from "common/components/Badge";
import { H2, H3, Body2, Body3 } from "common/global-styled-components";
import { extractShareToken } from "common/utils/shareToken";
import { toast } from "common/utils/toast";
import ShareService from "services/share.service";

const PageStack = styled(PageContainer)`
    display: grid;
    gap: var(--Size-Gap-XXL);
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.55fr);
    gap: var(--Size-Gap-XXL);
    align-items: start;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XXL);
    box-shadow: var(--Color-Shadow-Card);
    overflow: hidden;
`;

const Header = styled.div`
    padding: var(--Size-Padding-XXXL);
    background:
        linear-gradient(135deg, rgba(21, 22, 24, 0.98), rgba(38, 42, 47, 0.96)),
        var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);
`;

const Body = styled.div`
    padding: var(--Size-Padding-XXXL);
`;

const Form = styled.form`
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const CodeIcon = styled.span`
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Icon-Subtle);
`;

const SideCard = styled(Card)`
    padding: var(--Size-Padding-XXL);
`;

const HelpList = styled.div`
    display: grid;
    gap: var(--Size-Gap-L);
    margin-top: var(--Size-Gap-XL);
`;

const HelpItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--Size-Gap-M);
    color: var(--Color-Text-Subtle);
`;

const StatusCard = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Accent-Warning);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Warning);
    color: var(--Color-Text-Warning);
`;

const ApprovedSection = styled.section`
    display: grid;
    gap: var(--Size-Gap-XL);
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XXL);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-Card);
`;

const SectionHeader = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: var(--Size-Gap-XL);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const ApprovedList = styled.div`
    display: grid;
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    overflow: hidden;
`;

const MeetingRow = styled.article`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--Size-Gap-L);
    align-items: center;
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Default);

    & + & {
        border-top: 1px solid var(--Color-Border-Subtle);
    }

    @media (max-width: 680px) {
        grid-template-columns: 1fr;
    }
`;

const MeetingCopy = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-S);
`;

const MeetingTitle = styled.div`
    min-width: 0;
    overflow: hidden;
    color: var(--Color-Text-Bold);
    font-size: var(--body-1-d);
    font-weight: var(--bold);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const MeetingMeta = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
`;

const EmptyApproved = styled.div`
    min-height: 132px;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXL);
    border: 1px dashed var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    color: var(--Color-Text-Subtle);
    text-align: center;
`;

const JoinMeeting = () => {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [checking, setChecking] = useState(false);
    const [approvedMeetings, setApprovedMeetings] = useState([]);
    const [approvedLoading, setApprovedLoading] = useState(true);

    const loadApprovedMeetings = async () => {
        setApprovedLoading(true);
        try {
            const { data } = await ShareService.listApprovedMeetings();
            setApprovedMeetings(data.meetings || []);
        } catch (err) {
            toast.error("Could not load approved meetings", { message: err.message });
        } finally {
            setApprovedLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        setApprovedLoading(true);
        ShareService.listApprovedMeetings()
            .then(({ data }) => {
                if (!cancelled) setApprovedMeetings(data.meetings || []);
            })
            .catch((err) => {
                if (!cancelled) toast.error("Could not load approved meetings", { message: err.message });
            })
            .finally(() => {
                if (!cancelled) setApprovedLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        setChecking(true);

        const cleaned = extractShareToken(token);
        try {
            const { data } = await ShareService.requestAccess(cleaned);
            if (data.can_access) {
                toast.success("Access approved");
                window.location.href = `/share/${cleaned}`;
                return;
            }
            setNotice("Access request sent. You can open this meeting after the host approves your account.");
            toast.success("Access request sent", { message: "The host can approve it from the Share page." });
        } catch (err) {
            setError(err.message || "That meeting code is invalid, expired, or no longer available.");
        } finally {
            setChecking(false);
        }
    };

    return (
        <PageStack size="lg">
            <Layout>
                <Card>
                    <Header>
                        <Badge tone="solidDark">
                            <LogIn size={13} />
                            Participant access
                        </Badge>
                        <H2 style={{ color: "inherit", marginTop: "var(--Size-Gap-XL)" }}>
                            Join a shared meeting
                        </H2>
                        <Body2 style={{ color: "rgba(255, 255, 255, 0.72)", marginTop: "var(--Size-Gap-M)" }}>
                            Enter the meeting code shared by the host to open the read-only participant view.
                        </Body2>
                    </Header>
                    <Body>
                        <Form onSubmit={handleSubmit}>
                            <Input
                                label="Meeting Code"
                                mono
                                required
                                value={token}
                                onChange={(event) => setToken(event.target.value)}
                                placeholder="Paste meeting access code"
                                id="join-meeting-token"
                                helpText="Codes are case-sensitive and can be revoked by the host."
                                addon={
                                    <CodeIcon>
                                        <KeyRound size={16} />
                                    </CodeIcon>
                                }
                            />

                            {notice && (
                                <StatusCard>
                                    <Clock3 size={16} />
                                    <Body3>{notice}</Body3>
                                </StatusCard>
                            )}
                            <Alert>{error}</Alert>

                            <Button type="submit" block loader={checking}>
                                Request Access
                                <ArrowRight size={16} />
                            </Button>
                        </Form>
                    </Body>
                </Card>

                <SideCard>
                    <Badge tone="success">
                        <ShieldCheck size={13} />
                        Sign-in required
                    </Badge>
                    <H3 style={{ marginTop: "var(--Size-Gap-XL)" }}>Secure shared access</H3>
                    <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>
                        Shared meeting pages are available only after login, and hosts approve each participant account.
                    </Body3>
                    <HelpList>
                        <HelpItem>
                            <ShieldCheck size={16} color="var(--Color-Icon-Success)" />
                            <Body3>The host approves pending requests before meeting content is visible.</Body3>
                        </HelpItem>
                        <HelpItem>
                            <ShieldCheck size={16} color="var(--Color-Icon-Success)" />
                            <Body3>Approved access stays active until the host or participant removes it.</Body3>
                        </HelpItem>
                    </HelpList>
                </SideCard>
            </Layout>
            <ApprovedMeetings
                meetings={approvedMeetings}
                loading={approvedLoading}
                onRefresh={loadApprovedMeetings}
            />
        </PageStack>
    );
};

const ApprovedMeetings = ({ meetings, loading, onRefresh }) => (
    <ApprovedSection>
        <SectionHeader>
            <div>
                <Badge tone="neutral">
                    <ShieldCheck size={13} />
                    Approved access
                </Badge>
                <H3 style={{ marginTop: "var(--Size-Gap-L)" }}>Your shared meetings</H3>
                <Body3 style={{ marginTop: "var(--Size-Gap-S)", color: "var(--Color-Text-Subtle)" }}>
                    {meetings.length
                        ? `${meetings.length} ${meetings.length === 1 ? "meeting" : "meetings"} ready to open`
                        : "Meetings approved by hosts will appear here"}
                </Body3>
            </div>
            <Button mode="secondary" size="small" onClick={onRefresh} loader={loading}>
                <RefreshCw size={14} />
                Refresh
            </Button>
        </SectionHeader>

        {meetings.length ? (
            <ApprovedList>
                {meetings.map((meeting) => (
                    <ApprovedMeetingRow key={`${meeting.id}:${meeting.token}`} meeting={meeting} />
                ))}
            </ApprovedList>
        ) : (
            <EmptyApproved>
                <Body3>{loading ? "Loading approved meetings..." : "No approved shared meetings yet."}</Body3>
            </EmptyApproved>
        )}
    </ApprovedSection>
);

const ApprovedMeetingRow = ({ meeting }) => (
    <MeetingRow>
        <MeetingCopy>
            <MeetingTitle title={meeting.title}>{meeting.title || "Untitled meeting"}</MeetingTitle>
            <MeetingMeta>
                <span>
                    <Calendar size={14} style={{ verticalAlign: "-2px" }} /> {formatMeetingDate(meeting.start_time)}
                </span>
                <span>
                    <Clock3 size={14} style={{ verticalAlign: "-2px" }} /> Approved {formatMeetingDate(meeting.approved_at)}
                </span>
            </MeetingMeta>
        </MeetingCopy>
        <Button onClick={() => window.location.assign(`/share/${meeting.token}`)}>
            <Eye size={16} />
            Join Meeting
        </Button>
    </MeetingRow>
);

function formatMeetingDate(value) {
    if (!value) return "No date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No date";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default JoinMeeting;
