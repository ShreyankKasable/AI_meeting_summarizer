import React from "react";
import styled, { css } from "styled-components";

const sizes = {
    small: css`
        width: 24px;
        height: 24px;
        font-size: var(--body-5-d);
    `,
    default: css`
        width: 32px;
        height: 32px;
        font-size: var(--body-4-d);
    `,
    large: css`
        width: 40px;
        height: 40px;
        font-size: var(--body-3-d);
    `,
};

const PALETTE = [
    "var(--Color-Background-Action)",
    "var(--Color-Text-Success)",
    "#924700",
    "var(--Color-Text-Danger)",
    "#4648d4",
];

const paletteIndex = (seed) => {
    const s = String(seed || "");
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash + s.charCodeAt(i)) % PALETTE.length;
    return hash;
};

const Circle = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: var(--Size-CornerRadius-Full);
    font-weight: var(--bold);
    color: var(--Color-Text-Inverse);
    background: ${({ bg }) => bg};
    border: 2px solid var(--Color-Background-Default);
    overflow: hidden;
    ${({ size }) => sizes[size] || sizes.default};

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const initials = (name) =>
    (name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?";

// Circular avatar — renders an image if `src` is given, otherwise initials
// derived from `name` on a colour picked deterministically from the name.
const Avatar = ({ name, src, size = "default", ...props }) => {
    return (
        <Circle bg={PALETTE[paletteIndex(name)]} size={size} {...props}>
            {src ? <img src={src} alt={name || ""} /> : initials(name)}
        </Circle>
    );
};

export default Avatar;
