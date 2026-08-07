import React, { useState } from "react";
import styled from "styled-components";
import { ArrowRight, AudioWaveform, Clock3, HelpCircle, History, Home, KeyRound, ShieldCheck } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import Badge from "common/components/Badge";
import { H1, H3, Body2, Body3 } from "common/global-styled-components";
import { extractShareToken } from "common/utils/shareToken";
import { toast } from "common/utils/toast";
import ShareService from "services/share.service";

const Wrapper = styled.div`
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXXL) var(--Size-Padding-XL);
    background: transparent;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    gap: var(--Size-Gap-XXL);
    width: min(980px, 100%);

    @media (max-width: 820px) {
        grid-template-columns: 1fr;
    }
`;

const MainCard = styled.div`
    padding: var(--Size-Padding-4XL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-1);

    @media (max-width: 560px) {
        padding: var(--Size-Padding-XXL);
    }
`;

const Brand = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XXXL);
    color: var(--Color-Text-Bold);
    font-weight: var(--bold);
`;

const BrandMark = styled.span`
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Action);
    border: 1px solid var(--Color-Border-Accent-Action);
    color: var(--Color-Icon-Action);
`;

const IconCircle = styled.div`
    width: 64px;
    height: 64px;
    margin-bottom: var(--Size-Gap-XL);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--Color-Background-Accent-Danger);
    color: var(--Color-Text-Danger);
    border-radius: var(--Size-CornerRadius-XL);
`;

const ButtonRow = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    margin-top: var(--Size-Gap-XXL);
    flex-wrap: wrap;
`;

const SideCard = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-Card);
`;

const Form = styled.form`
    display: grid;
    gap: var(--Size-Gap-L);
    margin-top: var(--Size-Gap-XL);
`;

const TrustRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    margin-top: var(--Size-Gap-XL);
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-4-d);
`;

const IconAddon = styled.span`
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Icon-Subtle);
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

const InvalidToken = () => {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [checking, setChecking] = useState(false);

    const handleValidate = async (e) => {
        e.preventDefault();
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
            setNotice("Access request sent. The host needs to approve your account before you can open the meeting.");
            toast.success("Access request sent");
        } catch (err) {
            setError(err.message || "That meeting code is invalid or has expired.");
        } finally {
            setChecking(false);
        }
    };

    return (
        <Wrapper>
            <Grid>
                <MainCard>
                    <Brand>
                        <BrandMark>
                            <AudioWaveform size={18} />
                        </BrandMark>
                        MeetAI
                    </Brand>
                    <IconCircle>
                        <History size={28} />
                    </IconCircle>
                    <Badge tone="danger">Access unavailable</Badge>
                    <H1 style={{ fontSize: "var(--h2-d)", marginTop: "var(--Size-Gap-L)" }}>
                        This meeting code is no longer valid.
                    </H1>
                    <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-L)" }}>
                        Ask the host for a new code or enter a fresh access code.
                    </Body2>
                    <ButtonRow>
                        <Button onClick={() => window.location.assign("/")}>
                            <Home size={16} />
                            Home
                        </Button>
                        <Button mode="secondary" onClick={() => window.location.assign("mailto:support@meetai.studio")}>
                            <HelpCircle size={16} />
                            Contact Support
                        </Button>
                    </ButtonRow>
                </MainCard>

                <SideCard>
                    <Badge tone="neutral">Manual access</Badge>
                    <H3 style={{ marginTop: "var(--Size-Gap-XL)" }}>Have a code?</H3>
                    <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>
                        Enter the meeting code shared by the host.
                    </Body3>
                    <Form onSubmit={handleValidate}>
                        <Input
                            mono
                            placeholder="Enter meeting code"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            addon={
                                <IconAddon>
                                    <KeyRound size={15} />
                                </IconAddon>
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
                    <TrustRow>
                        <ShieldCheck size={14} />
                        Access is controlled by the meeting host.
                    </TrustRow>
                </SideCard>
            </Grid>
        </Wrapper>
    );
};

export default InvalidToken;
