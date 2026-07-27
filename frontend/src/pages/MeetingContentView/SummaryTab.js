import React from "react";
import styled from "styled-components";
import { FileText } from "lucide-react";
import { H3, Body2, Body3 } from "common/global-styled-components";

const Wrapper = styled.div`
    padding: var(--Size-Padding-XXL);
`;

const EmptyState = styled.div`
    min-height: 220px;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXL);
    border: 1px dashed var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XL);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--Size-Gap-L);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Accent-Info);
    color: var(--Color-Icon-Info);
`;

const SummaryText = styled(Body2)`
    white-space: pre-wrap;
    line-height: var(--line-height-160);
`;

const SummaryTab = ({ summary }) => {
    if (!summary) {
        return (
            <Wrapper>
                <EmptyState>
                    <div>
                        <EmptyIcon>
                            <FileText size={20} />
                        </EmptyIcon>
                        <H3 style={{ fontSize: "var(--subtitle-2-d)" }}>No summary yet</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>The summary will appear after processing.</Body3>
                    </div>
                </EmptyState>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <SummaryText>{summary}</SummaryText>
        </Wrapper>
    );
};

export default SummaryTab;
