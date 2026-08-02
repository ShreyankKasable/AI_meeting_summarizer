import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import Navbar from "common/components/Navbar";
import { HOST_VIEWS } from "common/constants";
import { hydrateSession } from "common/redux/actions/sessionActions";
import useSocket from "common/hooks/useSocket";
import LandingPage from "pages/LandingPage";
import Login from "pages/Login";
import HostDashboard from "pages/HostDashboard";
import JoinMeeting from "pages/JoinMeeting";
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

    @media (max-width: 1024px) {
        flex-direction: column;
    }
`;

const Main = styled.main`
    flex: 1;
    min-width: 0;
`;

const HostApp = () => {
    useSocket();
    const hostView = useSelector((state) => state.sessionDetails.hostView);

    const renderView = () => {
        switch (hostView) {
            case HOST_VIEWS.Record:
                return <RecordMeeting />;
            case HOST_VIEWS.Join:
                return <JoinMeeting />;
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

const UnauthenticatedApp = () => {
    const [mode, setMode] = useState("landing");

    if (mode === "landing") {
        return (
            <LandingPage
                onSignIn={() => setMode("login")}
                onRegister={() => setMode("signup")}
                onJoin={() => setMode("join")}
            />
        );
    }

    return (
        <Login
            initialMode={mode === "signup" ? "signup" : "login"}
            postAuthView={mode === "join" ? HOST_VIEWS.Join : undefined}
            onBackToLanding={() => setMode("landing")}
        />
    );
};

export default function App() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.sessionDetails.token);

    useEffect(() => {
        dispatch(hydrateSession());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/);
    if (shareMatch) {
        if (!token) {
            return <Login initialMode="login" onBackToLanding={() => window.location.assign("/")} />;
        }
        return <MeetingContentViewParticipant token={shareMatch[1]} />;
    }
    if (window.location.pathname.startsWith("/share/")) {
        if (!token) {
            return <Login initialMode="login" onBackToLanding={() => window.location.assign("/")} />;
        }
        return <InvalidToken />;
    }

    if (!token) return <UnauthenticatedApp />;

    return <HostApp />;
}
