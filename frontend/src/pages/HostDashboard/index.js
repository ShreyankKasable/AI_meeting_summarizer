import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Plus, Search, Calendar, Users } from "lucide-react";
import PageContainer from "common/components/PageContainer";
import Button from "common/components/Button";
import Badge from "common/components/Badge";
import { H1, Body2, Body3 } from "common/global-styled-components";
import { fetchMeetings, setActiveMeeting } from "common/redux/actions/meetingActions";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import { formatDate, formatDuration } from "common/utils/utils";
import NewMeetingModal from "./NewMeetingModal";

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    flex-wrap: wrap;
    margin-bottom: var(--Size-Gap-XXL);
`;

const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
    max-width: 360px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: var(--Size-Padding-M) var(--Size-Padding-L) var(--Size-Padding-M) 40px;
    font-size: var(--body-3-d);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    outline: none;

    &:focus {
        border-color: var(--Color-Border-Action);
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--Color-Icon-Subtle);
    display: flex;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--Size-Gap-XXL);
`;

const Card = styled.button`
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-1);
    }
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-4-d);
`;

const MetaItem = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
`;

const EmptyState = styled.div`
    text-align: center;
    padding: var(--Size-Padding-XXXL);
    color: var(--Color-Text-Subtle);
`;

function statusFor(meeting) {
    if (!meeting.end_time) return { label: "Processing", tone: "action" };
    const pending = (meeting.action_items || []).filter((i) => !i.completed).length;
    if (pending > 0) return { label: `${pending} Actions Pending`, tone: "warning" };
    return { label: "Completed", tone: "success" };
}

const HostDashboard = () => {
    const dispatch = useDispatch();
    const meetings = useSelector((state) => state.meetingDetails.list);
    const [search, setSearch] = useState("");
    const [showNewMeeting, setShowNewMeeting] = useState(false);

    useEffect(() => {
        dispatch(fetchMeetings());
    }, [dispatch]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return meetings;
        return meetings.filter(
            (m) =>
                m.title.toLowerCase().includes(term) ||
                (m.summary || "").toLowerCase().includes(term),
        );
    }, [meetings, search]);

    const openMeeting = (meeting) => {
        dispatch(setActiveMeeting(meeting.id));
        dispatch(setHostView(HOST_VIEWS.Meeting));
    };

    return (
        <PageContainer size="xl">
            <Header>
                <div>
                    <H1 style={{ fontSize: "var(--h2-d)" }}>Your Meetings</H1>
                    <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-S)" }}>
                        {meetings.length ? `${meetings.length} recorded` : "Nothing recorded yet"}
                    </Body2>
                </div>
                <div style={{ display: "flex", gap: "var(--Size-Gap-L)", alignItems: "center" }}>
                    <SearchWrapper>
                        <SearchIcon>
                            <Search size={16} />
                        </SearchIcon>
                        <SearchInput
                            placeholder="Search meetings..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </SearchWrapper>
                    <Button onClick={() => setShowNewMeeting(true)} id="new-meeting-btn">
                        <Plus size={16} />
                        New Meeting
                    </Button>
                </div>
            </Header>

            {filtered.length === 0 ? (
                <EmptyState>
                    <Body2>No meetings yet. Start your first recording!</Body2>
                </EmptyState>
            ) : (
                <Grid>
                    {filtered.map((meeting) => {
                        const status = statusFor(meeting);
                        return (
                            <Card key={meeting.id} type="button" onClick={() => openMeeting(meeting)}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <Body2 style={{ fontWeight: "var(--bold)" }}>{meeting.title}</Body2>
                                    <Badge tone={status.tone} uppercase>
                                        {status.label}
                                    </Badge>
                                </div>
                                <Body3>{meeting.summary ? meeting.summary.slice(0, 120) : "No summary available"}</Body3>
                                <MetaRow>
                                    <MetaItem>
                                        <Calendar size={14} />
                                        {formatDate(meeting.start_time)}
                                    </MetaItem>
                                    <MetaItem>
                                        <Users size={14} />
                                        {(meeting.participants || []).length}
                                    </MetaItem>
                                    {meeting.end_time && (
                                        <MetaItem>{formatDuration(meeting.start_time, meeting.end_time)}</MetaItem>
                                    )}
                                </MetaRow>
                            </Card>
                        );
                    })}
                </Grid>
            )}

            {showNewMeeting && <NewMeetingModal onClose={() => setShowNewMeeting(false)} />}
        </PageContainer>
    );
};

export default HostDashboard;
