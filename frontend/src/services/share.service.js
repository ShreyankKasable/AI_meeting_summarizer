import URLS from "common/utils/apiUrls";
import { getParticipantId } from "common/utils/participant";
import ApiService from "./api.service";

const participantHeader = () => ({ "X-Participant-Id": getParticipantId() });

// Participant-side calls: signed-in session plus a meeting share token.
// Kept separate from meeting.service.js so the two access modes never mix in
// one call site. Chat calls carry a per-browser participant id so each
// participant gets their own private thread (see common/utils/participant.js).
const ShareService = {
    listApprovedMeetings() {
        return ApiService.get(URLS.publicShareMeetings);
    },
    requestAccess(token) {
        return ApiService.post(URLS.publicShareRequest(token), { headers: participantHeader() });
    },
    getAccessStatus(token) {
        return ApiService.get(URLS.publicShareAccess(token), { headers: participantHeader() });
    },
    removeAccess(token) {
        return ApiService.delete(URLS.publicShareAccess(token), { headers: participantHeader() });
    },
    get(token) {
        return ApiService.get(URLS.publicShare(token), { headers: participantHeader() });
    },
    getChatHistory(token) {
        return ApiService.get(URLS.publicShareChat(token), { headers: participantHeader() });
    },
    sendChatMessage(token, question, provider) {
        return ApiService.post(URLS.publicShareChat(token), {
            data: { question, provider },
            headers: participantHeader(),
        });
    },
    translate(token, language) {
        return ApiService.post(URLS.publicShareTranslate(token), {
            data: { language },
            headers: participantHeader(),
        });
    },
};

export default ShareService;
