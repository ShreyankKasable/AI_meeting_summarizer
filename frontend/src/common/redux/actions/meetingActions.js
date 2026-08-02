import { MeetingAction } from "./types";
import MeetingService from "services/meeting.service";
import { toast } from "common/utils/toast";

export const setMeetings = (meetings) => ({ type: MeetingAction.SetMeetings, payload: { meetings } });
export const upsertMeeting = (meeting) => ({ type: MeetingAction.UpsertMeeting, payload: { meeting } });
export const removeMeeting = (id) => ({ type: MeetingAction.RemoveMeeting, payload: { id } });
export const setActiveMeeting = (id) => ({ type: MeetingAction.SetActiveMeeting, payload: { id } });
export const appendLiveTranscript = (text) => ({
    type: MeetingAction.AppendLiveTranscript,
    payload: { text },
});
export const clearLiveTranscript = () => ({ type: MeetingAction.ClearLiveTranscript });
export const setProcessingStatus = (status) => ({
    type: MeetingAction.SetProcessingStatus,
    payload: { status },
});

export const fetchMeetings = () => async (dispatch) => {
    const { data } = await MeetingService.list();
    dispatch(setMeetings(data));
};

export const fetchMeeting = (id) => async (dispatch) => {
    const { data } = await MeetingService.get(id);
    dispatch(upsertMeeting(data));
    dispatch(setActiveMeeting(id));
    return data;
};

export const updateMeetingTitle = (id, title) => async (dispatch) => {
    try {
        const { data } = await MeetingService.updateTitle(id, title);
        dispatch(upsertMeeting(data.meeting));
        toast.success("Meeting updated", { message: "The title was saved." });
        return data.meeting;
    } catch (err) {
        toast.error("Could not update meeting", { message: err.message });
        throw err;
    }
};

export const deleteMeeting = (id) => async (dispatch) => {
    try {
        await MeetingService.delete(id);
        dispatch(removeMeeting(id));
        toast.success("Meeting deleted", { message: "Transcript, summary, actions, chats, shares, and audio were removed." });
    } catch (err) {
        toast.error("Could not delete meeting", { message: err.message });
        throw err;
    }
};

export const toggleActionItem = (meetingId, itemId) => async (dispatch) => {
    try {
        await MeetingService.toggleActionItem(itemId);
        const { data } = await MeetingService.get(meetingId);
        dispatch(upsertMeeting(data));
        toast.success("Action item updated");
    } catch (err) {
        toast.error("Could not update action item", { message: err.message });
        throw err;
    }
};

export const exportToNotion = (id) => async () => {
    try {
        const response = await MeetingService.exportNotion(id);
        toast.success("Exported to Notion");
        return response;
    } catch (err) {
        toast.error("Notion export failed", { message: err.message });
        throw err;
    }
};

export const renameSpeaker = (meetingId, speaker, name) => async (dispatch) => {
    try {
        const { data } = await MeetingService.renameSpeaker(meetingId, speaker, name);
        dispatch(upsertMeeting(data.meeting));
        toast.success("Speaker updated");
        return data.meeting;
    } catch (err) {
        toast.error("Could not update speaker", { message: err.message });
        throw err;
    }
};
