import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./styles/index.css";
import App from "./App.tsx";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
const apiOrigin = apiBase.replace(/\/api\/?$/, "");
if (apiOrigin && apiOrigin !== window.location.origin) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = apiOrigin;
    document.head.appendChild(link);
}



createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </HelmetProvider>
    </StrictMode>
);