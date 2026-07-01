import { SettingsAction } from "../actions/types";

export const initialState = {
    status: null,
    saving: false,
    lastSavedAt: null,
};

const settingsReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case SettingsAction.SetStatus:
            return { ...state, status: payload.status };
        case SettingsAction.SetSaving:
            return {
                ...state,
                saving: payload.saving,
                lastSavedAt: payload.saving ? state.lastSavedAt : new Date().toISOString(),
            };
        default:
            return state;
    }
};

export default settingsReducer;
