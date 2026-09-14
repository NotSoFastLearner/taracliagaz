import { useEffect } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";

export default function Analytics() {
    const { hasAnalyticsConsent } = useCookieConsent();

    useEffect(() => {
        // Не загружаем аналитику без согласия пользователя
        if (!hasAnalyticsConsent) {
            return;
        }

        const domain = import.meta.env.VITE_ANALYTICS_DOMAIN;
        if (!domain || domain === "localhost") {
            return;
        }

        const script = document.createElement("script");
        script.defer = true;
        script.src = `https://${domain}/js/script.js`;
        script.setAttribute("data-domain", window.location.hostname);
        document.head.appendChild(script);

        return () => {
            script.remove();
        };
    }, [hasAnalyticsConsent]);

    return null;
}