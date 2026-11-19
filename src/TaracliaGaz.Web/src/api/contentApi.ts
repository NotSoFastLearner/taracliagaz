import { http } from "./http";
import { prefetchCache, readCache, writeCache } from "../hooks/useCachedFetch";
import type {
    Announcement,
    Document,
    GalleryImage,
    MenuCategory,
    NewsPostDetail,
    NewsPostSummary,
    Page,
    Tender,
} from "../types/content";

const DEFAULT_LANG = "ru";

export interface BootstrapData {
    menu: MenuCategory[];
    announcements: Announcement[];
    news: NewsPostSummary[];
    gallery: GalleryImage[];
}

declare global {
    interface Window {
        __TG_BOOTSTRAP__?: {
            lang: string;
            promise: Promise<BootstrapData | null>;
        };
    }
}

const inFlightBootstrap = new Map<string, Promise<BootstrapData>>();

const cacheNewsItems = (items: NewsPostSummary[]) => {
    for (const item of items) {
        if (item.bodyHtml) {
            writeCache(`news-item:${item.id}`, item);
        }
    }
};

const cacheTenderItems = (items: Tender[]) => {
    for (const item of items) {
        writeCache(`tender-item:${item.id}`, item);
    }
};

export const getBootstrap = (lang = DEFAULT_LANG): Promise<BootstrapData> => {
    const existing = inFlightBootstrap.get(lang);
    if (existing) return existing;

    let rawPromise: Promise<BootstrapData> | null = null;
    if (typeof window !== "undefined" && window.__TG_BOOTSTRAP__?.lang === lang) {
        const early = window.__TG_BOOTSTRAP__.promise;
        delete window.__TG_BOOTSTRAP__;
        rawPromise = early.then(
            (data) => data ?? http.get<BootstrapData>(`/public/bootstrap?lang=${lang}`)
        );
    }

    const promise = (rawPromise ?? http.get<BootstrapData>(`/public/bootstrap?lang=${lang}`))
        .then((data) => {
            writeCache(`bootstrap:${lang}`, data);
            writeCache(`menu:${lang}`, data.menu);
            writeCache(`announcements:home:${lang}`, data.announcements);
            writeCache(`news:${lang}`, data.news);
            cacheNewsItems(data.news);
            writeCache("gallery:home", data.gallery);
            return data;
        })
        .finally(() => {
            inFlightBootstrap.delete(lang);
        });
    inFlightBootstrap.set(lang, promise);
    return promise;
};

if (typeof window !== "undefined" && window.__TG_BOOTSTRAP__) {
    void getBootstrap(window.__TG_BOOTSTRAP__.lang);
}

export const getPage = (slug: string, lang = DEFAULT_LANG) =>
    http.get<Page>(`/public/pages/${slug}?lang=${lang}`);

export const getPages = (lang = DEFAULT_LANG): Promise<Page[]> =>
    http.get<Page[]>(`/public/pages?lang=${lang}`).then((pages) => {
        for (const p of pages) {
            writeCache(`page:${p.slug}:${lang}`, p);
        }
        return pages;
    });

export const prefetchAllPages = (lang = DEFAULT_LANG): void => {
    prefetchCache(`page:all:${lang}`, () => getPages(lang).then(() => true));
};

export const getNews = (lang = DEFAULT_LANG) => {
    const pending = inFlightBootstrap.get(lang);
    const promise = pending
        ? pending.then((d) => d.news)
        : http.get<NewsPostSummary[]>(`/public/news?lang=${lang}`);
    return promise.then((items) => {
        cacheNewsItems(items);
        return items;
    });
};

export const getAnnouncements = (lang = DEFAULT_LANG, limit?: number) => {
    if (limit !== undefined) {
        if (limit <= 3) {
            return getBootstrap(lang).then((d) => d.announcements.slice(0, limit));
        }
        return http.get<Announcement[]>(`/public/announcements?lang=${lang}&limit=${limit}`);
    }
    return http.get<Announcement[]>(`/public/announcements?lang=${lang}`);
};

export const getTenders = (lang = DEFAULT_LANG) =>
    http.get<Tender[]>(`/public/tenders?lang=${lang}`).then((items) => {
        cacheTenderItems(items);
        return items;
    });

export const getDocuments = (categorySlug?: string, lang = DEFAULT_LANG) => {
    let url = `/public/documents?lang=${lang}`;
    if (categorySlug) url += `&category_slug=${categorySlug}`;
    return http.get<Document[]>(url);
};

export const getGallery = (limit?: number) => {
    if (limit !== undefined) {
        const pending = inFlightBootstrap.values().next().value;
        if (pending && limit <= 6) {
            return pending.then((d) => d.gallery.slice(0, limit));
        }
        return http.get<GalleryImage[]>(`/public/gallery?limit=${limit}`);
    }
    return http.get<GalleryImage[]>(`/public/gallery`);
};

export const getMenu = (lang = DEFAULT_LANG) =>
    getBootstrap(lang).then((d) => d.menu);

// ===== CONTACTS =====
export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
    websiteUrl?: string;  // honeypot
}

export const submitContact = async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    return http.post<{ success: boolean; message: string }>("/public/contact", data);
};

// ============ DETAIL ENDPOINTS ============
export const getNewsById = (id: number, lang = DEFAULT_LANG) => {
    const cached = readCache<NewsPostDetail[]>(`news:${lang}`)?.find(
        (n) => n.id === id && n.bodyHtml
    );
    if (cached) {
        writeCache(`news-item:${id}`, cached);
    }
    return http.get<NewsPostDetail>(`/public/news/${id}`);
};

export const getTenderById = (id: number, lang = DEFAULT_LANG) => {
    const cached = readCache<Tender[]>(`tenders:${lang}`)?.find((t) => t.id === id);
    if (cached) {
        writeCache(`tender-item:${id}`, cached);
    }
    return http.get<Tender>(`/public/tenders/${id}`);
};

// ===== SEARCH =====
export interface SearchResultItem {
    type: string;
    id: number;
    title: string;
    snippet: string;
    url: string;
}

export const searchSite = (q: string, lang = DEFAULT_LANG) =>
    http.get<SearchResultItem[]>(`/public/search?q=${encodeURIComponent(q)}&lang=${lang}`);
