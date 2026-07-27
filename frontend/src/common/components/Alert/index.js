import React from "react";
import styled from "styled-components";
import { AlertCircle } from "lucide-react";

const Wrapper = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-L);
    background: var(--Color-Background-Accent-Danger);
    border: 1px solid var(--Color-Border-Accent-Danger);
    border-radius: var(--Size-CornerRadius-M);
    color: var(--Color-Text-Danger);
    font-size: var(--body-3-d);
    font-weight: var(--medium);
    line-height: var(--line-height-140);

    svg {
        flex-shrink: 0;
        margin-top: 1px;
    }
`;

const Alert = ({ children, ...props }) => {
    if (!children) return null;
    return (
        <Wrapper role="alert" {...props}>
            <AlertCircle size={16} />
            <span>{children}</span>
        </Wrapper>
    );
};

export default Alert;
