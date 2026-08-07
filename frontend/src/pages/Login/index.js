import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Alert from "common/components/Alert";
import { login as loginThunk, setHostView } from "common/redux/actions/sessionActions";
import SignupForm from "./SignupForm";
import AuthShell from "./AuthShell";

const Form = styled.form`
    display: grid;
    gap: var(--Auth-Form-Gap);
`;

const Field = styled.div`
    display: grid;
    gap: var(--Auth-Field-Gap);
`;

const LabelRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
`;

const Label = styled.label`
    display: block;
    color: var(--Auth-Color-Label);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
`;

const ForgotButton = styled.button`
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--mono-font);
    font-size: var(--Auth-Forgot-Font-Size);
    line-height: var(--Auth-Forgot-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Small-Label-Tracking);
    text-transform: uppercase;
    transition: color var(--Auth-Transition);

    &:hover {
        color: var(--Auth-Color-Primary);
        text-decoration: underline;
    }
`;

const InputShell = styled.div`
    position: relative;
`;

const TextInput = styled.input`
    width: 100%;
    height: var(--Auth-Control-Height);
    display: block;
    padding: 0
        ${({ $hasAddon }) =>
            $hasAddon ? "var(--Auth-Control-Addon-Padding-X)" : "var(--Auth-Control-Padding-X)"}
        0 var(--Auth-Control-Padding-X);
    border: var(--Auth-Border-Width) solid var(--Auth-Color-Border);
    border-radius: var(--Auth-Control-Radius);
    outline: none;
    background: var(--Auth-Color-Control-Background);
    color: var(--Auth-Color-Text);
    font-family: var(--body-font);
    font-size: var(--body-2-d);
    line-height: var(--Auth-Control-Line-Height);
    font-weight: var(--regular);
    transition:
        border-color var(--Auth-Transition),
        background var(--Auth-Transition);

    &::placeholder {
        color: var(--Auth-Color-Control-Placeholder);
    }

    &:focus {
        border-color: var(--Auth-Color-Primary);
        background: var(--Auth-Color-Control-Background);
        box-shadow: none;
    }
`;

const PasswordToggle = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    width: var(--Auth-Control-Height);
    height: var(--Auth-Control-Height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: var(--Auth-Color-Text-Secondary);
    transition: color var(--Auth-Transition);

    svg {
        width: var(--Auth-Control-Icon-Size);
        height: var(--Auth-Control-Icon-Size);
        stroke-width: var(--Auth-Icon-Stroke);
    }

    &:hover {
        color: var(--Auth-Color-Primary);
    }
`;

const ActionArea = styled.div`
    padding-top: var(--Auth-Action-Top-Gap);
`;

const PrimaryButton = styled.button`
    width: 100%;
    height: var(--Auth-Control-Height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--Auth-Control-Radius);
    background: var(--Auth-Color-Primary);
    color: var(--Color-Text-Inverse);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
    transition: background var(--Auth-Transition);

    &:hover:not(:disabled) {
        background: var(--Auth-Color-Primary-Hover);
    }

    &:disabled {
        opacity: var(--Auth-Disabled-Opacity);
        cursor: not-allowed;
    }
`;

const Divider = styled.div`
    position: relative;
    margin: var(--Auth-Divider-Top-Gap) 0 var(--Auth-Divider-Bottom-Gap);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--Auth-Color-Text-Tertiary);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: var(--Auth-Border-Width);
        background: var(--Auth-Color-Border);
    }

    span {
        position: relative;
        z-index: 1;
        padding: 0 var(--Auth-Control-Padding-X);
        background: var(--Auth-Color-Surface);
    }
`;

const GoogleButton = styled.button`
    width: 100%;
    height: var(--Auth-Control-Height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--Auth-Button-Gap);
    border: var(--Auth-Border-Width) solid var(--Auth-Color-Border);
    border-radius: var(--Auth-Control-Radius);
    background: var(--Auth-Color-Surface);
    color: var(--Auth-Color-Text);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
    transition: background var(--Auth-Transition);

    &:hover {
        background: var(--Auth-Color-Surface-Subtle);
    }

    svg {
        width: var(--Auth-Google-Icon-Size);
        height: var(--Auth-Google-Icon-Size);
        flex-shrink: 0;
    }
`;

const ToggleText = styled.p`
    margin: 0;
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--body-font);
    font-size: var(--body-3-d);
    line-height: var(--Auth-Footer-Line-Height);
`;

const ToggleLink = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--Auth-Link-Gap);
    margin-left: var(--Auth-Icon-Gap);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Auth-Color-Primary);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;

    svg {
        width: var(--Auth-Link-Icon-Size);
        height: var(--Auth-Link-Icon-Size);
        flex-shrink: 0;
        stroke-width: var(--Auth-Icon-Stroke);
    }

    &:hover {
        text-decoration: underline;
    }
`;

const GoogleLogo = () => (
    <svg fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.7 17.57V20.34H19.26C21.34 18.42 22.56 15.6 22.56 12.25Z"
            fill="var(--Auth-Color-Google-Blue)"
        />
        <path
            d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.7 17.57C14.73 18.22 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.22V16.97C4.02 20.55 7.7 23 12 23Z"
            fill="var(--Auth-Color-Google-Green)"
        />
        <path
            d="M5.88 14.13C5.66 13.47 5.54 12.75 5.54 12C5.54 11.25 5.66 10.53 5.88 9.87V7.03H2.22C1.48 8.5 1.05 10.19 1.05 12C1.05 13.81 1.48 15.5 2.22 16.97L5.88 14.13Z"
            fill="var(--Auth-Color-Google-Yellow)"
        />
        <path
            d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.33 3.89C17.45 2.14 14.97 1 12 1C7.7 1 4.02 3.45 2.22 7.03L5.88 9.87C6.74 7.29 9.15 5.38 12 5.38Z"
            fill="var(--Auth-Color-Google-Red)"
        />
    </svg>
);

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
            title="Access your workspace"
            subtitle="Sign in to review transcripts and generate insights."
            onBackToLanding={onBackToLanding}
            footer={
                <ToggleText>
                    Don't have an account?
                    <ToggleLink type="button" onClick={() => setMode("signup")}>
                        Create an account
                        <ArrowRight aria-hidden="true" />
                    </ToggleLink>
                </ToggleText>
            }
        >
            <Form onSubmit={handleSubmit}>
                <Field>
                    <Label htmlFor="login-email">Email Address</Label>
                    <TextInput
                        id="login-email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@editorial.co"
                        autoComplete="email"
                    />
                </Field>

                <Field>
                    <LabelRow>
                        <Label htmlFor="login-password">Password</Label>
                        <ForgotButton type="button">Forgot?</ForgotButton>
                    </LabelRow>
                    <InputShell>
                        <TextInput
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            autoComplete="current-password"
                            $hasAddon
                        />
                        <PasswordToggle
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                        </PasswordToggle>
                    </InputShell>
                </Field>

                <Alert>{error}</Alert>

                <ActionArea>
                    <PrimaryButton type="submit" disabled={status === "loading"}>
                        {status === "loading" ? "Signing in" : "Get Started"}
                    </PrimaryButton>
                </ActionArea>
            </Form>

            <Divider>
                <span>Or</span>
            </Divider>

            <GoogleButton type="button" title="Google sign-in placeholder">
                <GoogleLogo />
                Continue with Google
            </GoogleButton>
        </AuthShell>
    );
};

export default Login;
