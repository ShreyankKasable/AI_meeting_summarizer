import React, { useState } from "react";
import styled from "styled-components";
import { History, Home, HelpCircle, ShieldCheck } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import { H1, H2, Body2 } from "common/global-styled-components";
import ShareService from "services/share.service";

const Wrapper = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-XXXL) var(--Size-Padding-XL);
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--Size-Gap-XXL);
    max-width: 880px;
    width: 100%;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const MainCard = styled.div`
    padding: var(--Size-Padding-XXXL);
    background: var(--Color-Background-Default);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
    text-align: center;
`;

const IconCircle = styled.div`
    width: 72px;
    height: 72px;
    margin: 0 auto var(--Size-Gap-XL);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--Color-Background-Accent-Danger);
    color: var(--Color-Text-Danger);
    border-radius: 50%;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    justify-content: center;
    margin-top: var(--Size-Gap-XXL);
    flex-wrap: wrap;
`;

const SideCard = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
`;

const Eyebrow = styled.div`
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Subtle);
    margin-bottom: var(--Size-Gap-S);
`;

const TrustRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    margin-top: var(--Size-Gap-XL);
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-4-d);
`;

// Shown when a /share/:token link doesn't resolve (expired, revoked, or
// malformed), with a fallback manual token-entry field.
const InvalidToken = () => {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(false);

    const handleValidate = async (e) => {
        e.preventDefault();
        setError("");
        setChecking(true);
        const cleaned = token.trim();
        try {
            await ShareService.get(cleaned);
            window.location.href = `/share/${cleaned}`;
        } catch {
            setError("That token is invalid or has expired.");
        } finally {
            setChecking(false);
        }
    };

    return (
        <Wrapper>
            <Grid>
                <MainCard>
                    <IconCircle>
                        <History size={32} />
                    </IconCircle>
                    <H1 style={{ fontSize: "var(--h2-d)" }}>Access Expired or Link Invalid.</H1>
                    <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-L)" }}>
                        The meeting you&apos;re looking for is no longer available. This could be due to an
                        expired link or the host revoking access. Please contact the meeting organizer for a
                        new link.
                    </Body2>
                    <ButtonRow>
                        <Button onClick={() => window.location.assign("/")}>
                            <Home size={16} />
                            Go to Landing Page
                        </Button>
                        <Button mode="secondary" onClick={() => window.location.assign("mailto:support@meetai.studio")}>
                            <HelpCircle size={16} />
                            Contact Support
                        </Button>
                    </ButtonRow>
                </MainCard>

                <SideCard>
                    <Eyebrow>Have a code?</Eyebrow>
                    <Body2 style={{ color: "var(--Color-Text-Subtle)", marginBottom: "var(--Size-Gap-L)" }}>
                        If you have a manual access token, enter it below to join.
                    </Body2>
                    <form onSubmit={handleValidate}>
                        <Input
                            mono
                            placeholder="Enter Token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                        <Alert style={{ marginTop: "var(--Size-Gap-L)" }}>{error}</Alert>
                        <Button
                            type="submit"
                            mode="dark"
                            block
                            loader={checking}
                            style={{ marginTop: "var(--Size-Gap-L)" }}
                        >
                            Validate Token
                        </Button>
                    </form>
                    <TrustRow>
                        <ShieldCheck size={14} />
                        Your meeting data is encrypted and access-controlled.
                    </TrustRow>
                </SideCard>
            </Grid>
        </Wrapper>
    );
};

export default InvalidToken;
