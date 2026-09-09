import { useEffect } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";

export default function Analytics() {
    const { hasAnalyticsConsent } = useCookieConsent(); // ✅ Получаем согласие

    useEffect(() => {
        // Не загружаем без согласия пользователя
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

        // Cleanup при размонтировании или изменении согласия
        return () => {
            script.remove();
        };
    }, [hasAnalyticsConsent]); // ✅ Реагируем на изменение согласия

    return null;
}