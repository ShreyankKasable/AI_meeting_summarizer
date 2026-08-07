import React from "react";
import styled from "styled-components";

const Strip = styled.div`
    display: flex;
    gap: var(--Size-Gap-XXL);
    padding: 0 var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    overflow-x: auto;
`;

const TabButton = styled.button`
    position: relative;
    min-height: 48px;
    padding: 0 0 var(--Size-Padding-S);
    background: transparent;
    border: none;
    color: ${({ active }) => (active ? "var(--Color-Text-Bold)" : "var(--Color-Text-Subtle)")};
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    letter-spacing: 0;
    white-space: nowrap;
    transition: color var(--transition-fast);

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: ${({ active }) => (active ? "var(--Color-Border-Action)" : "transparent")};
    }

    &:hover {
        color: var(--Color-Text-Bold);
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
