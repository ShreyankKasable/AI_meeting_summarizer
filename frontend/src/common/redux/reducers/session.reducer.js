import { SessionAction } from "../actions/types";
import { HOST_VIEWS } from "common/constants";

export const initialState = {
    token: null,
    user: null,
    status: "idle", // idle | loading | error
    error: null,
    hostView: HOST_VIEWS.Dashboard,
};

const sessionReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case SessionAction.SetAuthLoading:
            return { ...state, status: "loading", error: null };
        case SessionAction.SetAuth:
            return {
                ...state,
                token: payload.token,
                user: payload.user,
                status: "idle",
                error: null,
            };
        case SessionAction.SetAuthError:
            return { ...state, status: "error", error: payload.error, token: null, user: null };
        case SessionAction.SetHostView:
            return { ...state, hostView: payload.view };
        case SessionAction.Logout:
            return { ...initialState };
        default:
            return state;
    }
};

export default sessionReducer;
