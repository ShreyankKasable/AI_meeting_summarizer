import axios from "axios";
import URLS from "common/utils/apiUrls";

const commonOptions = {
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
};

const ApiService = {};

function getUrlPathname(url = "") {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    try {
        return new URL(url, baseUrl).pathname;
    } catch {
        return url;
    }
}

const refreshExcludedPaths = new Set([URLS.signup, URLS.login, URLS.logout, URLS.refresh].map(getUrlPathname));

function shouldAttemptRefresh(error) {
    const { config, response } = error;
    if (response?.status !== 401 || !config?.url) return false;
    if (config._authRetry || config.skipAuthRefresh) return false;
    return !refreshExcludedPaths.has(getUrlPathname(config.url));
}

function normalizeAxiosError(error) {
    if (error instanceof Error && !error.response) return error;

    const message =
        error.response?.data?.error || error.message || "Something went wrong. Please try again.";
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    return normalized;
}

ApiService.get = (url, options = {}) => {
    return axios.get(url, {
        ...commonOptions,
        ...options,
        params: options.params,
        headers: { ...commonOptions.headers, ...options.headers },
    });
};

ApiService.post = (url, options = {}) => {
    return axios.post(url, options.data, {
        ...commonOptions,
        ...options,
        headers: { ...commonOptions.headers, ...options.headers },
        params: options.params,
    });
};

ApiService.put = (url, options = {}) => {
    return axios.put(url, options.data, {
        ...commonOptions,
        ...options,
        headers: { ...commonOptions.headers, ...options.headers },
        params: options.params,
    });
};

ApiService.delete = (url, options = {}) => {
    return axios.delete(url, {
        ...commonOptions,
        ...options,
        headers: { ...commonOptions.headers, ...options.headers },
        params: options.params,
    });
};

// For multipart/form-data uploads (audio files). Deliberately omits the
// default JSON Content-Type so axios can set the correct multipart boundary
// itself from the FormData body.
ApiService.postForm = (url, formData) => {
    return axios.post(url, formData, { withCredentials: true });
};

// Normalize axios errors into plain Error objects with a readable message.
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (shouldAttemptRefresh(error)) {
            try {
                error.config._authRetry = true;
                error.config.withCredentials = true;
                await axios.post(URLS.refresh, {}, {
                    ...commonOptions,
                    skipAuthRefresh: true,
                });
                return axios(error.config);
            } catch (refreshError) {
                return Promise.reject(normalizeAxiosError(refreshError));
            }
        }

        return Promise.reject(normalizeAxiosError(error));
    },
);

export default ApiService;
