import React from "react";
import styled from "styled-components";
import { Body2 } from "common/global-styled-components";

const Wrapper = styled.div`
    padding: var(--Size-Padding-XL);
`;

const Placeholder = styled(Body2)`
    color: var(--Color-Text-Subtlest);
`;

const SummaryTab = ({ summary }) => {
    if (!summary) return <Wrapper><Placeholder>No summary available yet.</Placeholder></Wrapper>;
    return (
        <Wrapper>
            <Body2 style={{ whiteSpace: "pre-wrap", lineHeight: "var(--line-height-140)" }}>{summary}</Body2>
        </Wrapper>
    );
};

export default SummaryTab;
