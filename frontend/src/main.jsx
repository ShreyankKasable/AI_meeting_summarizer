import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "common/redux/store";
import ToastViewport from "common/components/Toast";
import GlobalStyle from "GlobalStyle";
import App from "./App";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <GlobalStyle />
            <App />
            <ToastViewport />
        </Provider>
    </StrictMode>,
);
