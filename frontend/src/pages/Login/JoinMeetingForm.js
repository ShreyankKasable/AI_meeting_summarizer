import React, { useState } from "react";
import styled from "styled-components";
import { AudioWaveform, ArrowRight } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import { H2, Body2 } from "common/global-styled-components";
import ShareService from "services/share.service";

const Screen = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-XXXL) var(--Size-Padding-XL);
`;

const Card = styled.div`
    width: 100%;
    max-width: 400px;
    animation: meetai-fade-in 0.3s ease;
`;

const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XXXL);
`;

const BrandMark = styled.div`
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Text-Inverse);
    background: var(--Color-Background-Action);
    border-radius: var(--Size-CornerRadius-L);
`;

const Subtitle = styled(Body2)`
    margin-top: var(--Size-Gap-M);
    color: var(--Color-Text-Subtle);
`;

const Form = styled.form`
    margin-top: var(--Size-Gap-XXL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XL);
`;

const ToggleRow = styled.div`
    margin-top: var(--Size-Gap-XXL);
    text-align: center;
    font-size: var(--body-3-d);
    color: var(--Color-Text-Subtle);
`;

const ToggleLink = styled.button`
    background: none;
    border: none;
    padding: 0;
    color: var(--Color-Text-Action);
    font-weight: var(--semi-bold);
`;

// A participant only ever has a token/code, not necessarily a full link —
// this is the discoverable entry point for that, reached from the Login
// screen rather than only after landing on a broken /share/:token URL.
const JoinMeetingForm = ({ onBackToLogin }) => {
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
        <Screen>
            <Card>
                <Brand>
                    <BrandMark>
                        <AudioWaveform size={24} />
                    </BrandMark>
                </Brand>
                <H2>Join a meeting</H2>
                <Subtitle>Enter the meeting code your host shared with you.</Subtitle>

                <Form onSubmit={handleSubmit}>
                    <Input
                        label="Meeting Code"
                        mono
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="e.g. MdvQd94WP-V5ZKHuq4YGa0UxgBU2hPdx"
                        id="join-meeting-token"
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
            </Card>
        </Screen>
    );
};

export default JoinMeetingForm;
