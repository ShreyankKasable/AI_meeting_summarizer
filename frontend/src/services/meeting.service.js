import URLS from "common/utils/apiUrls";
import ApiService from "./api.service";

// Host-owned meeting calls only. See share.service.js for the signed-in
// participant, token-scoped equivalents.
const MeetingService = {
    list() {
        return ApiService.get(URLS.meetings);
    },
    get(id) {
        return ApiService.get(URLS.meeting(id));
    },
    delete(id) {
        return ApiService.delete(URLS.meeting(id));
    },
    getActionItems(id) {
        return ApiService.get(URLS.meetingActionItems(id));
    },
    toggleActionItem(itemId) {
        return ApiService.put(URLS.actionItemComplete(itemId));
    },
    updateTitle(id, title) {
        return ApiService.put(URLS.meetingTitle(id), { data: { title } });
    },
    translate(id, language) {
        return ApiService.post(URLS.meetingTranslate(id), { data: { language } });
    },
    getChatHistory(id) {
        return ApiService.get(URLS.meetingChat(id));
    },
    sendChatMessage(id, question, provider) {
        return ApiService.post(URLS.meetingChat(id), { data: { question, provider } });
    },
    exportNotion(id) {
        return ApiService.post(URLS.meetingExportNotion(id));
    },
    getShare(id) {
        return ApiService.get(URLS.meetingShare(id));
    },
    getShareAccess(id) {
        return ApiService.get(URLS.meetingShareAccess(id));
    },
    approveShareAccess(id, userId) {
        return ApiService.post(URLS.meetingShareAccessApprove(id, userId));
    },
    rejectShareAccess(id, userId) {
        return ApiService.post(URLS.meetingShareAccessReject(id, userId));
    },
    removeShareAccess(id, userId) {
        return ApiService.delete(URLS.meetingShareAccessUser(id, userId));
    },
    createShare(id, expiresIn) {
        return ApiService.post(URLS.meetingShare(id), { data: { expires_in: expiresIn } });
    },
    revokeShare(id) {
        return ApiService.post(URLS.meetingShareRevoke(id));
    },
    regenerateShare(id, expiresIn) {
        return ApiService.post(URLS.meetingShareRegenerate(id), { data: { expires_in: expiresIn } });
    },
    renameSpeaker(id, speaker, name) {
        return ApiService.put(URLS.meetingSpeakers(id), { data: { speaker, name } });
    },

    uploadAudio(id, blob) {
        const formData = new FormData();
        formData.append("audio", blob, "audio.wav");
        return ApiService.postForm(`${URLS.meeting(id)}/audio`, formData);
    },
    uploadAudioChunk(id, blob) {
        const formData = new FormData();
        formData.append("audio", blob, "chunk.wav");
        return ApiService.postForm(`${URLS.meeting(id)}/audio-chunk`, formData);
    },
};

export default MeetingService;
