import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./rootReducer";
import { loadState, saveState } from "common/utils/utils";

// Rehydrate from localStorage so the session (auth token) survives refreshes.
const preloadedState = loadState();

const composeEnhancers =
    (typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducer, preloadedState, composeEnhancers(applyMiddleware(thunk)));

// Persist the whole tree on every change (small enough not to need throttling).
store.subscribe(() => {
    saveState(store.getState());
});

export default store;
