import { Link } from "react-router-dom";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { useLanguage } from "../context/LanguageContext";
import { IconCookie } from "./icons";

export default function CookieBanner() {
    const { consent, acceptAll, rejectAll } = useCookieConsent();
    const { t } = useLanguage();

    if (consent !== null) return null;

    return (
        <div className="cookie-banner" role="dialog" aria-label={t('cookie.ariaLabel')}>
            <div className="cookie-container">
                <div className="cookie-content">
                    <h3><IconCookie /> {t('cookie.title')}</h3>
                    <p>
                        {t('cookie.text')}{" "}
                        <Link to="/page/cookies">{t('cookie.policy')}</Link>.
                    </p>
                </div>
                <div className="cookie-actions">
                    <button
                        onClick={rejectAll}
                        className="btn-cookie btn-reject"
                    >
                        {t('cookie.onlyNecessary')}
                    </button>
                    <button
                        onClick={acceptAll}
                        className="btn-cookie btn-accept"
                    >
                        {t('cookie.acceptAll')}
                    </button>
                </div>
            </div>
        </div>
    );
}
