import React from "react";
import styled from "styled-components";
import { AlertCircle } from "lucide-react";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-L);
    background: var(--Color-Background-Accent-Danger);
    border: 1px solid var(--Color-Border-Accent-Danger);
    border-radius: var(--Size-CornerRadius-L);
    color: var(--Color-Text-Danger);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);

    svg {
        flex-shrink: 0;
    }
`;

// Inline error / warning banner. Renders nothing if there's no message.
const Alert = ({ children, ...props }) => {
    if (!children) return null;
    return (
        <Wrapper {...props}>
            <AlertCircle size={16} />
            <span>{children}</span>
        </Wrapper>
    );
};

export default Alert;
