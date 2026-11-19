import { prefetchCache } from "../hooks/useCachedFetch";
import {
    getAnnouncements,
    getDocuments,
    getGallery,
    getNews,
    getPage,
    getTenders,
} from "../api/contentApi";

const pageChunks: Record<string, () => Promise<unknown>> = {
    "/news": () => import("../pages/NewsPage"),
    "/announcements": () => import("../pages/AnnouncementsPage"),
    "/tenders": () => import("../pages/TendersPage"),
    "/gallery": () => import("../pages/GalleryPage"),
    "/contacts": () => import("../pages/ContactsPage"),
    "/transparency": () => import("../pages/TransparencyPage"),
};

/**
 * Предзагрузка при наведении / фокусе / касании:
 * прогревает JS-чанк страницы и её данные в SWR-кэш.
 */
export function prefetchForPath(path: string, language: string): void {
    if (!path || path === "#") return;

    if (path.startsWith("/page/")) {
        void import("../pages/StaticPage");
        const slug = path.split("/").filter(Boolean).pop() ?? "";
        if (slug) {
            prefetchCache(`page:${slug}:${language}`, () => getPage(slug, language));
        }
        return;
    }

    if (path.startsWith("/news/")) {
        void import("../pages/NewsDetailPage");
        return;
    }

    if (path.startsWith("/tenders/")) {
        void import("../pages/TenderDetailPage");
        return;
    }

    const basePath = path.startsWith("/transparency") ? "/transparency" : path;
    void pageChunks[basePath]?.();

    if (basePath === "/news") {
        prefetchCache(`news:${language}`, () => getNews(language));
    } else if (basePath === "/announcements") {
        prefetchCache(`announcements:${language}`, () => getAnnouncements(language));
    } else if (basePath === "/tenders") {
        prefetchCache(`tenders:${language}`, () => getTenders(language));
    } else if (basePath === "/gallery") {
        prefetchCache("gallery", () => getGallery());
    } else if (basePath === "/transparency") {
        prefetchCache(`documents:${language}`, () => getDocuments(undefined, language));
    }
}

export function prefetchProps(path: string, language: string) {
    const run = () => prefetchForPath(path, language);
    return {
        onMouseEnter: run,
        onFocus: run,
        onTouchStart: run,
    };
}
