import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AlertTriangle, ListFilter, Mic, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import Avatar from "common/components/Avatar";
import Button from "common/components/Button";
import Modal from "common/components/Modal";
import { SkeletonBlock } from "common/components/Skeleton";
import { H3, Body2, Body3 } from "common/global-styled-components";
import {
    deleteMeeting as deleteMeetingAction,
    fetchMeetings,
    setActiveMeeting,
} from "common/redux/actions/meetingActions";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS, UI_EVENTS } from "common/constants";
import NewMeetingModal from "./NewMeetingModal";

const DashboardPage = styled.div`
    width: 100%;
    min-height: 100vh;
    background: var(--Color-Background-Root);
    color: var(--Color-Text-Default);
`;

const DashboardContent = styled.div`
    width: 100%;
    max-width: var(--Dashboard-Content-Max-Width);
    margin: 0 auto;
    padding: var(--Dashboard-Content-Padding-Y) var(--Dashboard-Content-Padding-X);
`;

const PageHeader = styled.header`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--Size-Gap-XXXL);
    margin-bottom: var(--Dashboard-Header-Bottom-Gap);
    padding-bottom: var(--Dashboard-Header-Padding-Bottom);
    border-bottom: var(--Auth-Border-Width) solid var(--Color-Border-Default);
`;

const HeaderCopy = styled.div`
    max-width: var(--Dashboard-Header-Copy-Max-Width);
`;

const PageTitle = styled.h2`
    margin: 0 0 var(--Size-Gap-XL);
    color: var(--Color-Text-Bold);
    font-family: var(--heading-font);
    font-size: var(--h1-d);
    line-height: var(--line-height-110);
    font-weight: var(--bold);
    letter-spacing: var(--app-heading-letter-spacing);
    text-transform: var(--app-text-transform);
`;

const PageSubtitle = styled.p`
    margin: 0;
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--body-font);
    font-size: var(--body-1-d);
    line-height: var(--line-height-160);
    font-weight: var(--regular);
`;

const PrimaryAction = styled.button`
    height: var(--Auth-Control-Height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--Auth-Icon-Gap);
    padding: 0 var(--Size-Padding-XXL);
    border: 0;
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    font-family: var(--body-font);
    font-size: var(--body-3-d);
    line-height: var(--Auth-Footer-Line-Height);
    font-weight: var(--regular);
    letter-spacing: var(--letter-spacing-wide);
    transition: background var(--Auth-Transition);

    &:hover {
        background: var(--Color-Background-Action-Hover);
    }

    svg {
        width: var(--Auth-Control-Icon-Size);
        height: var(--Auth-Control-Icon-Size);
        fill: currentColor;
    }
`;

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XXL);
    margin-bottom: var(--Dashboard-Toolbar-Bottom-Gap);
`;

const SearchWrap = styled.div`
    position: relative;
    width: 100%;
    max-width: var(--Dashboard-Search-Max-Width);
`;

const HiddenLabel = styled.label`
    position: absolute;
    width: var(--Auth-Border-Width);
    height: var(--Auth-Border-Width);
    padding: 0;
    margin: calc(var(--Auth-Border-Width) * -1);
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
`;

const SearchIcon = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--Dashboard-Search-Icon-Offset);
    display: flex;
    align-items: center;
    pointer-events: none;
    color: var(--Auth-Color-Text-Secondary);

    svg {
        width: var(--Auth-Control-Icon-Size);
        height: var(--Auth-Control-Icon-Size);
    }
`;

const SearchInput = styled.input`
    width: 100%;
    height: var(--Auth-Control-Height);
    display: block;
    padding: 0 var(--Size-Padding-L) 0 var(--Dashboard-Search-Padding-Left);
    border: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Bold);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
    outline: none;
    transition:
        border-color var(--Auth-Transition),
        box-shadow var(--Auth-Transition);

    &::placeholder {
        color: var(--Auth-Color-Text-Secondary);
    }

    &:focus {
        border-color: var(--Color-Background-Action);
        box-shadow: var(--Color-Shadow-Focus);
    }
`;

const FilterButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
    transition: color var(--Auth-Transition);

    &:hover {
        color: var(--Color-Text-Action);
    }

    svg {
        width: var(--Auth-Link-Icon-Size);
        height: var(--Auth-Link-Icon-Size);
    }
`;

const MeetingList = styled.div`
    display: flex;
    flex-direction: column;
    border-top: var(--Auth-Border-Width) solid var(--Color-Border-Default);
`;

const MeetingRow = styled.article`
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--Dashboard-Row-Gap);
    padding: var(--Dashboard-Row-Padding-Y) var(--Dashboard-Row-Padding-X);
    margin: 0 var(--Dashboard-Row-Margin-X);
    border-bottom: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    border-radius: var(--Auth-Control-Radius);
    cursor: pointer;
    transition:
        background var(--Auth-Transition),
        color var(--Auth-Transition);

    &:hover {
        background: var(--Color-Background-Subtle);
    }

    &:focus-visible {
        outline: var(--Auth-Accent-Border-Width) solid var(--Color-Border-Action);
        outline-offset: var(--Size-Gap-S);
    }
`;

const DateColumn = styled.div`
    width: var(--Dashboard-Date-Column-Width);
    flex-shrink: 0;
    padding-top: var(--Size-Padding-S);
`;

const DateText = styled.p`
    margin: 0 0 var(--Size-Gap-S);
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
`;

const TimeText = styled.p`
    margin: 0;
    color: var(--Auth-Color-Text-Tertiary);
    font-family: var(--mono-font);
    font-size: var(--Auth-Forgot-Font-Size);
    line-height: var(--Auth-Forgot-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
`;

const MeetingBody = styled.div`
    flex: 1;
    min-width: 0;
`;

const MeetingTitleRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--Dashboard-Title-Action-Gap);
    margin-bottom: var(--Size-Gap-M);
`;

const MeetingTitle = styled.h3`
    margin: 0;
    color: var(--Color-Text-Bold);
    font-family: var(--heading-font);
    font-size: var(--h3-d);
    line-height: var(--Auth-Title-Line-Height);
    font-weight: var(--semi-bold);
    letter-spacing: var(--app-heading-letter-spacing);
    text-transform: var(--app-text-transform);
    transition: color var(--Auth-Transition);

    ${MeetingRow}:hover & {
        color: var(--Color-Text-Action);
    }
`;

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: var(--Size-Padding-XS) var(--Size-Padding-M);
    border-radius: var(--Size-CornerRadius-S);
    background: ${({ $tone }) =>
        $tone === "action"
            ? "var(--Color-Background-Action-Soft)"
            : $tone === "recording"
              ? "var(--Color-Background-Accent-Danger)"
              : "var(--Color-Background-Disabled)"};
    color: ${({ $tone }) =>
        $tone === "action"
            ? "var(--Color-Text-Action)"
            : $tone === "recording"
              ? "var(--Color-Text-Danger)"
              : "var(--Color-Text-Subtle)"};
    font-family: var(--mono-font);
    font-size: var(--Dashboard-Badge-Font-Size);
    line-height: var(--Dashboard-Badge-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    white-space: nowrap;
`;

const SummaryText = styled.p`
    max-width: var(--Dashboard-Summary-Max-Width);
    display: -webkit-box;
    margin: 0 0 var(--Size-Gap-XL);
    overflow: hidden;
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--body-font);
    font-size: var(--body-2-d);
    line-height: var(--Auth-Control-Line-Height);
    font-weight: var(--regular);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const AvatarStack = styled.div`
    display: flex;
    align-items: center;
`;

const ParticipantAvatar = styled(Avatar)`
    width: var(--Dashboard-Avatar-Size);
    height: var(--Dashboard-Avatar-Size);
    border: var(--Auth-Border-Width) solid var(--Color-Background-Root);

    & + & {
        margin-left: var(--Dashboard-Avatar-Overlap);
    }
`;

const ExtraCount = styled.div`
    width: var(--Dashboard-Avatar-Size);
    height: var(--Dashboard-Avatar-Size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: var(--Dashboard-Avatar-Overlap);
    border: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-Full);
    background: var(--Color-Background-Subtle-2);
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--mono-font);
    font-size: var(--Dashboard-Badge-Font-Size);
    line-height: var(--Dashboard-Badge-Line-Height);
    font-weight: var(--medium);
`;

const RowActions = styled.div`
    position: relative;
    padding-top: var(--Size-Padding-S);
`;

const RowMenuButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-S);
    border: 0;
    background: transparent;
    color: var(--Auth-Color-Text-Secondary);
    transition: color var(--Auth-Transition);

    &:hover {
        color: var(--Color-Text-Bold);
    }
`;

const CardMenu = styled.div`
    position: absolute;
    top: calc(100% + var(--Size-Gap-S));
    right: 0;
    z-index: 20;
    min-width: var(--Dashboard-Menu-Width);
    padding: var(--Size-Padding-S);
    border: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-1);
`;

const MenuItem = styled.button`
    width: 100%;
    min-height: var(--Sidebar-Item-Height);
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: 0 var(--Size-Padding-L);
    border: 0;
    border-radius: var(--Auth-Control-Radius);
    background: transparent;
    color: var(--Color-Text-Danger);
    font-family: var(--body-font);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    text-align: left;

    &:hover {
        background: var(--Color-Background-Accent-Danger);
    }
`;

const EmptyState = styled.div`
    min-height: var(--Dashboard-Empty-State-Min-Height);
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXXL);
    border-bottom: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: var(--Size-Gap-5XL);
    height: var(--Size-Gap-5XL);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--Size-Gap-XL);
    border: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Icon-Action);
`;

const EmptyCopy = styled(Body2)`
    color: var(--Color-Text-Subtle);
    margin-top: var(--Size-Gap-M);
`;

const EmptyAction = styled(PrimaryAction)`
    margin-top: var(--Size-Gap-XL);
`;

const DeleteDialogBody = styled.div`
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const WarningPanel = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-L);
    border: var(--Auth-Border-Width) solid var(--Color-Border-Accent-Danger);
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Accent-Danger);
    color: var(--Color-Text-Danger);
`;

const DialogActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--Size-Gap-M);
`;

const parseDate = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatListDate = (isoString) => {
    const date = parseDate(isoString);
    if (!date) return "No date";
    return date
        .toLocaleDateString(undefined, {
            month: "short",
            day: "2-digit",
            year: "numeric",
        })
        .toUpperCase();
};

const formatStartTime = (isoString) => {
    const date = parseDate(isoString);
    if (!date) return "No time";
    return date
        .toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
        })
        .toUpperCase();
};

const formatCompactDuration = (startIso, endIso) => {
    const start = parseDate(startIso);
    const end = parseDate(endIso);
    if (!start || !end) return "Active";
    const totalMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours && minutes) return `${hours}H ${minutes}M`;
    if (hours) return `${hours}H`;
    return `${minutes}M`;
};

const formatListTime = (meeting) =>
    `${formatStartTime(meeting.start_time)} - ${formatCompactDuration(meeting.start_time, meeting.end_time)}`;

const getParticipantName = (participant, index) => {
    if (typeof participant === "string") return participant;
    return participant?.name || participant?.email || `Participant ${index + 1}`;
};

const getStatus = (meeting) => {
    if (!meeting.end_time) return { label: "Recording", tone: "recording" };
    const openActions = (meeting.action_items || []).some((item) => !item.completed);
    if (openActions) return { label: "Action Needed", tone: "action" };
    if (meeting.summary) return { label: "Completed", tone: "neutral" };
    return { label: "Processing", tone: "neutral" };
};

const LoadingRows = () => (
    <MeetingList aria-label="Loading meetings">
        {[0, 1, 2].map((item) => (
            <MeetingRow as="div" key={item}>
                <DateColumn>
                    <SkeletonBlock width="72%" height="var(--Auth-Label-Line-Height)" />
                    <SkeletonBlock width="88%" height="var(--Auth-Forgot-Line-Height)" />
                </DateColumn>
                <MeetingBody>
                    <MeetingTitleRow>
                        <SkeletonBlock width="46%" height="var(--Auth-Title-Line-Height)" />
                        <SkeletonBlock
                            width="var(--Dashboard-Skeleton-Badge-Width)"
                            height="var(--Auth-Footer-Line-Height)"
                        />
                    </MeetingTitleRow>
                    <SkeletonBlock width="82%" height="var(--Auth-Control-Line-Height)" />
                    <SkeletonBlock width="34%" height="var(--Dashboard-Avatar-Size)" />
                </MeetingBody>
            </MeetingRow>
        ))}
    </MeetingList>
);

const HostDashboard = () => {
    const dispatch = useDispatch();
    const meetings = useSelector((state) => state.meetingDetails.list);
    const [search, setSearch] = useState("");
    const [showNewMeeting, setShowNewMeeting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [pendingDeleteMeeting, setPendingDeleteMeeting] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        dispatch(fetchMeetings()).finally(() => {
            if (mounted) setLoading(false);
        });
        return () => {
            mounted = false;
        };
    }, [dispatch]);

    useEffect(() => {
        const openFromSidebar = () => setShowNewMeeting(true);
        window.addEventListener(UI_EVENTS.OpenNewMeeting, openFromSidebar);
        return () => window.removeEventListener(UI_EVENTS.OpenNewMeeting, openFromSidebar);
    }, []);

    useEffect(() => {
        if (!openMenuId) return undefined;
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [openMenuId]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return meetings;
        return meetings.filter(
            (meeting) =>
                (meeting.title || "").toLowerCase().includes(term) ||
                (meeting.summary || "").toLowerCase().includes(term),
        );
    }, [meetings, search]);

    const openMeeting = (meeting) => {
        dispatch(setActiveMeeting(meeting.id));
        dispatch(setHostView(HOST_VIEWS.Meeting));
    };

    const handleRowKeyDown = (event, meeting) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openMeeting(meeting);
    };

    const toggleMenu = (event, meetingId) => {
        event.stopPropagation();
        setOpenMenuId((currentId) => (currentId === meetingId ? null : meetingId));
    };

    const requestDeleteMeeting = (event, meeting) => {
        event.stopPropagation();
        setOpenMenuId(null);
        setPendingDeleteMeeting(meeting);
    };

    const closeDeleteDialog = () => {
        if (!deletingId) setPendingDeleteMeeting(null);
    };

    const confirmDeleteMeeting = async () => {
        if (!pendingDeleteMeeting) return;
        setDeletingId(pendingDeleteMeeting.id);
        try {
            await dispatch(deleteMeetingAction(pendingDeleteMeeting.id));
            setPendingDeleteMeeting(null);
        } catch {
            // The thunk shows the failure toast.
        } finally {
            setDeletingId(null);
        }
    };

    const openNewMeeting = () => setShowNewMeeting(true);

    return (
        <DashboardPage>
            <DashboardContent>
                <PageHeader>
                    <HeaderCopy>
                        <PageTitle>Your Meetings</PageTitle>
                        <PageSubtitle>
                            Review transcripts, insights, and editorial notes from your recent sessions. The archive
                            is automatically curated.
                        </PageSubtitle>
                    </HeaderCopy>
                    <PrimaryAction type="button" onClick={openNewMeeting}>
                        <Plus aria-hidden="true" />
                        New Meeting
                    </PrimaryAction>
                </PageHeader>

                <Toolbar>
                    <SearchWrap>
                        <HiddenLabel htmlFor="dashboard-search">Search Meetings</HiddenLabel>
                        <SearchIcon>
                            <Search aria-hidden="true" />
                        </SearchIcon>
                        <SearchInput
                            id="dashboard-search"
                            type="text"
                            placeholder="Search transcripts and titles..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </SearchWrap>
                    <FilterButton type="button">
                        <ListFilter aria-hidden="true" />
                        Filter
                    </FilterButton>
                </Toolbar>

                {loading ? (
                    <LoadingRows />
                ) : filtered.length === 0 ? (
                    <MeetingList>
                        <EmptyState>
                            <div>
                                <EmptyIcon>
                                    <Mic size={24} />
                                </EmptyIcon>
                                <H3>{search ? "No matching meetings" : "No meetings yet"}</H3>
                                <EmptyCopy>
                                    {search
                                        ? "Try another search term."
                                        : "Create your first recording when you are ready."}
                                </EmptyCopy>
                                {!search && (
                                    <EmptyAction type="button" onClick={openNewMeeting}>
                                        <Plus aria-hidden="true" />
                                        New Meeting
                                    </EmptyAction>
                                )}
                            </div>
                        </EmptyState>
                    </MeetingList>
                ) : (
                    <MeetingList>
                        {filtered.map((meeting) => {
                            const participants = meeting.participants || [];
                            const visibleParticipants = participants.slice(0, 3);
                            const extraCount = Math.max(0, participants.length - visibleParticipants.length);
                            const status = getStatus(meeting);

                            return (
                                <MeetingRow
                                    key={meeting.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openMeeting(meeting)}
                                    onKeyDown={(event) => handleRowKeyDown(event, meeting)}
                                >
                                    <DateColumn>
                                        <DateText>{formatListDate(meeting.start_time)}</DateText>
                                        <TimeText>{formatListTime(meeting)}</TimeText>
                                    </DateColumn>

                                    <MeetingBody>
                                        <MeetingTitleRow>
                                            <MeetingTitle>{meeting.title || "Untitled meeting"}</MeetingTitle>
                                            <StatusBadge $tone={status.tone}>{status.label}</StatusBadge>
                                        </MeetingTitleRow>
                                        <SummaryText>
                                            {meeting.summary ||
                                                "Summary will appear here after the recording has finished processing."}
                                        </SummaryText>
                                        <AvatarStack aria-label={`${participants.length} participants`}>
                                            {(visibleParticipants.length ? visibleParticipants : ["Host"]).map(
                                                (participant, index) => (
                                                    <ParticipantAvatar
                                                        key={`${meeting.id}-${getParticipantName(participant, index)}`}
                                                        name={getParticipantName(participant, index)}
                                                        size="default"
                                                    />
                                                ),
                                            )}
                                            {extraCount > 0 && <ExtraCount>+{extraCount}</ExtraCount>}
                                        </AvatarStack>
                                    </MeetingBody>

                                    <RowActions onClick={(event) => event.stopPropagation()}>
                                        <RowMenuButton
                                            type="button"
                                            aria-label={`Open actions for ${meeting.title || "Untitled meeting"}`}
                                            aria-haspopup="menu"
                                            aria-expanded={openMenuId === meeting.id}
                                            onClick={(event) => toggleMenu(event, meeting.id)}
                                            disabled={deletingId === meeting.id}
                                        >
                                            <MoreVertical size={20} />
                                        </RowMenuButton>
                                        {openMenuId === meeting.id && (
                                            <CardMenu role="menu">
                                                <MenuItem
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={(event) => requestDeleteMeeting(event, meeting)}
                                                    disabled={deletingId === meeting.id}
                                                >
                                                    <Trash2 size={15} />
                                                    {deletingId === meeting.id ? "Deleting..." : "Delete meeting"}
                                                </MenuItem>
                                            </CardMenu>
                                        )}
                                    </RowActions>
                                </MeetingRow>
                            );
                        })}
                    </MeetingList>
                )}
            </DashboardContent>

            {showNewMeeting && <NewMeetingModal onClose={() => setShowNewMeeting(false)} />}
            {pendingDeleteMeeting && (
                <Modal title="Delete meeting" onClose={closeDeleteDialog} width="var(--Dashboard-Delete-Modal-Width)">
                    <DeleteDialogBody>
                        <Body2>
                            Are you sure you want to delete{" "}
                            <strong>{pendingDeleteMeeting.title || "Untitled meeting"}</strong>?
                        </Body2>
                        <WarningPanel>
                            <AlertTriangle size={18} />
                            <Body3>
                                This will permanently remove its transcript, summary, action items, chats, shares,
                                access activity, and local audio file.
                            </Body3>
                        </WarningPanel>
                        <DialogActions>
                            <Button type="button" mode="secondary" onClick={closeDeleteDialog}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                mode="danger"
                                onClick={confirmDeleteMeeting}
                                loader={deletingId === pendingDeleteMeeting.id}
                            >
                                <Trash2 size={16} />
                                Delete Meeting
                            </Button>
                        </DialogActions>
                    </DeleteDialogBody>
                </Modal>
            )}
        </DashboardPage>
    );
};

export default HostDashboard;
