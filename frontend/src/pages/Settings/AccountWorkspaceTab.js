import React from "react";
import styled from "styled-components";
import { Database, LockKeyhole, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import Avatar from "common/components/Avatar";
import Badge from "common/components/Badge";
import Button from "common/components/Button";
import { H3, Body2, Body3, MonoLabel } from "common/global-styled-components";

const Wrapper = styled.div`
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const Card = styled.section`
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

    @media (max-width: 640px) {
        flex-direction: column;
    }
`;

const Identity = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: var(--Size-Gap-L);
`;

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--Size-Gap-L);

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const Detail = styled.div`
    min-height: 96px;
    display: grid;
    align-content: center;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Subtle);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
`;

const PolicyList = styled.div`
    display: grid;
    gap: var(--Size-Gap-L);
`;

const PolicyItem = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-L);
    background: var(--Color-Background-Subtle);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);

    @media (max-width: 640px) {
        grid-template-columns: auto 1fr;

        > span:last-child {
            grid-column: 2;
            width: fit-content;
        }
    }
`;

const IconBox = styled.div`
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--Color-Background-Accent-Action);
    border: 1px solid var(--Color-Border-Accent-Action);
    border-radius: var(--Size-CornerRadius-M);
    color: var(--Color-Icon-Action);
`;

const AccountWorkspaceTab = ({ user }) => {
    const displayName = user?.name || user?.email || "Workspace Admin";
    const email = user?.email || "Not available";

    return (
        <Wrapper>
            <Card>
                <Header>
                    <Identity>
                        <Avatar name={displayName} size="large" />
                        <div>
                            <MonoLabel>Account</MonoLabel>
                            <H3 style={{ marginTop: "var(--Size-Gap-S)" }}>{displayName}</H3>
                            <Body3>{email}</Body3>
                        </div>
                    </Identity>
                    <Badge tone="success">Active</Badge>
                </Header>
                <DetailGrid>
                    <Detail>
                        <MonoLabel>Role</MonoLabel>
                        <Body2>Workspace admin</Body2>
                    </Detail>
                    <Detail>
                        <MonoLabel>Workspace</MonoLabel>
                        <Body2>Production workspace</Body2>
                    </Detail>
                    <Detail>
                        <MonoLabel>Plan</MonoLabel>
                        <Body2>Local deployment</Body2>
                    </Detail>
                    <Detail>
                        <MonoLabel>Access</MonoLabel>
                        <Body2>Authenticated host</Body2>
                    </Detail>
                </DetailGrid>
            </Card>

            <Card>
                <Header>
                    <div>
                        <MonoLabel>Privacy and retention</MonoLabel>
                        <H3 style={{ marginTop: "var(--Size-Gap-S)" }}>Workspace controls</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>
                            Current operational policies surfaced for review. Server-side controls can be
                            wired here when those settings become configurable.
                        </Body3>
                    </div>
                    <Button mode="secondary" size="small" type="button">
                        Review policy
                    </Button>
                </Header>
                <PolicyList>
                    <PolicyItem>
                        <IconBox>
                            <ShieldCheck size={18} />
                        </IconBox>
                        <div>
                            <Body2>Authenticated sharing</Body2>
                            <Body3>Shared meeting links require signed-in access.</Body3>
                        </div>
                        <Badge tone="success">Enabled</Badge>
                    </PolicyItem>
                    <PolicyItem>
                        <IconBox>
                            <Database size={18} />
                        </IconBox>
                        <div>
                            <Body2>Meeting retention</Body2>
                            <Body3>Recordings and generated content remain in the local workspace.</Body3>
                        </div>
                        <Badge tone="neutral">Manual</Badge>
                    </PolicyItem>
                    <PolicyItem>
                        <IconBox>
                            <LockKeyhole size={18} />
                        </IconBox>
                        <div>
                            <Body2>Provider keys</Body2>
                            <Body3>API credentials are stored and managed server-side.</Body3>
                        </div>
                        <Badge tone="success">Protected</Badge>
                    </PolicyItem>
                    <PolicyItem>
                        <IconBox>
                            <WalletCards size={18} />
                        </IconBox>
                        <div>
                            <Body2>Billing</Body2>
                            <Body3>Billing is not connected to this local app build.</Body3>
                        </div>
                        <Badge tone="neutral">N/A</Badge>
                    </PolicyItem>
                </PolicyList>
            </Card>
        </Wrapper>
    );
};

export default AccountWorkspaceTab;
