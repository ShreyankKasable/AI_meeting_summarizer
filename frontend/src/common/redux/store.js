import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./rootReducer";
import { loadState, saveState } from "common/utils/utils";

// Rehydrate non-sensitive UI state from localStorage. Auth itself is restored
// by calling /api/auth/me with the HTTP-only cookie on app boot.
const preloadedState = loadState();

const composeEnhancers =
    (typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducer, preloadedState, composeEnhancers(applyMiddleware(thunk)));

// Persist the whole tree on every change (small enough not to need throttling).
store.subscribe(() => {
    saveState(store.getState());
});

export default store;
