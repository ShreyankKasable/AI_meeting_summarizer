import { SessionAction } from "./types";
import AuthService from "services/auth.service";
import { setAuthToken } from "services/api.service";

export const setAuthLoading = () => ({ type: SessionAction.SetAuthLoading });

export const setAuth = ({ token, user }) => ({
    type: SessionAction.SetAuth,
    payload: { token, user },
});

export const setAuthError = (error) => ({
    type: SessionAction.SetAuthError,
    payload: { error },
});

export const setHostView = (view) => ({
    type: SessionAction.SetHostView,
    payload: { view },
});

export const logoutAction = () => ({ type: SessionAction.Logout });

export const signup = (email, password) => async (dispatch) => {
    dispatch(setAuthLoading());
    try {
        const { data } = await AuthService.signup(email, password);
        setAuthToken(data.token);
        dispatch(setAuth({ token: data.token, user: data.user }));
    } catch (err) {
        dispatch(setAuthError(err.message));
        throw err;
    }
};

export const login = (email, password) => async (dispatch) => {
    dispatch(setAuthLoading());
    try {
        const { data } = await AuthService.login(email, password);
        setAuthToken(data.token);
        dispatch(setAuth({ token: data.token, user: data.user }));
    } catch (err) {
        dispatch(setAuthError(err.message));
        throw err;
    }
};

export const logout = () => (dispatch) => {
    AuthService.logout().catch(() => {});
    setAuthToken(null);
    dispatch(logoutAction());
};

// Confirms a persisted token (from localStorage rehydration) is still valid
// on app boot; falls back to a logged-out state if not.
export const hydrateSession = () => async (dispatch, getState) => {
    const { token } = getState().sessionDetails;
    if (!token) return;

    setAuthToken(token);
    dispatch(setAuthLoading());
    try {
        const { data } = await AuthService.me();
        dispatch(setAuth({ token, user: data.user }));
    } catch {
        setAuthToken(null);
        dispatch(logoutAction());
    }
};
