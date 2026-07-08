import { MeetingAction } from "./types";
import MeetingService from "services/meeting.service";

export const setMeetings = (meetings) => ({ type: MeetingAction.SetMeetings, payload: { meetings } });
export const upsertMeeting = (meeting) => ({ type: MeetingAction.UpsertMeeting, payload: { meeting } });
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
    const { data } = await MeetingService.updateTitle(id, title);
    dispatch(upsertMeeting(data.meeting));
};

export const toggleActionItem = (meetingId, itemId) => async (dispatch) => {
    await MeetingService.toggleActionItem(itemId);
    const { data } = await MeetingService.get(meetingId);
    dispatch(upsertMeeting(data));
};

export const exportToNotion = (id) => () => MeetingService.exportNotion(id);

export const renameSpeaker = (meetingId, speaker, name) => async (dispatch) => {
    const { data } = await MeetingService.renameSpeaker(meetingId, speaker, name);
    dispatch(upsertMeeting(data.meeting));
};
