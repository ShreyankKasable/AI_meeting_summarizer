export const TOAST_EVENT = "meetai:toast";
export const TOAST_DISMISS_EVENT = "meetai:toast-dismiss";

let nextToastId = 1;

const defaultDuration = 4200;

const normalizeToast = (input, fallbackTone) => {
    const payload = typeof input === "string" ? { title: input } : { ...input };
    return {
        id: payload.id || nextToastId++,
        tone: payload.tone || fallbackTone || "info",
        title: payload.title || "",
        message: payload.message || payload.description || "",
        duration: payload.duration ?? defaultDuration,
    };
};

const emit = (eventName, detail) => {
    if (typeof window === "undefined") return null;
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    return detail?.id || null;
};

const mergeInput = (input, options) => ({
    ...options,
    ...(typeof input === "string" ? { title: input } : input),
});

const showWithTone = (tone, input, options = {}) =>
    emit(TOAST_EVENT, normalizeToast(mergeInput(input, options), tone));

export const toast = {
    show(input) {
        return emit(TOAST_EVENT, normalizeToast(input));
    },
    success(input, options = {}) {
        return showWithTone("success", input, options);
    },
    error(input, options = {}) {
        return showWithTone("error", input, options);
    },
    warning(input, options = {}) {
        return showWithTone("warning", input, options);
    },
    info(input, options = {}) {
        return showWithTone("info", input, options);
    },
    dismiss(id) {
        return emit(TOAST_DISMISS_EVENT, { id });
    },
};
