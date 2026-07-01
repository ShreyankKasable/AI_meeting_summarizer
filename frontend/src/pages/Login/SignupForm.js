import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AudioWaveform, ArrowRight } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import { H2, Body2 } from "common/global-styled-components";
import { signup as signupThunk } from "common/redux/actions/sessionActions";

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

const SignupForm = ({ onBackToLogin }) => {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.sessionDetails.status);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            await dispatch(signupThunk(email, password));
        } catch (err) {
            setError(err.message);
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
                <H2>Create a host account</H2>
                <Subtitle>Start recording, summarizing, and sharing your meetings.</Subtitle>

                <Form onSubmit={handleSubmit}>
                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="host@meetai.studio"
                        id="signup-email"
                    />
                    <Input
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        id="signup-password"
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        id="signup-confirm-password"
                    />

                    <Alert>{error}</Alert>

                    <Button type="submit" block loader={status === "loading"}>
                        Create Account
                        <ArrowRight size={16} />
                    </Button>
                </Form>

                <ToggleRow>
                    Already have an account?{" "}
                    <ToggleLink type="button" onClick={onBackToLogin}>
                        Sign in
                    </ToggleLink>
                </ToggleRow>
            </Card>
        </Screen>
    );
};

export default SignupForm;
