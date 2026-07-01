import { combineReducers } from "redux";
import sessionReducer from "./reducers/session.reducer";
import meetingReducer from "./reducers/meeting.reducer";
import settingsReducer from "./reducers/settings.reducer";

const rootReducer = combineReducers({
    sessionDetails: sessionReducer,
    meetingDetails: meetingReducer,
    settingsDetails: settingsReducer,
});

export default rootReducer;
