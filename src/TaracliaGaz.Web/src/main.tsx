import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import './styles/index.css';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
const apiOrigin = apiBase.replace(/\/api\/?$/, "");
if (apiOrigin && apiOrigin !== window.location.origin) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = apiOrigin;
    // fetch() к API идёт в режиме CORS — без crossorigin браузер держит
    // прогретое соединение в другом пуле и не использует его (Lighthouse:
    // "Unused preconnect")
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
}



ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </BrowserRouter>
    </React.StrictMode>
);