import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Button from "common/components/Button";
import Input from "common/components/Input";
import Alert from "common/components/Alert";
import { Body3 } from "common/global-styled-components";
import { login as loginThunk, setHostView } from "common/redux/actions/sessionActions";
import SignupForm from "./SignupForm";
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
    transition: all var(--transition-fast);

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

    &:hover {
        color: var(--Color-Background-Action-Hover);
    }
`;

const Login = ({ initialMode = "login", onBackToLanding, postAuthView }) => {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.sessionDetails.status);

    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await dispatch(loginThunk(email, password));
            if (postAuthView) dispatch(setHostView(postAuthView));
        } catch (err) {
            setError(err.message);
        }
    };

    if (mode === "signup") {
        return (
            <SignupForm
                onBackToLogin={() => setMode("login")}
                onBackToLanding={onBackToLanding}
                postAuthView={postAuthView}
            />
        );
    }

    return (
        <AuthShell
            title={postAuthView ? "Sign in to join" : "Welcome back"}
            subtitle={postAuthView ? "Use your account before opening a shared meeting." : "Sign in to your host workspace."}
            eyebrow={postAuthView ? "Participant access" : "Host access"}
            onBackToLanding={onBackToLanding}
        >
            <SocialGrid>
                <Button type="button" mode="secondary" title="Social login placeholder" disabled>
                    Google
                </Button>
                <Button type="button" mode="secondary" title="Social login placeholder" disabled>
                    Microsoft
                </Button>
            </SocialGrid>
            <Divider>Email sign in</Divider>
            <Form onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="host@meetai.studio"
                    id="login-email"
                    autoComplete="email"
                />
                <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    id="login-password"
                    autoComplete="current-password"
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

                <Alert>{error}</Alert>

                <Button type="submit" block loader={status === "loading"}>
                    Sign In
                    <ArrowRight size={16} />
                </Button>
            </Form>

            <ToggleRow>
                {postAuthView ? "No account?" : "No host account?"}{" "}
                <ToggleLink type="button" onClick={() => setMode("signup")}>
                    Create one
                </ToggleLink>
            </ToggleRow>
        </AuthShell>
    );
};

export default Login;
