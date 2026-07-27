import URLS from "common/utils/apiUrls";
import ApiService from "./api.service";

const SettingsService = {
    get() {
        return ApiService.get(URLS.settings);
    },
    // `field` is the exact safe backend field for that provider, such as
    // "model", "asr_model", or "chat_model". AI API keys are server-owned.
    update(provider, field, value) {
        return ApiService.put(URLS.settings, { data: { provider, field, value } });
    },
};

export default SettingsService;
