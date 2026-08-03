import axios from "axios";

const commonOptions = {
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
};

const ApiService = {};

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
    (error) => {
        const message =
            error.response?.data?.error || error.message || "Something went wrong. Please try again.";
        const normalized = new Error(message);
        normalized.status = error.response?.status;
        return Promise.reject(normalized);
    },
);

export default ApiService;
