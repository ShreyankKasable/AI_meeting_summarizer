import React from "react";
import styled from "styled-components";

const Strip = styled.div`
    display: flex;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-S);
    background: var(--Color-Background-Subtle);
    border-bottom: 1px solid var(--Color-Border-Subtle);
`;

const TabButton = styled.button`
    flex: 1;
    min-height: 36px;
    padding: 0 var(--Size-Padding-L);
    background: ${({ active }) => (active ? "var(--Color-Background-Default)" : "transparent")};
    border: 1px solid ${({ active }) => (active ? "var(--Color-Border-Subtle)" : "transparent")};
    border-radius: var(--Size-CornerRadius-M);
    color: ${({ active }) => (active ? "var(--Color-Text-Bold)" : "var(--Color-Text-Subtle)")};
    box-shadow: ${({ active }) => (active ? "0 1px 2px rgba(17, 19, 22, 0.06)" : "none")};
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    letter-spacing: 0;
    transition: all var(--transition-fast);

    &:hover {
        color: var(--Color-Text-Bold);
        background: ${({ active }) => (active ? "var(--Color-Background-Default)" : "rgba(255, 255, 255, 0.72)")};
    }
`;

const Tabs = ({ tabs, activeId, onChange }) => {
    return (
        <Strip role="tablist">
            {tabs.map((tab) => (
                <TabButton
                    key={tab.id}
                    type="button"
                    role="tab"
                    active={tab.id === activeId}
                    aria-selected={tab.id === activeId}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </TabButton>
            ))}
        </Strip>
    );
};

export default Tabs;
