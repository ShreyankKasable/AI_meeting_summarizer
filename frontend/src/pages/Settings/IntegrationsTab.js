import React, { useState } from "react";
import styled from "styled-components";
import Badge from "common/components/Badge";
import Input from "common/components/Input";
import { Body2, Body3 } from "common/global-styled-components";

const Card = styled.div`
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--Size-Gap-L);
`;

const IntegrationsTab = ({ status, onSave }) => {
    const [apiKey, setApiKey] = useState("");
    if (!status) return null;

    const notion = status.integrations.notion;

    return (
        <Card>
            <Header>
                <div>
                    <Body2 style={{ fontWeight: "var(--bold)" }}>Notion</Body2>
                    <Body3 style={{ color: "var(--Color-Text-Subtle)" }}>Sync summaries to your workspace</Body3>
                </div>
                <Badge tone={notion.configured ? "success" : "neutral"}>
                    {notion.configured ? "Connected" : "Not Configured"}
                </Badge>
            </Header>
            <Input
                label="Integration Key"
                type="password"
                placeholder={notion.configured ? "•••••••••••• (set)" : "Enter Notion API key"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={() => apiKey && onSave("notion", "api_key", apiKey)}
            />
        </Card>
    );
};

export default IntegrationsTab;
