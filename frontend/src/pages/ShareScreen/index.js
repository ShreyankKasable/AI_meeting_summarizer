import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Share2, Copy, RefreshCw, Eye, Mail, Check } from "lucide-react";
import PageContainer from "common/components/PageContainer";
import Button from "common/components/Button";
import { H2, Body2, Body3 } from "common/global-styled-components";
import { SHARE_EXPIRY_OPTIONS, HOST_VIEWS } from "common/constants";
import { setHostView } from "common/redux/actions/sessionActions";
import MeetingService from "services/meeting.service";

const Card = styled.div`
    max-width: 560px;
    margin: 0 auto;
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
    overflow: hidden;
`;

const Banner = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
`;

const Body = styled.div`
    padding: var(--Size-Padding-XXL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XXL);
`;

const LinkRow = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
`;

const LinkBox = styled.div`
    flex: 1;
    padding: var(--Size-Padding-M) var(--Size-Padding-L);
    background: var(--Color-Background-Subtle);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
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
    padding: var(--Size-Padding-M);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    margin-top: var(--Size-Gap-S);
`;

const FooterActions = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    border-top: 1px solid var(--Color-Border-Subtle);
    padding-top: var(--Size-Padding-XL);
`;

const ShareScreen = () => {
    const dispatch = useDispatch();
    const activeId = useSelector((state) => state.meetingDetails.activeId);

    const [share, setShare] = useState(null);
    const [expiresIn, setExpiresIn] = useState("never");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!activeId) return;
        MeetingService.getShare(activeId).then(async ({ data }) => {
            if (data.share) {
                setShare(data.share);
            } else {
                const created = await MeetingService.createShare(activeId, expiresIn);
                setShare(created.data.share);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    if (!share) return null;

    const shareUrl = `${window.location.origin}/share/${share.token}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        const { data } = await MeetingService.regenerateShare(activeId, expiresIn);
        setShare(data.share);
    };

    return (
        <PageContainer size="md">
            <Card>
                <Banner>
                    <Share2 size={24} />
                    <H2 style={{ color: "inherit", marginTop: "var(--Size-Gap-M)" }}>Share Meeting</H2>
                    <Body2 style={{ color: "inherit", opacity: 0.85, marginTop: "var(--Size-Gap-S)" }}>
                        Meeting processed successfully. Ready to distribute.
                    </Body2>
                </Banner>
                <Body>
                    <div>
                        <Body3 style={{ marginBottom: "var(--Size-Gap-S)", fontWeight: "var(--bold)" }}>
                            Meeting Link
                        </Body3>
                        <LinkRow>
                            <LinkBox>{shareUrl}</LinkBox>
                            <Button mode="secondary" onClick={handleCopy}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </LinkRow>
                    </div>

                    <Grid>
                        <div>
                            <Body3 style={{ fontWeight: "var(--bold)" }}>Access Expiration</Body3>
                            <Select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)}>
                                {SHARE_EXPIRY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Body3 style={{ fontWeight: "var(--bold)" }}>Security Token</Body3>
                            <Button
                                mode="secondary"
                                block
                                style={{ marginTop: "var(--Size-Gap-S)" }}
                                onClick={handleRegenerate}
                                title="This will break the previously shared link"
                            >
                                <RefreshCw size={16} />
                                Revoke &amp; Regenerate
                            </Button>
                        </div>
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
                                    `mailto:?subject=Meeting Notes&body=${encodeURIComponent(shareUrl)}`,
                                )
                            }
                        >
                            <Mail size={16} />
                            Send via Email
                        </Button>
                    </FooterActions>
                </Body>
            </Card>
        </PageContainer>
    );
};

export default ShareScreen;
