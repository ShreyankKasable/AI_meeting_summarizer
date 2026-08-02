import React, { useMemo } from "react";
import styled from "styled-components";
import {
    Activity,
    Check,
    Clock3,
    Eye,
    Languages,
    Mail,
    MessageCircle,
    MonitorSmartphone,
    RefreshCw,
    ShieldCheck,
    UserMinus,
    UserRound,
    X,
} from "lucide-react";
import Badge from "common/components/Badge";
import Button from "common/components/Button";
import { H2, Body2, Body3 } from "common/global-styled-components";

const Shell = styled.section`
    display: grid;
    gap: var(--Size-Gap-XL);
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XXL);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-Card);

    @media (max-width: 560px) {
        padding: var(--Size-Padding-XL);
    }
`;

const Header = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: var(--Size-Gap-XL);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const TitleBlock = styled.div`
    display: grid;
    gap: var(--Size-Gap-M);
    justify-items: start;
`;

const PeopleList = styled.div`
    display: grid;
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    overflow: hidden;
`;

const PersonCard = styled.article`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--Size-Gap-L);
    align-items: start;
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Default);

    & + & {
        border-top: 1px solid var(--Color-Border-Subtle);
    }

    @media (max-width: 560px) {
        grid-template-columns: 1fr;
    }
`;

const Avatar = styled.div`
    width: 46px;
    height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Text-Action);
    font-weight: var(--bold);
    letter-spacing: 0;
`;

const PersonMain = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-L);
`;

const PersonTop = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--Size-Gap-L);
    align-items: start;

    @media (max-width: 680px) {
        grid-template-columns: 1fr;
    }
`;

const StatusStack = styled.div`
    display: grid;
    justify-items: end;
    gap: var(--Size-Gap-S);

    @media (max-width: 680px) {
        justify-items: start;
    }
`;

const ActionGroup = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--Size-Gap-S);
    flex-wrap: wrap;

    @media (max-width: 680px) {
        justify-content: flex-start;
    }
`;

const Identity = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-S);
`;

const PersonName = styled.div`
    min-width: 0;
    overflow: hidden;
    color: var(--Color-Text-Bold);
    font-size: var(--body-1-d);
    font-weight: var(--bold);
    line-height: var(--line-height-120);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const EmailLine = styled.div`
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);

    span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    svg {
        flex-shrink: 0;
    }
`;

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--Size-Gap-L) var(--Size-Gap-XXL);
    padding-top: var(--Size-Padding-L);
    border-top: 1px solid var(--Color-Border-Subtle);

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 560px) {
        grid-template-columns: 1fr;
    }
`;

const DetailItem = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-XS);
`;

const DetailLabel = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-4-d);
`;

const DetailValue = styled.div`
    min-width: 0;
    overflow: hidden;
    color: var(--Color-Text-Bold);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const EmptyState = styled.div`
    min-height: 180px;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXL);
    border: 1px dashed var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    color: var(--Color-Text-Subtle);
    text-align: center;
`;

const EmptyContent = styled.div`
    display: grid;
    justify-items: center;
    gap: var(--Size-Gap-M);
`;

const ParticipantAccessInsights = ({
    rows = [],
    loading = false,
    onRefresh,
    onApprove,
    onReject,
    onRemove,
    busyAction,
}) => {
    const people = useMemo(
        () => rows.filter(hasAccountIdentity).sort(sortPeopleRows),
        [rows],
    );
    const pendingCount = people.filter((row) => accessStatus(row) === "pending").length;

    return (
        <Shell>
            <Header>
                <TitleBlock>
                    <Badge tone="neutral">
                        <ShieldCheck size={13} />
                        Participant information
                    </Badge>
                    <H2 style={{ fontSize: "var(--h2-m)" }}>People who accessed this meeting</H2>
                    <Body3 style={{ color: "var(--Color-Text-Subtle)" }}>
                        {people.length} {people.length === 1 ? "account holder" : "account holders"} listed
                        {pendingCount ? `, ${pendingCount} pending approval` : ""}
                    </Body3>
                </TitleBlock>
                <Button mode="secondary" size="small" onClick={onRefresh} loader={loading}>
                    <RefreshCw size={14} />
                    Refresh
                </Button>
            </Header>

            {people.length ? (
                <PeopleList>
                    {people.map((row) => (
                        <PersonAccessRow
                            key={row.id || row.viewer_user_id || row.participant_id}
                            row={row}
                            onApprove={onApprove}
                            onReject={onReject}
                            onRemove={onRemove}
                            busyAction={busyAction}
                        />
                    ))}
                </PeopleList>
            ) : (
                <EmptyState>
                    <EmptyContent>
                        <UserRound size={26} />
                        <Body2>No signed-in participant access recorded yet.</Body2>
                    </EmptyContent>
                </EmptyState>
            )}
        </Shell>
    );
};

const PersonAccessRow = ({ row, onApprove, onReject, onRemove, busyAction }) => {
    const email = row.account_holder_email || row.viewer_email || "Email unavailable";
    const name = accountName(row) || "Account holder";
    const device = deviceLabel(row.user_agent);
    const status = accessStatus(row);
    const userId = row.viewer_user_id;
    const actionKey = (action) => `${action}:${userId}`;
    const hasBusyAction = Boolean(busyAction);

    return (
        <PersonCard>
            <Avatar>{initials(name, email)}</Avatar>
            <PersonMain>
                <PersonTop>
                    <Identity>
                        <PersonName title={name}>{name}</PersonName>
                        <EmailLine title={email}>
                            <Mail size={14} />
                            <span>{email}</span>
                        </EmailLine>
                    </Identity>
                    <StatusStack>
                        <Badge tone={status === "pending" ? "warning" : "success"}>
                            {status === "pending" ? "Pending approval" : "Access granted"}
                        </Badge>
                        <ActionGroup>
                            {status === "pending" ? (
                                <>
                                    <Button
                                        size="small"
                                        onClick={() => onApprove?.(userId)}
                                        loader={busyAction === actionKey("approve")}
                                        disabled={hasBusyAction}
                                    >
                                        <Check size={14} />
                                        Approve
                                    </Button>
                                    <Button
                                        mode="secondary"
                                        size="small"
                                        onClick={() => onReject?.(userId)}
                                        loader={busyAction === actionKey("reject")}
                                        disabled={hasBusyAction}
                                    >
                                        <X size={14} />
                                        Reject
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    mode="danger"
                                    size="small"
                                    onClick={() => onRemove?.(userId)}
                                    loader={busyAction === actionKey("remove")}
                                    disabled={hasBusyAction}
                                >
                                    <UserMinus size={14} />
                                    Remove
                                </Button>
                            )}
                        </ActionGroup>
                    </StatusStack>
                </PersonTop>

                <DetailGrid>
                    <Detail label="Requested" value={formatAccessTime(row.requested_at)} icon={Clock3} />
                    <Detail label="Approved" value={status === "approved" ? formatAccessTime(row.approved_at) : "Waiting"} icon={ShieldCheck} />
                    <Detail label="First seen" value={formatAccessTime(row.first_seen_at, "Not opened yet")} icon={Clock3} />
                    <Detail label="Last seen" value={formatAccessTime(row.last_seen_at, "Not opened yet")} icon={Clock3} />
                    <Detail label="Latest action" value={activityLabel(row.last_activity)} icon={Activity} />
                    <Detail label="Meeting views" value={row.view_count || 0} icon={Eye} />
                    <Detail label="AI chats" value={row.chat_count || 0} icon={MessageCircle} />
                    <Detail label="Translations" value={row.translate_count || 0} icon={Languages} />
                    <Detail label="Device" value={device} icon={MonitorSmartphone} />
                    <Detail
                        label="Sessions"
                        value={sessionLabel(row.access_session_count)}
                        icon={UserRound}
                    />
                </DetailGrid>
            </PersonMain>
        </PersonCard>
    );
};

const Detail = ({ label, value, icon: Icon }) => (
    <DetailItem>
        <DetailLabel>
            <Icon size={14} />
            {label}
        </DetailLabel>
        <DetailValue title={String(value)}>{value}</DetailValue>
    </DetailItem>
);

function hasAccountIdentity(row) {
    return Boolean(row?.viewer_user_id || row?.viewer_email || row?.account_holder_email);
}

function accessStatus(row) {
    return row?.access_status || (row?.has_access ? "approved" : "pending");
}

function sortPeopleRows(a, b) {
    const statusWeight = { pending: 2, approved: 1 };
    const weightDelta = (statusWeight[accessStatus(b)] || 0) - (statusWeight[accessStatus(a)] || 0);
    if (weightDelta) return weightDelta;
    return dateMs(b.updated_at || b.last_seen_at || b.requested_at) - dateMs(a.updated_at || a.last_seen_at || a.requested_at);
}

function accountName(row) {
    const name = row.account_holder_name || row.viewer_name;
    if (name && !/^viewer\b/i.test(name)) return name;
    const email = row.account_holder_email || row.viewer_email;
    return nameFromEmail(email) || name;
}

function nameFromEmail(email) {
    if (!email || typeof email !== "string") return null;
    const localPart = email.split("@")[0]?.trim();
    if (!localPart) return email;
    const words = localPart.replace(/[._+-]+/g, " ").split(/\s+/).filter(Boolean);
    if (!words.length) return email;
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function initials(name, email) {
    const source = name && name !== "Account holder" ? name : email;
    const parts = String(source || "")
        .replace(/@.*$/, "")
        .replace(/[._+-]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) return "U";
    return parts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function activityLabel(value) {
    const labels = {
        view: "Viewed meeting",
        chat: "Used AI chat",
        chat_history: "Opened AI chat",
        translate: "Translated transcript",
    };
    return labels[value] || "No activity yet";
}

function deviceLabel(userAgent) {
    if (!userAgent || typeof userAgent !== "string") return "Unknown device";

    const browser = userAgent.includes("Edg/")
        ? "Edge"
        : userAgent.includes("Chrome/")
            ? "Chrome"
            : userAgent.includes("Firefox/")
                ? "Firefox"
                : userAgent.includes("Safari/")
                    ? "Safari"
                    : "Browser";

    const platform = userAgent.includes("Windows")
        ? "Windows"
        : userAgent.includes("Mac OS")
            ? "macOS"
            : userAgent.includes("Android")
                ? "Android"
                : userAgent.includes("iPhone") || userAgent.includes("iPad")
                    ? "iOS"
                    : "Device";

    return `${browser} on ${platform}`;
}

function sessionLabel(count) {
    const value = Number(count || 0);
    if (!value) return "No devices yet";
    return `${value} ${value === 1 ? "device" : "devices"}`;
}

function formatAccessTime(value, fallback = "Never") {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function dateMs(value) {
    const date = value ? new Date(value) : null;
    const ms = date ? date.getTime() : NaN;
    return Number.isNaN(ms) ? 0 : ms;
}

export default ParticipantAccessInsights;
