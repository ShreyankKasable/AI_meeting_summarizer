import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Bell, CheckCircle2, Cpu, Loader2, Sliders, UserRound } from "lucide-react";
import PageContainer from "common/components/PageContainer";
import Badge from "common/components/Badge";
import { SkeletonBlock, SkeletonCard, SkeletonStack } from "common/components/Skeleton";
import { H1, Body2, Body3, Eyebrow } from "common/global-styled-components";
import { fetchSettings, saveSetting } from "common/redux/actions/settingsActions";
import AccountWorkspaceTab from "./AccountWorkspaceTab";
import AiProvidersTab from "./AiProvidersTab";
import IntegrationsTab from "./IntegrationsTab";
import NotificationsTab from "./NotificationsTab";

const Header = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: var(--Size-Gap-XXL);
    margin-bottom: var(--Size-Gap-XXXL);
    padding-bottom: var(--Size-Padding-XXXL);
    border-bottom: 1px solid var(--Color-Border-Subtle);

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
    }
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 272px minmax(0, 1fr);
    gap: var(--Size-Gap-XXL);
    align-items: flex-start;

    @media (max-width: 860px) {
        grid-template-columns: 1fr;
    }
`;

const TabRail = styled.div`
    position: sticky;
    top: var(--Size-Gap-XXL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-M);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: var(--Color-Shadow-Card);

    @media (max-width: 860px) {
        position: static;
        flex-direction: row;
        overflow-x: auto;
    }
`;

const TabButton = styled.button`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    min-height: 44px;
    padding: 0 var(--Size-Padding-L);
    border: 1px solid ${({ $active }) => ($active ? "var(--Color-Border-Action)" : "transparent")};
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ $active }) => ($active ? "var(--Color-Background-Accent-Action)" : "transparent")};
    color: ${({ $active }) => ($active ? "var(--Color-Text-Bold)" : "var(--Color-Text-Subtle)")};
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    text-align: left;
    white-space: nowrap;

    svg {
        color: ${({ $active }) =>
            $active ? "var(--Color-Icon-Action)" : "var(--Color-Icon-Subtle)"};
    }

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Bold);
    }
`;

const Content = styled.div`
    min-width: 0;
`;

const StatusBadge = styled(Badge)`
    width: fit-content;
`;

const Spinner = styled.span`
    display: inline-flex;
    animation: meetai-spin 0.9s linear infinite;
`;

const SavedNote = styled(Body3)`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    color: var(--Color-Text-Subtlest);
`;

const LoadingGrid = styled.div`
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const TABS = [
    { id: "account", label: "Account & Workspace", icon: UserRound },
    { id: "providers", label: "AI Providers", icon: Cpu },
    { id: "integrations", label: "Integrations", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
];

const Settings = () => {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.settingsDetails.status);
    const saving = useSelector((state) => state.settingsDetails.saving);
    const lastSavedAt = useSelector((state) => state.settingsDetails.lastSavedAt);
    const user = useSelector((state) => state.sessionDetails.user);
    const [activeTab, setActiveTab] = useState("account");

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const handleSave = (provider, field, value) => {
        dispatch(saveSetting(provider, field, value)).catch(() => {});
    };

    return (
        <PageContainer size="xl">
            <Header>
                <div>
                    <Eyebrow>System settings</Eyebrow>
                    <H1 style={{ marginTop: "var(--Size-Gap-L)" }}>Workspace Configuration</H1>
                    <Body2
                        style={{
                            color: "var(--Color-Text-Subtle)",
                            marginTop: "var(--Size-Gap-M)",
                        }}
                    >
                        Configure account context, providers, integrations, notifications, and data
                        policies for the EchoDesk AI workspace.
                    </Body2>
                </div>
                {saving ? (
                    <StatusBadge tone="info">
                        <Spinner>
                            <Loader2 size={13} />
                        </Spinner>
                        Saving
                    </StatusBadge>
                ) : lastSavedAt ? (
                    <SavedNote>
                        <CheckCircle2 size={15} color="var(--Color-Icon-Success)" />
                        Last saved {new Date(lastSavedAt).toLocaleTimeString()}
                    </SavedNote>
                ) : null}
            </Header>

            <Layout>
                <TabRail>
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <TabButton
                            key={id}
                            type="button"
                            $active={activeTab === id}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon size={16} />
                            {label}
                        </TabButton>
                    ))}
                </TabRail>

                <Content>
                    {!status ? (
                        <LoadingGrid>
                            <SkeletonCard>
                                <SkeletonStack>
                                    <SkeletonBlock width="160px" height="20px" />
                                    <SkeletonBlock height="44px" />
                                    <SkeletonBlock height="44px" />
                                </SkeletonStack>
                            </SkeletonCard>
                            <SkeletonCard>
                                <SkeletonStack>
                                    <SkeletonBlock width="140px" height="20px" />
                                    <SkeletonBlock height="44px" />
                                </SkeletonStack>
                            </SkeletonCard>
                        </LoadingGrid>
                    ) : (
                        <>
                            {activeTab === "account" && <AccountWorkspaceTab user={user} />}
                            {activeTab === "providers" && (
                                <AiProvidersTab status={status} onSave={handleSave} />
                            )}
                            {activeTab === "integrations" && (
                                <IntegrationsTab status={status} onSave={handleSave} />
                            )}
                            {activeTab === "notifications" && <NotificationsTab />}
                        </>
                    )}
                </Content>
            </Layout>
        </PageContainer>
    );
};

export default Settings;
