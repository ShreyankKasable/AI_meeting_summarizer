import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    Check,
    Copy,
    Eye,
    KeyRound,
    Mail,
    RefreshCw,
    Share2,
    ShieldCheck,
} from "lucide-react";
import PageContainer from "common/components/PageContainer";
import Button from "common/components/Button";
import Badge from "common/components/Badge";
import { SkeletonBlock, SkeletonCard, SkeletonStack } from "common/components/Skeleton";
import { H2, H3, Body2, Body3 } from "common/global-styled-components";
import { SHARE_EXPIRY_OPTIONS, HOST_VIEWS } from "common/constants";
import { setHostView } from "common/redux/actions/sessionActions";
import { toast } from "common/utils/toast";
import MeetingService from "services/meeting.service";
import ParticipantAccessInsights from "./ParticipantAccessInsights";

const PageStack = styled(PageContainer)`
    display: grid;
    gap: var(--Size-Gap-XXL);
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(360px, 0.65fr);
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

const Banner = styled.div`
    padding: var(--Size-Padding-XXXL);
    background:
        linear-gradient(135deg, rgba(21, 22, 24, 0.98), rgba(38, 42, 47, 0.96)),
        var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);
`;

const Body = styled.div`
    padding: var(--Size-Padding-XXXL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XXL);

    @media (max-width: 560px) {
        padding: var(--Size-Padding-XXL);
    }
`;

const FieldGroup = styled.div`
    display: grid;
    gap: var(--Size-Gap-S);
`;

const LinkRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--Size-Gap-M);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const LinkBox = styled.div`
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    min-width: 0;
    padding: 0 var(--Size-Padding-XL);
    background: var(--Color-Background-Subtle);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    color: var(--Color-Text-Subtle);
`;

const LinkText = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--Size-Gap-XL);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const Select = styled.select`
    width: 100%;
    min-height: 44px;
    padding: 0 var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    outline: none;

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
    }
`;

const FooterActions = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    border-top: 1px solid var(--Color-Border-Subtle);
    padding-top: var(--Size-Padding-XL);

    @media (max-width: 640px) {
        flex-direction: column;
    }
`;

const SideCard = styled(Card)`
    padding: var(--Size-Padding-XXL);
`;

const SideList = styled.div`
    display: grid;
    gap: var(--Size-Gap-L);
    margin-top: var(--Size-Gap-XL);
`;

const SideItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--Size-Gap-M);
    color: var(--Color-Text-Subtle);
`;

const ShareScreen = () => {
    const dispatch = useDispatch();
    const activeId = useSelector((state) => state.meetingDetails.activeId);
    const meeting = useSelector((state) => state.meetingDetails.list.find((m) => m.id === activeId));

    const [share, setShare] = useState(null);
    const [expiresIn, setExpiresIn] = useState("never");
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [accessRows, setAccessRows] = useState([]);
    const [accessLoading, setAccessLoading] = useState(false);
    const [accessAction, setAccessAction] = useState("");

    const loadAccessRows = async () => {
        if (!activeId) return [];
        const { data } = await MeetingService.getShareAccess(activeId);
        const rows = data.access || [];
        setAccessRows(rows);
        return rows;
    };

    useEffect(() => {
        if (!activeId) return;
        let cancelled = false;
        const loadShare = async () => {
            setAccessLoading(true);
            try {
                const { data } = await MeetingService.getShare(activeId);
                if (cancelled) return;
                if (data.share) {
                    setShare(data.share);
                } else {
                    const created = await MeetingService.createShare(activeId, expiresIn);
                    if (!cancelled) {
                        setShare(created.data.share);
                        toast.success("Meeting code created");
                    }
                }
                const access = await MeetingService.getShareAccess(activeId);
                if (!cancelled) setAccessRows(access.data.access || []);
            } catch (err) {
                if (!cancelled) toast.error("Could not load meeting code", { message: err.message });
            } finally {
                if (!cancelled) setAccessLoading(false);
            }
        };
        loadShare();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    if (!activeId) {
        return (
            <PageContainer size="md">
                <Card>
                    <Body>
                        <H3>No meeting selected</H3>
                        <Body2 style={{ color: "var(--Color-Text-Subtle)" }}>Open a meeting before sharing.</Body2>
                        <Button onClick={() => dispatch(setHostView(HOST_VIEWS.Dashboard))}>Back to Dashboard</Button>
                    </Body>
                </Card>
            </PageContainer>
        );
    }

    if (!share) {
        return (
            <PageContainer size="lg">
                <SkeletonCard>
                    <SkeletonStack>
                        <SkeletonBlock width="160px" height="22px" />
                        <SkeletonBlock width="58%" height="34px" />
                        <SkeletonBlock height="44px" />
                        <SkeletonBlock width="72%" height="14px" />
                    </SkeletonStack>
                </SkeletonCard>
            </PageContainer>
        );
    }

    const shareCode = share.token;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareCode);
            setCopied(true);
            toast.success("Meeting code copied");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Could not copy code", { message: err.message });
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const { data } = await MeetingService.regenerateShare(activeId, expiresIn);
            setShare(data.share);
            const access = await MeetingService.getShareAccess(activeId);
            setAccessRows(access.data.access || []);
            toast.success("Meeting code regenerated", { message: "The previous code is no longer valid." });
        } catch (err) {
            toast.error("Could not regenerate code", { message: err.message });
        } finally {
            setRegenerating(false);
        }
    };

    const handleRefreshAccess = async () => {
        setAccessLoading(true);
        try {
            await loadAccessRows();
        } catch (err) {
            toast.error("Could not refresh participant access", { message: err.message });
        } finally {
            setAccessLoading(false);
        }
    };

    const handleApproveAccess = async (userId) => {
        setAccessAction(`approve:${userId}`);
        try {
            await MeetingService.approveShareAccess(activeId, userId);
            await loadAccessRows();
            toast.success("Participant approved");
        } catch (err) {
            toast.error("Could not approve participant", { message: err.message });
        } finally {
            setAccessAction("");
        }
    };

    const handleRejectAccess = async (userId) => {
        setAccessAction(`reject:${userId}`);
        try {
            await MeetingService.rejectShareAccess(activeId, userId);
            await loadAccessRows();
            toast.success("Participant request rejected");
        } catch (err) {
            toast.error("Could not reject request", { message: err.message });
        } finally {
            setAccessAction("");
        }
    };

    const handleRemoveAccess = async (userId) => {
        if (!window.confirm("Remove this participant's access to the meeting?")) return;
        setAccessAction(`remove:${userId}`);
        try {
            await MeetingService.removeShareAccess(activeId, userId);
            await loadAccessRows();
            toast.success("Participant access removed");
        } catch (err) {
            toast.error("Could not remove participant", { message: err.message });
        } finally {
            setAccessAction("");
        }
    };

    return (
        <PageStack size="lg">
            <Layout>
                <Card>
                    <Banner>
                        <Badge tone="solidDark">
                            <Share2 size={13} />
                            Sharing
                        </Badge>
                        <H2 style={{ color: "inherit", marginTop: "var(--Size-Gap-XL)" }}>
                            Share {meeting?.title || "Meeting"}
                        </H2>
                        <Body2 style={{ color: "rgba(255, 255, 255, 0.72)", marginTop: "var(--Size-Gap-M)" }}>
                            Create participant access for this processed meeting.
                        </Body2>
                    </Banner>
                    <Body>
                        <FieldGroup>
                            <Body3 style={{ fontWeight: "var(--bold)", color: "var(--Color-Text-Bold)" }}>
                                Meeting Code
                            </Body3>
                            <LinkRow>
                                <LinkBox>
                                    <KeyRound size={15} color="var(--Color-Icon-Subtle)" />
                                    <LinkText>{shareCode}</LinkText>
                                </LinkBox>
                                <Button mode="secondary" onClick={handleCopy}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            </LinkRow>
                        </FieldGroup>

                        <Grid>
                            <FieldGroup>
                                <Body3 style={{ fontWeight: "var(--bold)", color: "var(--Color-Text-Bold)" }}>
                                    Access Expiration
                                </Body3>
                                <Select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)}>
                                    {SHARE_EXPIRY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </Select>
                            </FieldGroup>
                            <FieldGroup>
                                <Body3 style={{ fontWeight: "var(--bold)", color: "var(--Color-Text-Bold)" }}>
                                    Meeting Code
                                </Body3>
                                <Button
                                    mode="danger"
                                    block
                                    onClick={handleRegenerate}
                                    loader={regenerating}
                                    title="This will break the previously shared code"
                                >
                                    <RefreshCw size={16} />
                                    Revoke and Regenerate
                                </Button>
                            </FieldGroup>
                        </Grid>

                        <FooterActions>
                            <Button style={{ flex: 1 }} onClick={() => dispatch(setHostView(HOST_VIEWS.Meeting))}>
                                <Eye size={16} />
                                View Meeting
                            </Button>
                            <Button
                                mode="secondary"
                                style={{ flex: 1 }}
                                onClick={() =>
                                    window.open(
                                        `mailto:?subject=Meeting Code&body=${encodeURIComponent(
                                            `Use this meeting code after signing in:\n\n${shareCode}`,
                                        )}`,
                                    )
                                }
                            >
                                <Mail size={16} />
                                Send Email
                            </Button>
                        </FooterActions>
                    </Body>
                </Card>

                <SideCard>
                    <Badge tone="success">
                        <ShieldCheck size={13} />
                        Access controlled
                    </Badge>
                    <H3 style={{ marginTop: "var(--Size-Gap-XL)" }}>Participant view</H3>
                    <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>
                        Approved viewers get the transcript, summary, actions, and AI chat without host controls.
                    </Body3>
                    <SideList>
                        <SideItem>
                            <Check size={16} color="var(--Color-Icon-Success)" />
                            <Body3>Read-only meeting content</Body3>
                        </SideItem>
                        <SideItem>
                            <Check size={16} color="var(--Color-Icon-Success)" />
                            <Body3>Regenerated codes stop new requests from old codes</Body3>
                        </SideItem>
                        <SideItem>
                            <Check size={16} color="var(--Color-Icon-Success)" />
                            <Body3>Approved participants can be removed any time</Body3>
                        </SideItem>
                    </SideList>
                </SideCard>
            </Layout>
            <ParticipantAccessInsights
                rows={accessRows}
                loading={accessLoading}
                onRefresh={handleRefreshAccess}
                onApprove={handleApproveAccess}
                onReject={handleRejectAccess}
                onRemove={handleRemoveAccess}
                busyAction={accessAction}
            />
        </PageStack>
    );
};

export default ShareScreen;
