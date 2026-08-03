import { STORAGE_KEYS } from "common/constants";

// ---- Formatting ----

export const pluralize = (count, singular, plural) =>
    `${count} ${count === 1 ? singular : plural || `${singular}s`}`;

export const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
};

// Formats a duration between two ISO timestamps as HH:MM:SS (or MM:SS if
// under an hour).
export const formatDuration = (startIso, endIso) => {
    if (!startIso || !endIso) return "--:--";
    const ms = new Date(endIso) - new Date(startIso);
    if (!Number.isFinite(ms) || ms < 0) return "--:--";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

// Formats a millisecond counter (e.g. a live recording timer) as HH:MM:SS.
export const formatElapsed = (ms) => {
    const totalSeconds = Math.floor((ms || 0) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const getTranscriptText = (transcript) => {
    if (!transcript) return "";
    if (typeof transcript === "string") return transcript;
    if (typeof transcript === "object") return transcript.text || "";
    return "";
};

// ---- localStorage persistence (whole redux tree, mirrors store.subscribe) ----

export const loadState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.Root);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw);
        if (parsed?.sessionDetails) {
            parsed.sessionDetails = {
                ...parsed.sessionDetails,
                token: undefined,
                user: null,
                status: "loading",
                error: null,
            };
        }
        return parsed;
    } catch (err) {
        console.warn("Failed to read persisted state:", err);
        return undefined;
    }
};

export const saveState = (state) => {
    try {
        const sanitized = {
            ...state,
            sessionDetails: state?.sessionDetails
                ? { ...state.sessionDetails, token: undefined, user: null, error: null }
                : state?.sessionDetails,
        };
        localStorage.setItem(STORAGE_KEYS.Root, JSON.stringify(sanitized));
    } catch (err) {
        console.warn("Failed to persist state:", err);
    }
};
