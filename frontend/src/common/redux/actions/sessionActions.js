import { SessionAction } from "./types";
import AuthService from "services/auth.service";
import { toast } from "common/utils/toast";

export const setAuthLoading = () => ({ type: SessionAction.SetAuthLoading });

export const setAuth = ({ user }) => ({
    type: SessionAction.SetAuth,
    payload: { user },
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
        dispatch(setAuth({ user: data.user }));
        toast.success("Account created");
    } catch (err) {
        dispatch(setAuthError(err.message));
        throw err;
    }
};

export const login = (email, password) => async (dispatch) => {
    dispatch(setAuthLoading());
    try {
        const { data } = await AuthService.login(email, password);
        dispatch(setAuth({ user: data.user }));
    } catch (err) {
        dispatch(setAuthError(err.message));
        throw err;
    }
};

export const logout = () => (dispatch) => {
    AuthService.logout().catch(() => {});
    dispatch(logoutAction());
};

// Confirms the HTTP-only auth cookie is still valid on app boot; falls back to
// a logged-out state if not.
export const hydrateSession = () => async (dispatch, getState) => {
    const { user, status } = getState().sessionDetails;
    if (!user && status !== "loading") dispatch(setAuthLoading());

    try {
        const { data } = await AuthService.me();
        dispatch(setAuth({ user: data.user }));
    } catch {
        dispatch(logoutAction());
    }
};
