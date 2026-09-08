import { useState, useEffect } from "react";

export type ConsentLevel = "all" | "necessary" | null;

const STORAGE_KEY = "taracliagaz_cookie_consent";

export function useCookieConsent() {
    const [consent, setConsentState] = useState<ConsentLevel>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ConsentLevel | null;
        setConsentState(stored);
    }, []);

    const acceptAll = () => {
        localStorage.setItem(STORAGE_KEY, "all");
        setConsentState("all");
    };

    const rejectAll = () => {
        localStorage.setItem(STORAGE_KEY, "necessary");
        setConsentState("necessary");
    };

    const reset = () => {
        localStorage.removeItem(STORAGE_KEY);
        setConsentState(null);
    };

    return {
        consent,
        acceptAll,
        rejectAll,
        reset,
        hasAnalyticsConsent: consent === "all",
        isDecided: consent !== null,
    };
}