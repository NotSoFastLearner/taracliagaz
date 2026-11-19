import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from '../components/Header';
import Footer from "../components/Footer";
import Analytics from "../components/Analytics";
import LocalBusinessSchema from "../components/LocalBusinessSchema";
import { useLanguage } from "../context/LanguageContext";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { getAnnouncements, getMenu, prefetchAllPages } from "../api/contentApi";
import { buildMenuTree } from "../utils/menuHelpers";
import { useCachedFetch } from "../hooks/useCachedFetch";
import type { MenuItem } from "../types/content";

const FeedbackButton = lazy(() => import("../components/FeedbackButton"));
const CookieBanner = lazy(() => import("../components/CookieBanner"));

export interface SiteOutletContext {
    languageCode: string;
}

export default function Layout() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

    const { language, t } = useLanguage();
    const { isDecided } = useCookieConsent();
    const [dismissedId, setDismissedId] = useState<number | null>(null);
    const isAdmin = pathname.startsWith("/admin");
    const hideFeedback = isAdmin || pathname === "/contacts";

    useEffect(() => {
        if (isAdmin) return;
        const warm = () => {
            void import("./StaticPage");
            prefetchAllPages(language);
        };
        const w = window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        };
        if (typeof w.requestIdleCallback === "function") {
            const id = w.requestIdleCallback(warm, { timeout: 1500 });
            return () => w.cancelIdleCallback?.(id);
        }
        const timer = window.setTimeout(warm, 800);
        return () => window.clearTimeout(timer);
    }, [language, isAdmin]);

    // SWR-кэш: меню рисуется мгновенно из localStorage при повторном
    // визите, свежая версия подгружается в фоне
    const { data: menuData } = useCachedFetch(
        `menu:${language}`,
        () => getMenu(language),
        [language]
    );
    const { data: announcementsData } = useCachedFetch(
        `announcements:home:${language}`,
        () => getAnnouncements(language, 3),
        [language]
    );
    const pinned = useMemo(
        () => (announcementsData ?? []).find((a) => a.isPinned),
        [announcementsData]
    );
    const menuItems = useMemo<MenuItem[]>(
        () => (menuData ? buildMenuTree(menuData) : []),
        [menuData]
    );

    const context: SiteOutletContext = { languageCode: language };

    return (
        <div className="site">
            <a href="#main-content" className="skip-link">
                {t('common.skipLink')}
            </a>

            {pinned && dismissedId !== pinned.id && (
                <div
                    role="region"
                    aria-label={t('banner.important')}
                    style={{
                        background: "linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%)",
                        color: "#fff",
                        padding: "8px 16px",
                        fontSize: "0.92rem",
                    }}
                >
                    <div
                        className="container"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <strong
                                style={{
                                    background: "rgba(0,0,0,0.2)",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "0.8rem",
                                    textTransform: "uppercase",
                                }}
                            >
                                ⚠️ {t('banner.important')}
                            </strong>
                            <span>{pinned.title}</span>
                            <Link
                                to="/announcements"
                                style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}
                            >
                                {t('banner.details')}
                            </Link>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDismissedId(pinned.id)}
                            aria-label={t('close')}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "1.1rem",
                                lineHeight: 1,
                                padding: "4px 8px",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <Header menuItems={menuItems} />
            <LocalBusinessSchema />
            <Analytics />

            <main id="main-content" className="site-main" tabIndex={-1}>
                <Outlet context={context} />
            </main>

            <Footer />
            {!hideFeedback && (
                <Suspense fallback={null}>
                    <FeedbackButton aboveCookieBanner={!isDecided} />
                </Suspense>
            )}
            {!isDecided && (
                <Suspense fallback={null}>
                    <CookieBanner />
                </Suspense>
            )}
        </div>
    );
}
