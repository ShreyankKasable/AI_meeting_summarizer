import URLS from "common/utils/apiUrls";
import ApiService from "./api.service";

const SettingsService = {
    get() {
        return ApiService.get(URLS.settings);
    },
    // `field` is the exact backend field name for that provider (e.g.
    // "api_key", or "asr_model"/"chat_model" for huggingface).
    update(provider, field, value) {
        return ApiService.put(URLS.settings, { data: { provider, field, value } });
    },
};

export default SettingsService;
