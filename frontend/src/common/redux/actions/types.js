export const SessionAction = {
    SetAuthLoading: "SET_AUTH_LOADING",
    SetAuth: "SET_AUTH",
    SetAuthError: "SET_AUTH_ERROR",
    Logout: "LOGOUT",
    SetHostView: "SET_HOST_VIEW",
};

export const MeetingAction = {
    SetMeetings: "SET_MEETINGS",
    UpsertMeeting: "UPSERT_MEETING",
    RemoveMeeting: "REMOVE_MEETING",
    SetActiveMeeting: "SET_ACTIVE_MEETING",
    AppendLiveTranscript: "APPEND_LIVE_TRANSCRIPT",
    ClearLiveTranscript: "CLEAR_LIVE_TRANSCRIPT",
    SetProcessingStatus: "SET_PROCESSING_STATUS",
};

export const SettingsAction = {
    SetStatus: "SET_SETTINGS_STATUS",
    SetSaving: "SET_SETTINGS_SAVING",
};
