import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Cpu, Sliders, Bell } from "lucide-react";
import PageContainer from "common/components/PageContainer";
import { H1, Body2, Body3 } from "common/global-styled-components";
import { fetchSettings, saveSetting } from "common/redux/actions/settingsActions";
import AiProvidersTab from "./AiProvidersTab";
import IntegrationsTab from "./IntegrationsTab";
import NotificationsTab from "./NotificationsTab";

const Layout = styled.div`
    display: flex;
    gap: var(--Size-Gap-XXL);
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const TabRail = styled.div`
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-S);
`;

const TabButton = styled.button`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-M) var(--Size-Padding-L);
    border: none;
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ active }) => (active ? "var(--Color-Background-Accent-Action)" : "transparent")};
    color: ${({ active }) => (active ? "var(--Color-Text-Action)" : "var(--Color-Text-Subtle)")};
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    text-align: left;
`;

const Content = styled.div`
    flex: 1;
    min-width: 0;
`;

const SavedNote = styled(Body3)`
    color: var(--Color-Text-Subtlest);
    font-style: italic;
    margin-top: var(--Size-Gap-XL);
`;

const TABS = [
    { id: "providers", label: "AI Providers", icon: Cpu },
    { id: "integrations", label: "Integrations", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
];

const Settings = () => {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.settingsDetails.status);
    const lastSavedAt = useSelector((state) => state.settingsDetails.lastSavedAt);
    const [activeTab, setActiveTab] = useState("providers");

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const handleSave = (provider, field, value) => {
        dispatch(saveSetting(provider, field, value));
    };

    return (
        <PageContainer size="xl">
            <H1 style={{ fontSize: "var(--h2-d)" }}>AI Engine Configuration</H1>
            <Body2 style={{ color: "var(--Color-Text-Subtle)", margin: "var(--Size-Gap-M) 0 var(--Size-Gap-XXL)" }}>
                Configure the AI models and external services powering transcription, summarization, and chat.
            </Body2>

            <Layout>
                <TabRail>
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <TabButton key={id} type="button" active={activeTab === id} onClick={() => setActiveTab(id)}>
                            <Icon size={16} />
                            {label}
                        </TabButton>
                    ))}
                </TabRail>

                <Content>
                    {activeTab === "providers" && <AiProvidersTab status={status} onSave={handleSave} />}
                    {activeTab === "integrations" && <IntegrationsTab status={status} onSave={handleSave} />}
                    {activeTab === "notifications" && <NotificationsTab />}

                    {lastSavedAt && <SavedNote>Last saved {new Date(lastSavedAt).toLocaleTimeString()}</SavedNote>}
                </Content>
            </Layout>
        </PageContainer>
    );
};

export default Settings;
