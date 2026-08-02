import { MeetingAction } from "../actions/types";

export const initialState = {
    list: [],
    activeId: null,
    liveTranscript: [],
    processingStatus: null,
};

const upsert = (list, meeting) => {
    const idx = list.findIndex((m) => m.id === meeting.id);
    if (idx === -1) return [meeting, ...list];
    const next = [...list];
    next[idx] = meeting;
    return next;
};

const meetingReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case MeetingAction.SetMeetings:
            return { ...state, list: payload.meetings };
        case MeetingAction.UpsertMeeting:
            return { ...state, list: upsert(state.list, payload.meeting) };
        case MeetingAction.RemoveMeeting:
            return {
                ...state,
                list: state.list.filter((meeting) => meeting.id !== payload.id),
                activeId: state.activeId === payload.id ? null : state.activeId,
            };
        case MeetingAction.SetActiveMeeting:
            return { ...state, activeId: payload.id, liveTranscript: [], processingStatus: null };
        case MeetingAction.AppendLiveTranscript:
            return { ...state, liveTranscript: [...state.liveTranscript, payload.text] };
        case MeetingAction.ClearLiveTranscript:
            return { ...state, liveTranscript: [] };
        case MeetingAction.SetProcessingStatus:
            return { ...state, processingStatus: payload.status };
        default:
            return state;
    }
};

export default meetingReducer;
