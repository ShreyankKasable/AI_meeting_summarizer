import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "services/socket.service";
import { SOCKET_EVENTS } from "common/constants";
import { toast } from "common/utils/toast";
import {
    appendLiveTranscript,
    setProcessingStatus,
    upsertMeeting,
    setActiveMeeting,
} from "common/redux/actions/meetingActions";

// Opens (and tears down) the one Socket.IO connection for the session, and
// wires its events to redux. Call this once, near the top of App.jsx, only
// while a host is authenticated.
const useSocket = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.sessionDetails.token);

    useEffect(() => {
        if (!token) return undefined;

        const socket = connectSocket(token);

        const handleRecordingStarted = (data) => {
            // Optimistic partial entry so RecordMeeting can show the real
            // title immediately; meeting_processed replaces it with the
            // full record once processing finishes.
            dispatch(upsertMeeting({ id: data.meeting_id, title: data.title }));
            dispatch(setActiveMeeting(data.meeting_id));
            toast.success("Meeting created", { message: "Recording has started." });
        };
        const handleLiveTranscript = (data) => {
            dispatch(appendLiveTranscript(data.text));
        };
        const handleProcessingStatus = (data) => {
            dispatch(setProcessingStatus(data));
        };
        const handleMeetingProcessed = (data) => {
            if (data.meeting) dispatch(upsertMeeting(data.meeting));
            toast.success("Meeting processed", { message: "Summary and action items are ready." });
        };
        const handleSocketError = (data = {}) => {
            toast.error("Meeting error", { message: data.message || "Something went wrong." });
        };

        socket.on(SOCKET_EVENTS.RECORDING_STARTED, handleRecordingStarted);
        socket.on(SOCKET_EVENTS.LIVE_TRANSCRIPT_UPDATE, handleLiveTranscript);
        socket.on(SOCKET_EVENTS.PROCESSING_STATUS, handleProcessingStatus);
        socket.on(SOCKET_EVENTS.MEETING_PROCESSED, handleMeetingProcessed);
        socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

        return () => {
            socket.off(SOCKET_EVENTS.RECORDING_STARTED, handleRecordingStarted);
            socket.off(SOCKET_EVENTS.LIVE_TRANSCRIPT_UPDATE, handleLiveTranscript);
            socket.off(SOCKET_EVENTS.PROCESSING_STATUS, handleProcessingStatus);
            socket.off(SOCKET_EVENTS.MEETING_PROCESSED, handleMeetingProcessed);
            socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
            disconnectSocket();
        };
    }, [token, dispatch]);
};

export default useSocket;
