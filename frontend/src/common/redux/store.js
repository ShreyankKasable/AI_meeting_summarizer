import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./rootReducer";
import { loadState, saveState } from "common/utils/utils";
import { setAuthToken } from "services/api.service";

// Rehydrate from localStorage so the session (auth token) survives refreshes.
const preloadedState = loadState();

// Attach the persisted token to the API service synchronously, before any
// component mounts. Doing this only inside the async hydrateSession thunk is
// too late: child components' effects (e.g. HostDashboard's fetchMeetings)
// run before App.jsx's own effect in the same commit, so their first request
// would otherwise go out with no Authorization header at all.
if (preloadedState?.sessionDetails?.token) {
    setAuthToken(preloadedState.sessionDetails.token);
}

const composeEnhancers =
    (typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducer, preloadedState, composeEnhancers(applyMiddleware(thunk)));

// Persist the whole tree on every change (small enough not to need throttling).
store.subscribe(() => {
    saveState(store.getState());
});

export default store;
