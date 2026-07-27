import React, { useState } from "react";
import styled from "styled-components";
import { ArrowRight, KeyRound } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import { Body3 } from "common/global-styled-components";
import ShareService from "services/share.service";
import AuthShell from "./AuthShell";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XL);
`;

const ToggleRow = styled(Body3)`
    margin-top: var(--Size-Gap-XL);
    text-align: center;
`;

const ToggleLink = styled.button`
    background: none;
    border: none;
    padding: 0;
    color: var(--Color-Text-Action);
    font-weight: var(--semi-bold);
`;

const CodeIcon = styled.span`
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Icon-Subtle);
`;

const JoinMeetingForm = ({ onBackToLogin, onBackToLanding }) => {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setChecking(true);
        const cleaned = token.trim();
        try {
            await ShareService.get(cleaned);
            window.location.href = `/share/${cleaned}`;
        } catch {
            setError("That meeting code is invalid or has expired.");
        } finally {
            setChecking(false);
        }
    };

    return (
        <AuthShell
            title="Join a meeting"
            subtitle="Open the participant view using the access code shared by the host."
            eyebrow="Participant access"
            onBackToLanding={onBackToLanding}
        >
            <Form onSubmit={handleSubmit}>
                <Input
                    label="Meeting Code"
                    mono
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste meeting access code"
                    id="join-meeting-token"
                    helpText="Codes are case-sensitive and expire when the host revokes access."
                    addon={
                        <CodeIcon>
                            <KeyRound size={16} />
                        </CodeIcon>
                    }
                />

                <Alert>{error}</Alert>

                <Button type="submit" block loader={checking}>
                    Join Meeting
                    <ArrowRight size={16} />
                </Button>
            </Form>

            <ToggleRow>
                Are you the host?{" "}
                <ToggleLink type="button" onClick={onBackToLogin}>
                    Sign in instead
                </ToggleLink>
            </ToggleRow>
        </AuthShell>
    );
};

export default JoinMeetingForm;
