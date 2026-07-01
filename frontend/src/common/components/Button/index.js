import React from "react";
import styled, { css } from "styled-components";
import { Loader2 } from "lucide-react";

const sizeStyles = {
    small: css`
        height: 32px;
        padding: 0 var(--Size-Padding-L);
        font-size: var(--body-3-d);
        gap: var(--Size-Gap-S);
    `,
    default: css`
        height: 40px;
        padding: 0 var(--Size-Padding-XL);
        font-size: var(--body-2-d);
        gap: var(--Size-Gap-M);
    `,
    large: css`
        height: 52px;
        padding: 0 var(--Size-Padding-XXL);
        font-size: var(--body-1-d);
        gap: var(--Size-Gap-L);
    `,
};

const BaseButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--Size-CornerRadius-L);
    font-family: var(--body-font);
    font-weight: var(--semi-bold);
    white-space: nowrap;
    transition: all 0.2s ease;
    ${({ size }) => sizeStyles[size] || sizeStyles.default};
    ${({ block }) => block && "width: 100%;"};

    &:disabled {
        opacity: 0.55;
        pointer-events: none;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    box-shadow: var(--Color-Shadow-Action);

    &:hover {
        background: var(--Color-Background-Action-Hover);
        transform: translateY(-1px);
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: var(--Color-Background-Default);
    color: var(--Color-Text-Action);
    border-color: var(--Color-Border-Default);

    &:hover {
        background: var(--Color-Background-Subtle);
        border-color: var(--Color-Border-Action);
    }
`;

const DarkButton = styled(BaseButton)`
    background: var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);

    &:hover {
        background: var(--Color-Background-Bold-2);
    }
`;

const GhostButton = styled(BaseButton)`
    background: transparent;
    color: var(--Color-Text-Subtle);

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Default);
    }
`;

const Loader = styled.span`
    display: inline-flex;
    animation: meetai-spin 0.8s linear infinite;
`;

const BUTTON_COMPONENTS = {
    primary: PrimaryButton,
    secondary: SecondaryButton,
    dark: DarkButton,
    ghost: GhostButton,
};

// mode = "primary" | "secondary" | "dark" | "ghost"; size = "small" | "default" | "large".
const Button = ({
    children,
    mode = "primary",
    size = "default",
    block = false,
    loader = false,
    disabled = false,
    ...props
}) => {
    const ButtonComponent = BUTTON_COMPONENTS[mode] || PrimaryButton;
    return (
        <ButtonComponent size={size} block={block} disabled={disabled || loader} {...props}>
            {loader ? (
                <Loader>
                    <Loader2 size={16} />
                </Loader>
            ) : (
                children
            )}
        </ButtonComponent>
    );
};

export default Button;
