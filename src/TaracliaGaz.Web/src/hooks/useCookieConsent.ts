import { useState, useEffect, useCallback } from "react";

export type ConsentLevel = "all" | "necessary" | null;

const STORAGE_KEY = "taracliagaz_cookie_consent";
const EVENT_NAME = "cookie-consent-change";

function readStoredConsent(): ConsentLevel {
    try {
        return (localStorage.getItem(STORAGE_KEY) as ConsentLevel) ?? null;
    } catch {
        return null;
    }
}

export function useCookieConsent() {
    const [consent, setConsentState] = useState<ConsentLevel>(readStoredConsent);

    useEffect(() => {
        const sync = () => setConsentState(readStoredConsent());
        window.addEventListener(EVENT_NAME, sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener(EVENT_NAME, sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    const updateConsent = useCallback((value: ConsentLevel) => {
        try {
            if (value === null) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, value);
            }
        } catch {
            // ignore storage errors
        }
        setConsentState(value);
        window.dispatchEvent(new Event(EVENT_NAME));
    }, []);

    const acceptAll = useCallback(() => updateConsent("all"), [updateConsent]);
    const rejectAll = useCallback(() => updateConsent("necessary"), [updateConsent]);
    const reset = useCallback(() => updateConsent(null), [updateConsent]);

    return {
        consent,
        acceptAll,
        rejectAll,
        reset,
        hasAnalyticsConsent: consent === "all",
        isDecided: consent !== null,
    };
}
