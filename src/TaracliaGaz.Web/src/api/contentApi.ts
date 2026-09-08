import { http } from "./http";
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

export const getPage = (slug: string, lang = DEFAULT_LANG) =>
    http.get<Page>(`/public/pages/${slug}?lang=${lang}`);

export const getNews = (lang = DEFAULT_LANG) =>
    http.get<NewsPostSummary[]>(`/public/news?lang=${lang}`);

export const getNewsById = (id: string | number, lang = DEFAULT_LANG) =>
    http.get<NewsPostDetail>(`/public/news/${id}?lang=${lang}`);

export const getAnnouncements = (lang = DEFAULT_LANG) =>
    http.get<Announcement[]>(`/public/announcements?lang=${lang}`);

export const getTenders = (lang = DEFAULT_LANG) =>
    http.get<Tender[]>(`/public/tenders?lang=${lang}`);

export const getDocuments = (categorySlug?: string, lang = DEFAULT_LANG) => {
    let url = `/public/documents?lang=${lang}`;
    if (categorySlug) url += `&category_slug=${categorySlug}`;
    return http.get<Document[]>(url);
};

export const getGallery = () =>
    http.get<GalleryImage[]>(`/public/gallery`);

export const getMenu = (lang = DEFAULT_LANG) =>
    http.get<MenuCategory[]>(`/public/menu?lang=${lang}`);

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