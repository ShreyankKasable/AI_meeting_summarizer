import React from "react";
import styled from "styled-components";
import { Bell, Mail, MessageSquare } from "lucide-react";
import Badge from "common/components/Badge";
import { H3, Body2, Body3 } from "common/global-styled-components";

const Card = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-Card);
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    margin-bottom: var(--Size-Gap-XXL);
`;

const Options = styled.div`
    display: grid;
    gap: var(--Size-Gap-L);
`;

const Option = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
    opacity: 0.74;
`;

const IconBox = styled.div`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    color: var(--Color-Icon-Subtle);
`;

const Toggle = styled.span`
    width: 42px;
    height: 24px;
    border-radius: var(--Size-CornerRadius-Full);
    background: var(--Color-Background-Subtle-3);
    position: relative;

    &::after {
        content: "";
        position: absolute;
        width: 18px;
        height: 18px;
        left: 3px;
        top: 3px;
        border-radius: var(--Size-CornerRadius-Full);
        background: var(--Color-Background-Default);
        box-shadow: 0 1px 3px rgba(17, 19, 22, 0.16);
    }
`;

const NotificationsTab = () => (
    <Card>
        <Header>
            <div>
                <H3>Notifications</H3>
                <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-S)" }}>
                    Notification preferences are coming soon.
                </Body2>
            </div>
            <Badge tone="neutral">Placeholder</Badge>
        </Header>
        <Options>
            <Option>
                <IconBox>
                    <Bell size={17} />
                </IconBox>
                <Body3>Processing completed</Body3>
                <Toggle />
            </Option>
            <Option>
                <IconBox>
                    <Mail size={17} />
                </IconBox>
                <Body3>Weekly digest</Body3>
                <Toggle />
            </Option>
            <Option>
                <IconBox>
                    <MessageSquare size={17} />
                </IconBox>
                <Body3>Participant comments</Body3>
                <Toggle />
            </Option>
        </Options>
    </Card>
);

export default NotificationsTab;
