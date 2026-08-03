import { SessionAction } from "../actions/types";
import { HOST_VIEWS } from "common/constants";

export const initialState = {
    user: null,
    status: "loading", // idle | loading | error
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
                user: payload.user,
                status: "idle",
                error: null,
            };
        case SessionAction.SetAuthError:
            return { ...state, status: "error", error: payload.error, user: null };
        case SessionAction.SetHostView:
            return { ...state, hostView: payload.view };
        case SessionAction.Logout:
            return { ...initialState, status: "idle" };
        default:
            return state;
    }
};

export default sessionReducer;
