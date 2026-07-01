import URLS from "common/utils/apiUrls";
import ApiService from "./api.service";

// Participant-side calls — token-scoped, unauthenticated (no bearer header).
// Kept separate from meeting.service.js so the two auth modes never mix in
// one call site.
const ShareService = {
    get(token) {
        return ApiService.get(URLS.publicShare(token));
    },
    getChatHistory(token) {
        return ApiService.get(URLS.publicShareChat(token));
    },
    sendChatMessage(token, question, provider) {
        return ApiService.post(URLS.publicShareChat(token), { data: { question, provider } });
    },
    translate(token, language) {
        return ApiService.post(URLS.publicShareTranslate(token), { data: { language } });
    },
};

export default ShareService;
