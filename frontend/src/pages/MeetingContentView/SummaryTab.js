import React from "react";
import styled from "styled-components";
import { Body3 } from "common/global-styled-components";
import MarkdownContent from "common/components/MarkdownContent";

const Wrapper = styled.div`
    padding: var(--Size-Padding-XXL);
    min-height: 100%;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const SummaryPanel = styled.div`
    min-height: 520px;
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
`;

const EmptySummary = styled(Body3)`
    color: var(--Color-Text-Subtle);
`;

const SummaryTab = ({ summary }) => {
    if (!summary) {
        return (
            <Wrapper>
                <SummaryPanel>
                    <EmptySummary>No summary generated</EmptySummary>
                </SummaryPanel>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <SummaryPanel>
                <MarkdownContent variant="summary">{summary}</MarkdownContent>
            </SummaryPanel>
        </Wrapper>
    );
};

export default SummaryTab;
