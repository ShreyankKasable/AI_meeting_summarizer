import React from "react";
import styled, { css } from "styled-components";

const tones = {
    action: css`
        background: var(--Color-Background-Accent-Action);
        color: var(--Color-Text-Action);
        border-color: var(--Color-Border-Accent-Action);
    `,
    success: css`
        background: var(--Color-Background-Accent-Success);
        color: var(--Color-Text-Success);
        border-color: var(--Color-Border-Accent-Success);
    `,
    warning: css`
        background: var(--Color-Background-Accent-Warning);
        color: var(--Color-Text-Warning);
        border-color: var(--Color-Border-Accent-Warning);
    `,
    danger: css`
        background: var(--Color-Background-Accent-Danger);
        color: var(--Color-Text-Danger);
        border-color: var(--Color-Border-Accent-Danger);
    `,
    info: css`
        background: var(--Color-Background-Accent-Info);
        color: var(--Color-Text-Info);
        border-color: var(--Color-Border-Accent-Info);
    `,
    neutral: css`
        background: var(--Color-Background-Default);
        color: var(--Color-Text-Subtle);
        border-color: var(--Color-Border-Default);
    `,
    solidSuccess: css`
        background: var(--Color-Icon-Success);
        color: var(--Color-Text-Inverse);
        border-color: transparent;
    `,
    solidAction: css`
        background: var(--Color-Background-Action);
        color: var(--Color-Text-Inverse);
        border-color: transparent;
    `,
    solidDark: css`
        background: var(--Color-Background-Bold-2);
        color: var(--Color-Text-Inverse);
        border-color: transparent;
    `,
};

const BadgeBase = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--Size-Gap-S);
    min-height: 24px;
    padding: 3px 9px;
    border: 1px solid transparent;
    border-radius: var(--Size-CornerRadius-Full);
    font-size: var(--body-4-d);
    font-weight: var(--semi-bold);
    letter-spacing: 0;
    line-height: 1;
    white-space: nowrap;
    ${({ $tone }) => tones[$tone] || tones.action};
    ${({ $uppercase }) => $uppercase && "text-transform: uppercase;"};
`;

const Badge = ({ tone = "action", uppercase = false, ...props }) => (
    <BadgeBase $tone={tone} $uppercase={uppercase} {...props} />
);

export default Badge;
