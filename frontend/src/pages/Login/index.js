import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AudioWaveform, ArrowRight, ShieldCheck } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import { H1, H2, Body2 } from "common/global-styled-components";
import { login as loginThunk } from "common/redux/actions/sessionActions";
import SignupForm from "./SignupForm";

const Screen = styled.div`
    min-height: 100vh;
    display: flex;
`;

const FormSide = styled.div`
    flex: 1;
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

const MarketingSide = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-XXXL);
    background: var(--Color-Background-Subtle-2);

    @media (max-width: 1024px) {
        display: none;
    }
`;

const MarketingCard = styled.div`
    max-width: 420px;
`;

const MarketingBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-S) var(--Size-Padding-L);
    background: var(--Color-Background-Default);
    border-radius: var(--Size-CornerRadius-Full);
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    color: var(--Color-Text-Action);
    margin-bottom: var(--Size-Gap-XL);
`;

const Login = () => {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.sessionDetails.status);

    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await dispatch(loginThunk(email, password));
        } catch (err) {
            setError(err.message);
        }
    };

    if (mode === "signup") {
        return <SignupForm onBackToLogin={() => setMode("login")} />;
    }

    return (
        <Screen>
            <FormSide>
                <Card>
                    <Brand>
                        <BrandMark>
                            <AudioWaveform size={24} />
                        </BrandMark>
                    </Brand>
                    <H2>Welcome back</H2>
                    <Subtitle>Sign in to your MeetAI host workspace.</Subtitle>

                    <Form onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="host@meetai.studio"
                            id="login-email"
                        />
                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            id="login-password"
                        />

                        <Alert>{error}</Alert>

                        <Button type="submit" block loader={status === "loading"}>
                            Sign In
                            <ArrowRight size={16} />
                        </Button>
                    </Form>

                    <ToggleRow>
                        Don&apos;t have a host account?{" "}
                        <ToggleLink type="button" onClick={() => setMode("signup")}>
                            Create an account
                        </ToggleLink>
                    </ToggleRow>
                </Card>
            </FormSide>

            <MarketingSide>
                <MarketingCard>
                    <MarketingBadge>
                        <ShieldCheck size={14} />
                        Precision Intelligence
                    </MarketingBadge>
                    <H1 style={{ fontSize: "var(--h2-d)" }}>
                        Elevate every conversation with Precision Intelligence
                    </H1>
                    <Body2 style={{ marginTop: "var(--Size-Gap-XL)", color: "var(--Color-Text-Subtle)" }}>
                        MeetAI transforms raw dialogue into actionable clarity — transcripts, summaries,
                        action items, and an AI you can ask anything about your meeting.
                    </Body2>
                </MarketingCard>
            </MarketingSide>
        </Screen>
    );
};

export default Login;
