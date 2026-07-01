import React from "react";
import styled from "styled-components";

const Strip = styled.div`
    display: flex;
    border-bottom: 1px solid var(--Color-Border-Subtle);
`;

const TabButton = styled.button`
    flex: 1;
    padding: var(--Size-Padding-L) var(--Size-Padding-M);
    background: none;
    border: none;
    border-bottom: 2px solid ${({ active }) => (active ? "var(--Color-Border-Action)" : "transparent")};
    color: ${({ active }) => (active ? "var(--Color-Text-Action)" : "var(--Color-Text-Subtlest)")};
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    transition: all 0.15s ease;

    &:hover {
        color: var(--Color-Text-Action);
    }
`;

// Controlled tab strip. `tabs` is [{ id, label }]; `activeId`/`onChange` are
// owned by the parent so it can render whatever content goes with each tab.
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
