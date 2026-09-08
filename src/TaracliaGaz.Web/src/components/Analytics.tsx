import { useEffect } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";

export default function Analytics() {
    const { hasAnalyticsConsent } = useCookieConsent();

    useEffect(() => {
        if (!hasAnalyticsConsent) return;

        // Сюда позже подключим аналитику
        // Например, Plausible:
        // const script = document.createElement("script");
        // script.src = "https://plausible.io/js/script.js";
        // script.setAttribute("data-domain", "taraclia-gaz.md");
        // document.head.appendChild(script);

        console.log("Аналитика активирована");
    }, [hasAnalyticsConsent]);

    return null;
}