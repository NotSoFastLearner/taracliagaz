import { useState } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { IconCookie } from "./icons";

export default function CookieBanner() {
    const { consent, acceptAll, rejectOptional } = useCookieConsent();
    const [show, setShow] = useState(!consent);

    if (!show) return null;

    return (
        <div className="cookie-banner" role="dialog" aria-label="Использование cookies">
            <div className="cookie-container">
                <div className="cookie-content">
                    <h3><IconCookie /> Мы используем cookies</h3>
                    <p>
                        Этот сайт использует cookies для обеспечения работы и улучшения сервиса.
                        Продолжая использовать сайт, вы соглашаетесь с{" "}
                        <a href="/page/cookies">политикой использования cookies</a>.
                    </p>
                </div>
                <div className="cookie-actions">
                    <button
                        onClick={() => { rejectOptional(); setShow(false); }}
                        className="btn-cookie btn-reject"
                    >
                        Только необходимые
                    </button>
                    <button
                        onClick={() => { acceptAll(); setShow(false); }}
                        className="btn-cookie btn-accept"
                    >
                        Принять все
                    </button>
                </div>
            </div>
        </div>
    );
}