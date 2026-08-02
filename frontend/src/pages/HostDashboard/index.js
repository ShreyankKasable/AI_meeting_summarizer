import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    Calendar,
    Clock3,
    FileText,
    Mic,
    MoreVertical,
    Plus,
    Search,
    Sparkles,
    Trash2,
    Users,
} from "lucide-react";
import PageContainer from "common/components/PageContainer";
import Button from "common/components/Button";
import Modal from "common/components/Modal";
import { SkeletonBlock, SkeletonStack } from "common/components/Skeleton";
import { H1, H3, Body2, Body3 } from "common/global-styled-components";
import {
    deleteMeeting as deleteMeetingAction,
    fetchMeetings,
    setActiveMeeting,
} from "common/redux/actions/meetingActions";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import { formatDate, formatDuration } from "common/utils/utils";
import NewMeetingModal from "./NewMeetingModal";

const DashboardPage = styled(PageContainer)`
    padding-top: var(--Size-Padding-XXL);
`;

const Header = styled.header`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: var(--Size-Gap-XXL);
    margin-bottom: var(--Size-Gap-XXL);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const HeaderCopy = styled.div`
    display: grid;
    gap: var(--Size-Gap-S);
`;

const RoundAction = styled.button`
    width: 50px;
    height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--Size-CornerRadius-Full);
    background: #10131a;
    color: var(--Color-Text-Inverse);
    box-shadow: 0 14px 28px rgba(16, 19, 26, 0.18);
    transition: transform var(--transition-fast), background var(--transition-fast);

    &:hover {
        background: #1e2430;
        transform: translateY(-1px);
    }

    @media (max-width: 640px) {
        justify-self: start;
    }
`;

const LibrarySection = styled.section`
    display: grid;
    gap: var(--Size-Gap-XXL);
`;

const LibraryHeader = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
    align-items: end;
    gap: var(--Size-Gap-XXL);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const LibraryTitle = styled.div`
    display: grid;
    gap: var(--Size-Gap-S);
`;

const CardsGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--Size-Gap-XXL);
`;

const MeetingCard = styled.div`
    width: 100%;
    min-height: 250px;
    display: flex;
    flex-direction: column;
    padding: var(--Size-Padding-XXXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XXL);
    background: var(--Color-Background-Default);
    box-shadow: 0 1px 2px rgba(17, 19, 22, 0.03);
    color: inherit;
    cursor: pointer;
    text-align: left;
    transition: transform var(--transition-fast), border-color var(--transition-fast),
        box-shadow var(--transition-fast);

    &:hover {
        border-color: var(--Color-Border-Bold);
        box-shadow: var(--Color-Shadow-Card);
        transform: translateY(-2px);
    }

    &:focus-visible {
        outline: none;
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
    }

    @media (max-width: 640px) {
        padding: var(--Size-Padding-XXL);
    }
`;

const CardTop = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--Size-Gap-XL);
    align-items: start;
    margin-bottom: var(--Size-Gap-XXL);
`;

const CardIdentity = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    min-width: 0;
    flex-wrap: wrap;
`;

const IconOrb = styled.div`
    width: 72px;
    height: 72px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: var(--Size-CornerRadius-Full);
    background: #f2e8ff;
    color: #7a16ff;
`;

const MetaPills = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    flex-wrap: wrap;
`;

const MetaPill = styled.span`
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    padding: 0 var(--Size-Padding-L);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Default);
    font-size: var(--body-2-d);
`;

const CardActions = styled.div`
    position: relative;
`;

const IconButton = styled.button`
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--Size-CornerRadius-M);
    background: transparent;
    color: var(--Color-Icon-Default);
    cursor: pointer;

    &:hover {
        background: var(--Color-Background-Subtle);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.56;
    }
`;

const CardMenu = styled.div`
    position: absolute;
    top: calc(100% + var(--Size-Gap-S));
    right: 0;
    z-index: 20;
    min-width: 190px;
    padding: var(--Size-Padding-S);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-1);
`;

const MenuItem = styled.button`
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: 0 var(--Size-Padding-L);
    border: none;
    border-radius: var(--Size-CornerRadius-M);
    background: transparent;
    color: var(--Color-Text-Danger);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    text-align: left;
    cursor: pointer;

    &:hover {
        background: var(--Color-Background-Accent-Danger);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.58;
    }
`;

const FeaturePill = styled.span`
    width: fit-content;
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
    padding: 0 var(--Size-Padding-L);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Default);
    font-size: var(--body-2-d);
`;

const SearchWrapper = styled.div`
    position: relative;
    width: min(540px, 100%);
    justify-self: end;

    @media (max-width: 640px) {
        width: 100%;
        justify-self: stretch;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    min-height: 44px;
    padding: 0 var(--Size-Padding-L) 0 42px;
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Default);
    color: var(--Color-Text-Bold);
    outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

    &:focus {
        border-color: #7a16ff;
        box-shadow: 0 0 0 4px rgba(122, 22, 255, 0.12);
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 14px;
    top: 50%;
    display: flex;
    color: var(--Color-Icon-Subtle);
    transform: translateY(-50%);
`;

const MeetingTitle = styled(Body2)`
    overflow: hidden;
    color: var(--Color-Text-Bold);
    font-size: var(--h3-d);
    font-weight: var(--bold);
    line-height: var(--line-height-120);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const MeetingSummary = styled(Body3)`
    display: -webkit-box;
    max-width: 780px;
    margin-top: var(--Size-Gap-S);
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const CardFooter = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    flex-wrap: wrap;
    margin-top: auto;
    padding-top: var(--Size-Padding-XXL);
`;

const EmptyState = styled.div`
    min-height: 260px;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XXL);
    background: var(--Color-Background-Default);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 54px;
    height: 54px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--Size-Gap-XL);
    border-radius: var(--Size-CornerRadius-Full);
    background: #f2e8ff;
    color: #7a16ff;
`;

const EmptyAction = styled.button`
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--Size-Gap-M);
    margin-top: var(--Size-Gap-XL);
    padding: 0 var(--Size-Padding-XL);
    border: none;
    border-radius: var(--Size-CornerRadius-Full);
    background: #10131a;
    color: var(--Color-Text-Inverse);
    font-weight: var(--semi-bold);
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
    border: 1px solid var(--Color-Border-Accent-Danger);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Accent-Danger);
    color: var(--Color-Text-Danger);
`;

const DialogActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--Size-Gap-M);

    @media (max-width: 480px) {
        flex-direction: column-reverse;
    }
`;

const getLatestMeeting = (meetings) =>
    meetings.reduce((latest, meeting) => {
        if (!latest) return meeting;
        const latestTime = new Date(latest.start_time || 0).getTime();
        const meetingTime = new Date(meeting.start_time || 0).getTime();
        return meetingTime > latestTime ? meeting : latest;
    }, null);

const formatCreatedDate = (isoString) => {
    if (!isoString) return "No date";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "No date";
    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getMeetingInfo = (meeting) => {
    if (meeting.end_time) return formatDuration(meeting.start_time, meeting.end_time);
    return "Recording active";
};

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
        if (!openMenuId) return undefined;
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [openMenuId]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return meetings;
        return meetings.filter(
            (m) =>
                (m.title || "").toLowerCase().includes(term) ||
                (m.summary || "").toLowerCase().includes(term),
        );
    }, [meetings, search]);

    const latestMeeting = useMemo(() => getLatestMeeting(meetings), [meetings]);
    const latestLabel = latestMeeting?.start_time
        ? `Updated ${formatDate(latestMeeting.start_time)}`
        : "No recordings yet";

    const openMeeting = (meeting) => {
        dispatch(setActiveMeeting(meeting.id));
        dispatch(setHostView(HOST_VIEWS.Meeting));
    };

    const handleCardKeyDown = (event, meeting) => {
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
        <DashboardPage size="full">
            <Header>
                <HeaderCopy>
                    <H1 style={{ fontSize: "var(--h2-d)" }}>Your Meetings</H1>
                    <Body2 style={{ color: "var(--Color-Text-Default)" }}>
                        Organize your recordings so MeetAI can retrieve accurate summaries,
                        transcripts, and action items.
                    </Body2>
                </HeaderCopy>
                <RoundAction
                    type="button"
                    onClick={openNewMeeting}
                    aria-label="New Meeting"
                    title="New Meeting"
                >
                    <Plus size={30} />
                </RoundAction>
            </Header>

            <LibrarySection>
                <LibraryHeader>
                    <LibraryTitle>
                        <H3>Meeting Library</H3>
                        <Body3>
                            {meetings.length
                                ? `${filtered.length} of ${meetings.length} recordings | ${latestLabel}`
                                : "No recordings yet"}
                        </Body3>
                    </LibraryTitle>
                    <SearchWrapper>
                        <SearchIcon>
                            <Search size={16} />
                        </SearchIcon>
                        <SearchInput
                            placeholder="Search meetings"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </SearchWrapper>
                </LibraryHeader>

                {loading ? (
                    <CardsGrid>
                        {[0, 1, 2].map((item) => (
                            <MeetingCard as="div" key={item}>
                                <CardTop>
                                    <CardIdentity>
                                        <IconOrb>
                                            <FileText size={30} />
                                        </IconOrb>
                                        <MetaPills>
                                            <SkeletonBlock width="120px" height="42px" />
                                            <SkeletonBlock width="150px" height="42px" />
                                        </MetaPills>
                                    </CardIdentity>
                                    <IconButton as="span" aria-hidden="true">
                                        <MoreVertical size={22} />
                                    </IconButton>
                                </CardTop>
                                <SkeletonStack>
                                    <SkeletonBlock width="68%" height="24px" />
                                    <SkeletonBlock width="94%" height="13px" />
                                    <SkeletonBlock width="80%" height="13px" />
                                </SkeletonStack>
                                <CardFooter>
                                    <SkeletonBlock width="190px" height="42px" />
                                </CardFooter>
                            </MeetingCard>
                        ))}
                    </CardsGrid>
                ) : filtered.length === 0 ? (
                    <EmptyState>
                        <div>
                            <EmptyIcon>
                                <Mic size={24} />
                            </EmptyIcon>
                            <H3>{search ? "No matching meetings" : "No meetings yet"}</H3>
                            <Body2
                                style={{
                                    color: "var(--Color-Text-Subtle)",
                                    marginTop: "var(--Size-Gap-M)",
                                }}
                            >
                                {search
                                    ? "Try another search term."
                                    : "Create your first recording when you are ready."}
                            </Body2>
                            {!search && (
                                <EmptyAction type="button" onClick={openNewMeeting}>
                                    <Plus size={16} />
                                    New Meeting
                                </EmptyAction>
                            )}
                        </div>
                    </EmptyState>
                ) : (
                    <CardsGrid>
                        {filtered.map((meeting) => (
                            <MeetingCard
                                key={meeting.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => openMeeting(meeting)}
                                onKeyDown={(event) => handleCardKeyDown(event, meeting)}
                            >
                                <CardTop>
                                    <CardIdentity>
                                        <IconOrb>
                                            <FileText size={30} />
                                        </IconOrb>
                                        <MetaPills>
                                            <MetaPill>
                                                <Users size={17} />
                                                {(meeting.participants || []).length} participants
                                            </MetaPill>
                                            <MetaPill>
                                                <Calendar size={17} />
                                                Created at {formatCreatedDate(meeting.start_time)}
                                            </MetaPill>
                                        </MetaPills>
                                    </CardIdentity>
                                    <CardActions onClick={(event) => event.stopPropagation()}>
                                        <IconButton
                                            type="button"
                                            aria-label={`Open actions for ${meeting.title || "Untitled meeting"}`}
                                            aria-haspopup="menu"
                                            aria-expanded={openMenuId === meeting.id}
                                            onClick={(event) => toggleMenu(event, meeting.id)}
                                            disabled={deletingId === meeting.id}
                                        >
                                            <MoreVertical size={22} />
                                        </IconButton>
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
                                    </CardActions>
                                </CardTop>
                                <MeetingTitle>{meeting.title || "Untitled meeting"}</MeetingTitle>
                                <MeetingSummary>
                                    {meeting.summary || "Summary will appear after processing."}
                                </MeetingSummary>
                                <CardFooter>
                                    <FeaturePill>
                                        <Sparkles size={17} />
                                        {meeting.summary
                                            ? "AI summary available"
                                            : "AI notes after processing"}
                                    </FeaturePill>
                                    <FeaturePill>
                                        <Clock3 size={17} />
                                        {getMeetingInfo(meeting)}
                                    </FeaturePill>
                                </CardFooter>
                            </MeetingCard>
                        ))}
                    </CardsGrid>
                )}
            </LibrarySection>

            {showNewMeeting && <NewMeetingModal onClose={() => setShowNewMeeting(false)} />}
            {pendingDeleteMeeting && (
                <Modal title="Delete meeting" onClose={closeDeleteDialog} width="480px">
                    <DeleteDialogBody>
                        <Body2>
                            Are you sure you want to delete{" "}
                            <strong>{pendingDeleteMeeting.title || "Untitled meeting"}</strong>?
                        </Body2>
                        <WarningPanel>
                            <Trash2 size={18} />
                            <Body3>
                                This will permanently remove its transcript, summary, action items, chats,
                                shares, access activity, and local audio file.
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
