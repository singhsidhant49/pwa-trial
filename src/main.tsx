import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./assets/index.css";

import { registerSW } from "virtual:pwa-register";
import { setupOnlineSync } from "./utils/sync";

registerSW({ immediate: true });
setupOnlineSync();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
