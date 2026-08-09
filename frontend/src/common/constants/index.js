// Host-side views. There's no router — App.jsx switches between these based
// on `state.sessionDetails.hostView`, mirroring how the reference project
// switches guest views off redux state instead of a URL.
export const HOST_VIEWS = {
    Dashboard: "dashboard",
    Join: "join",
    Record: "record",
    Settings: "settings",
    Meeting: "meeting",
    Share: "share",
};

export const PRIORITIES = ["high", "medium", "low"];

export const PRIORITY_BADGE_TONE = {
    high: "danger",
    medium: "warning",
    low: "neutral",
};

export const SUPPORTED_LANGUAGES = {
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
    ar: "Arabic",
    hi: "Hindi",
};

export const SHARE_EXPIRY_OPTIONS = [
    { value: "never", label: "Never" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
];

// Socket.IO event names — must match backend/app/common/constants.js exactly.
export const SOCKET_EVENTS = {
    CONNECTION_STATUS: "connection_status",
    START_RECORDING: "start_recording",
    RECORDING_STARTED: "recording_started",
    LIVE_TRANSCRIPT_UPDATE: "live_transcript_update",
    PROCESSING_STATUS: "processing_status",
    MEETING_PROCESSED: "meeting_processed",
    ERROR: "error",
};

export const STORAGE_KEYS = {
    Root: "meetai_state",
};

export const LIVE_CHUNK_MS = 10000;

export const UI_EVENTS = {
    OpenNewMeeting: "meetai:open-new-meeting",
};
