const STORAGE_KEY = "meetai_participant_id";

// Participants never log in, so there's no user id to key a chat thread on.
// Instead, each browser gets a random id on first use, persisted so the same
// browser keeps its own thread across reloads — a different browser (a
// different participant) gets a different id, and therefore a separate
// thread, without requiring an account.
export function getParticipantId() {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
}
