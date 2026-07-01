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
    neutral: css`
        background: var(--Color-Background-Subtle-2);
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

// Small pill used for status, priority, and eyebrow chips.
const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-S) var(--Size-Padding-L);
    border: 1px solid transparent;
    border-radius: var(--Size-CornerRadius-Full);
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    white-space: nowrap;
    ${({ tone }) => tones[tone] || tones.action};
    ${({ uppercase }) => uppercase && "text-transform: uppercase;"};
`;

export default Badge;
