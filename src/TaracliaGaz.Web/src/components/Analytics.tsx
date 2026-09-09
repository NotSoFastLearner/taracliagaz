import { useEffect } from "react";

export default function Analytics() {
    useEffect(() => {
        const domain = import.meta.env.VITE_ANALYTICS_DOMAIN;
        if (!domain || domain === "localhost") {
            return;
        }

        const script = document.createElement("script");
        script.defer = true;
        script.src = `https://${domain}/js/script.js`;
        script.setAttribute("data-domain", window.location.hostname);
        document.head.appendChild(script);
    }, []);

    return null;
}