import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import Navbar from "common/components/Navbar";
import { HOST_VIEWS } from "common/constants";
import { hydrateSession } from "common/redux/actions/sessionActions";
import useSocket from "common/hooks/useSocket";
import Login from "pages/Login";
import HostDashboard from "pages/HostDashboard";
import RecordMeeting from "pages/RecordMeeting";
import ShareScreen from "pages/ShareScreen";
import MeetingContentView from "pages/MeetingContentView";
import Settings from "pages/Settings";
import MeetingContentViewParticipant from "pages/MeetingContentViewParticipant";
import InvalidToken from "pages/InvalidToken";

const Layout = styled.div`
    min-height: 100vh;
    display: flex;
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Default);
`;

const Main = styled.main`
    flex: 1;
    min-width: 0;
`;

// Renders the authenticated host shell (sidebar + whichever view is active).
const HostApp = () => {
    useSocket();
    const hostView = useSelector((state) => state.sessionDetails.hostView);

    const renderView = () => {
        switch (hostView) {
            case HOST_VIEWS.Record:
                return <RecordMeeting />;
            case HOST_VIEWS.Settings:
                return <Settings />;
            case HOST_VIEWS.Meeting:
                return <MeetingContentView />;
            case HOST_VIEWS.Share:
                return <ShareScreen />;
            case HOST_VIEWS.Dashboard:
            default:
                return <HostDashboard />;
        }
    };

    return (
        <Layout>
            <Navbar />
            <Main>{renderView()}</Main>
        </Layout>
    );
};

export default function App() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.sessionDetails.token);

    useEffect(() => {
        dispatch(hydrateSession());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // A participant link looks like /share/<token> — resolved client-side
    // since there's no router, and checked before the authenticated branch
    // below since a participant is never logged in. MeetingContentViewParticipant
    // itself renders InvalidToken if the token doesn't resolve to a meeting.
    const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/);
    if (shareMatch) return <MeetingContentViewParticipant token={shareMatch[1]} />;
    if (window.location.pathname.startsWith("/share/")) return <InvalidToken />;

    if (!token) return <Login />;

    return <HostApp />;
}
