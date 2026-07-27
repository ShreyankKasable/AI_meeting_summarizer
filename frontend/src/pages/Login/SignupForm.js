import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import { Body3 } from "common/global-styled-components";
import { signup as signupThunk } from "common/redux/actions/sessionActions";
import AuthShell from "./AuthShell";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XL);
`;

const PasswordToggle = styled.button`
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--Size-CornerRadius-S);
    background: transparent;
    color: var(--Color-Icon-Subtle);

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Bold);
    }
`;

const SocialGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XL);

    @media (max-width: 420px) {
        grid-template-columns: 1fr;
    }
`;

const Divider = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XL);
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-4-d);

    &::before,
    &::after {
        content: "";
        height: 1px;
        background: var(--Color-Border-Subtle);
    }
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

const SignupForm = ({ onBackToLogin, onBackToLanding }) => {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.sessionDetails.status);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");

    const passwordHelp = useMemo(() => {
        if (!password) return "Use at least 8 characters.";
        if (password.length < 8) return "Password is too short.";
        return "Password length looks good.";
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await dispatch(signupThunk(email, password));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AuthShell
            title="Create your workspace"
            subtitle="Register a host account and start capturing meeting context."
            eyebrow="Get started"
            onBackToLanding={onBackToLanding}
        >
            <SocialGrid>
                <Button type="button" mode="secondary" title="Social signup placeholder" disabled>
                    Google
                </Button>
                <Button type="button" mode="secondary" title="Social signup placeholder" disabled>
                    Microsoft
                </Button>
            </SocialGrid>
            <Divider>Email registration</Divider>
            <Form onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="host@meetai.studio"
                    id="signup-email"
                    autoComplete="email"
                />
                <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    id="signup-password"
                    autoComplete="new-password"
                    helpText={passwordHelp}
                    addon={
                        <PasswordToggle
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </PasswordToggle>
                    }
                />
                <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    id="signup-confirm-password"
                    autoComplete="new-password"
                    error={confirmPassword && password !== confirmPassword ? "Passwords do not match." : ""}
                    addon={
                        <PasswordToggle
                            type="button"
                            onClick={() => setShowConfirmPassword((value) => !value)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </PasswordToggle>
                    }
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
        </AuthShell>
    );
};

export default SignupForm;
