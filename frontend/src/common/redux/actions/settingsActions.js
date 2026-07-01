import { SettingsAction } from "./types";
import SettingsService from "services/settings.service";

export const setSettingsStatus = (status) => ({
    type: SettingsAction.SetStatus,
    payload: { status },
});
export const setSettingsSaving = (saving) => ({
    type: SettingsAction.SetSaving,
    payload: { saving },
});

export const fetchSettings = () => async (dispatch) => {
    const { data } = await SettingsService.get();
    dispatch(setSettingsStatus(data));
};

export const saveSetting = (provider, field, value) => async (dispatch) => {
    dispatch(setSettingsSaving(true));
    try {
        const { data } = await SettingsService.update(provider, field, value);
        dispatch(setSettingsStatus(data));
    } finally {
        dispatch(setSettingsSaving(false));
    }
};
