import URLS from "common/utils/apiUrls";
import ApiService from "./api.service";

const AuthService = {
    signup(email, password) {
        return ApiService.post(URLS.signup, { data: { email, password } });
    },
    login(email, password) {
        return ApiService.post(URLS.login, { data: { email, password } });
    },
    me(options = {}) {
        return ApiService.get(URLS.me, options);
    },
    refresh() {
        return ApiService.post(URLS.refresh, { skipAuthRefresh: true });
    },
    logout() {
        return ApiService.post(URLS.logout);
    },
};

export default AuthService;
