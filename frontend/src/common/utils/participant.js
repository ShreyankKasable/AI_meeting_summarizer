const STORAGE_KEY = "meetai_participant_id";

// Participant access is authenticated, but chat history still needs a
// per-browser thread id so two browsers under the same account do not collide.
export function getParticipantId() {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
}
