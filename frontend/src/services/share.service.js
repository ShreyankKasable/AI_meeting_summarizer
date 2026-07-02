import URLS from "common/utils/apiUrls";
import { getParticipantId } from "common/utils/participant";
import ApiService from "./api.service";

const participantHeader = () => ({ "X-Participant-Id": getParticipantId() });

// Participant-side calls — token-scoped, unauthenticated (no bearer header).
// Kept separate from meeting.service.js so the two auth modes never mix in
// one call site. Chat calls carry a per-browser participant id so each
// participant gets their own private thread (see common/utils/participant.js).
const ShareService = {
    get(token) {
        return ApiService.get(URLS.publicShare(token));
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
        return ApiService.post(URLS.publicShareTranslate(token), { data: { language } });
    },
};

export default ShareService;
