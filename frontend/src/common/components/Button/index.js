import React from "react";
import styled, { css } from "styled-components";
import { Loader2 } from "lucide-react";

const sizeStyles = {
    small: css`
        min-height: 34px;
        padding: 0 var(--Size-Padding-L);
        font-size: var(--body-3-d);
        gap: var(--Size-Gap-S);
    `,
    default: css`
        min-height: 42px;
        padding: 0 var(--Size-Padding-XL);
        font-size: var(--body-2-d);
        gap: var(--Size-Gap-M);
    `,
    large: css`
        min-height: 52px;
        padding: 0 var(--Size-Padding-XXL);
        font-size: var(--body-1-d);
        gap: var(--Size-Gap-L);
    `,
};

const BaseButton = styled.button`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--Size-CornerRadius-M);
    font-family: var(--body-font);
    font-weight: var(--semi-bold);
    letter-spacing: 0;
    white-space: nowrap;
    transition:
        transform var(--transition-fast),
        box-shadow var(--transition-fast),
        border-color var(--transition-fast),
        background var(--transition-fast),
        color var(--transition-fast);
    ${({ $size }) => sizeStyles[$size] || sizeStyles.default};
    ${({ $block }) => $block && "width: 100%;"};

    svg {
        flex-shrink: 0;
    }

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.58;
        pointer-events: none;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    box-shadow: var(--Color-Shadow-Action);

    &:hover:not(:disabled) {
        background: var(--Color-Background-Action-Hover);
        box-shadow: 0 18px 34px rgba(15, 118, 110, 0.28);
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: var(--Color-Background-Default);
    color: var(--Color-Text-Bold);
    border-color: var(--Color-Border-Default);
    box-shadow: 0 1px 1px rgba(17, 19, 22, 0.04);

    &:hover:not(:disabled) {
        background: #fbfcfd;
        border-color: var(--Color-Border-Bold);
        box-shadow: var(--Color-Shadow-Card);
    }
`;

const DarkButton = styled(BaseButton)`
    background: var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);
    box-shadow: 0 14px 32px rgba(17, 19, 22, 0.22);

    &:hover:not(:disabled) {
        background: var(--Color-Background-Bold-2);
    }
`;

const GhostButton = styled(BaseButton)`
    background: transparent;
    color: var(--Color-Text-Subtle);

    &:hover:not(:disabled) {
        background: var(--Color-Background-Subtle-2);
        color: var(--Color-Text-Bold);
    }
`;

const DangerButton = styled(BaseButton)`
    background: var(--Color-Background-Accent-Danger);
    border-color: var(--Color-Border-Accent-Danger);
    color: var(--Color-Text-Danger);

    &:hover:not(:disabled) {
        background: #ffe7e3;
        border-color: #efaaa2;
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
    danger: DangerButton,
};

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
        <ButtonComponent $size={size} $block={block} disabled={disabled || loader} {...props}>
            {loader ? (
                <Loader aria-label="Loading">
                    <Loader2 size={16} />
                </Loader>
            ) : (
                children
            )}
        </ButtonComponent>
    );
};

export default Button;
