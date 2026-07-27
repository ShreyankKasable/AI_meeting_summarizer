import React, { useState } from "react";
import styled from "styled-components";
import { KeyRound, NotebookTabs } from "lucide-react";
import Badge from "common/components/Badge";
import Input from "common/components/Input";
import { H3, Body2, Body3 } from "common/global-styled-components";

const Card = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
`;

const Header = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--Size-Gap-L);
    margin-bottom: var(--Size-Gap-XL);

    @media (max-width: 560px) {
        grid-template-columns: auto 1fr;

        > span:last-child {
            grid-column: 1 / -1;
            width: fit-content;
        }
    }
`;

const IconBox = styled.div`
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Icon-Action);
`;

const IconAddon = styled.span`
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Icon-Subtle);
`;

const IntegrationsTab = ({ status, onSave }) => {
    const [apiKey, setApiKey] = useState("");
    if (!status) return null;

    const notion = status.integrations.notion;

    return (
        <Card>
            <Header>
                <IconBox>
                    <NotebookTabs size={20} />
                </IconBox>
                <div>
                    <H3>Notion</H3>
                    <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>Sync summaries to your workspace</Body3>
                </div>
                <Badge tone={notion.configured ? "success" : "neutral"}>
                    {notion.configured ? "Connected" : "Not configured"}
                </Badge>
            </Header>
            <Body2 style={{ color: "var(--Color-Text-Subtle)", marginBottom: "var(--Size-Gap-XL)" }}>
                Add an integration key to enable meeting exports from the meeting detail page.
            </Body2>
            <Input
                label="Integration Key"
                type="password"
                placeholder={notion.configured ? "Key is already set" : "Enter Notion API key"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={() => apiKey && onSave("notion", "api_key", apiKey)}
                addon={
                    <IconAddon>
                        <KeyRound size={15} />
                    </IconAddon>
                }
            />
        </Card>
    );
};

export default IntegrationsTab;
