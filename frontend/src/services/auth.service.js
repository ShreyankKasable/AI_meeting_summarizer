import URLS from "common/utils/apiUrls";
import ApiService from "./api.service";

const AuthService = {
    signup(email, password) {
        return ApiService.post(URLS.signup, { data: { email, password } });
    },
    login(email, password) {
        return ApiService.post(URLS.login, { data: { email, password } });
    },
    me() {
        return ApiService.get(URLS.me);
    },
    logout() {
        return ApiService.post(URLS.logout);
    },
};

export default AuthService;
