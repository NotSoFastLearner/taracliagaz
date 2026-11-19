import { http } from "./http";
import { invalidateCache } from "../hooks/useCachedFetch";
import type {
    Announcement,
    Document,
    GalleryImage,
    NewsPostDetail,
    Page,
    Tender,
    MenuCategory,
} from "../types/content";

const invalidateAfter = <T>(prefix: string, promise: Promise<T>): Promise<T> =>
    promise.then((res) => {
        invalidateCache(prefix);
        return res;
    });

// ===== GALLERY =====
export const getGalleryAdmin = () =>
    http.get<GalleryImage[]>("/admin/gallery");

export const createGalleryImage = (data: Omit<GalleryImage, "id" | "createdAt" | "updatedAt">) =>
    invalidateAfter("gallery", http.post<GalleryImage>("/admin/gallery", data));

export const updateGalleryImage = (id: number, data: Partial<GalleryImage>) =>
    invalidateAfter("gallery", http.put<GalleryImage>(`/admin/gallery/${id}`, data));

export const deleteGalleryImage = (id: number) =>
    invalidateAfter("gallery", http.delete<void>(`/admin/gallery/${id}`));

// ===== PAGES =====
export const getPagesAdmin = (lang?: string) =>
    http.get<Page[]>(lang ? `/admin/pages?lang=${lang}` : "/admin/pages");

export const createPage = (data: Omit<Page, "id" | "createdAt" | "updatedAt">) =>
    invalidateAfter("page:", http.post<Page>("/admin/pages", data));

export const updatePage = (id: number, data: Partial<Page>) =>
    invalidateAfter("page:", http.put<Page>(`/admin/pages/${id}`, data));

export const deletePage = (id: number) =>
    invalidateAfter("page:", http.delete<void>(`/admin/pages/${id}`));

// ===== NEWS =====
export const getNewsAdmin = (lang?: string) =>
    http.get<NewsPostDetail[]>(lang ? `/admin/news?lang=${lang}` : "/admin/news");

export const createNews = (data: Omit<NewsPostDetail, "id" | "createdAt" | "updatedAt">) =>
    invalidateAfter("news", http.post<NewsPostDetail>("/admin/news", data));

export const updateNews = (id: number, data: Partial<NewsPostDetail>) =>
    invalidateAfter("news", http.put<NewsPostDetail>(`/admin/news/${id}`, data));

export const deleteNews = (id: number) =>
    invalidateAfter("news", http.delete<void>(`/admin/news/${id}`));

// ===== DOCUMENTS =====
export const getDocumentsAdmin = (lang?: string) =>
    http.get<Document[]>(lang ? `/admin/documents?lang=${lang}` : "/admin/documents");

export const createDocument = (data: Omit<Document, "id" | "createdAt" | "updatedAt">) =>
    invalidateAfter("documents:", http.post<Document>("/admin/documents", data));

export const updateDocument = (id: number, data: Partial<Document>) =>
    invalidateAfter("documents:", http.put<Document>(`/admin/documents/${id}`, data));

export const deleteDocument = (id: number) =>
    invalidateAfter("documents:", http.delete<void>(`/admin/documents/${id}`));

// ===== ANNOUNCEMENTS =====
export const getAnnouncementsAdmin = (lang?: string) =>
    http.get<Announcement[]>(lang ? `/admin/announcements?lang=${lang}` : "/admin/announcements");

export const createAnnouncement = (data: Omit<Announcement, "id" | "createdAt" | "updatedAt">) =>
    invalidateAfter("announcements:", http.post<Announcement>("/admin/announcements", data));

export const updateAnnouncement = (id: number, data: Partial<Announcement>) =>
    invalidateAfter("announcements:", http.put<Announcement>(`/admin/announcements/${id}`, data));

export const deleteAnnouncement = (id: number) =>
    invalidateAfter("announcements:", http.delete<void>(`/admin/announcements/${id}`));

// ===== TENDERS =====
export const getTendersAdmin = (lang?: string) =>
    http.get<Tender[]>(lang ? `/admin/tenders?lang=${lang}` : "/admin/tenders");

export const createTender = (data: Omit<Tender, "id" | "createdAt" | "updatedAt">) =>
    invalidateAfter("tender", http.post<Tender>("/admin/tenders", data));

export const updateTender = (id: number, data: Partial<Tender>) =>
    invalidateAfter("tender", http.put<Tender>(`/admin/tenders/${id}`, data));

export const deleteTender = (id: number) =>
    invalidateAfter("tender", http.delete<void>(`/admin/tenders/${id}`));

// ===== MENU =====
export const getMenuAdmin = (lang = "ru") =>
    http.get<MenuCategory[]>(`/admin/menu?lang=${lang}`);

export const createMenuCategory = (data: Omit<MenuCategory, "id" | "createdAt" | "updatedAt">) =>
    invalidateAfter("menu:", http.post<MenuCategory>("/admin/menu", data));

export const updateMenuCategory = (id: number, data: Partial<MenuCategory>) =>
    invalidateAfter("menu:", http.put<MenuCategory>(`/admin/menu/${id}`, data));

export const deleteMenuCategory = (id: number) =>
    invalidateAfter("menu:", http.delete<void>(`/admin/menu/${id}`));

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    ipAddress: string | null;
    userAgent: string | null;
    isRead: boolean;
    isSpam: boolean;
    createdAt: string;
}

export const getContactsAdmin = (unreadOnly = false) =>
    http.get<ContactMessage[]>(
        `/admin/contacts?unread_only=${unreadOnly}`
    );

export const markContactRead = (id: number) =>
    http.patch<{ success: boolean }>(`/admin/contacts/${id}/read`);

export const deleteContact = (id: number) =>
    http.delete<void>(`/admin/contacts/${id}`);

export const downloadDatabaseBackup = async (): Promise<void> => {
    const token = localStorage.getItem("taracliagaz_auth");
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
    const res = await fetch(`${baseUrl}/admin/backup`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.status === 401) {
        localStorage.removeItem("taracliagaz_auth");
        window.location.href = "/admin/login";
        throw new Error("Сессия истекла. Войдите снова.");
    }
    if (!res.ok) {
        throw new Error("Ошибка скачивания резервной копии БД");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taracliagaz-backup-${new Date().toISOString().slice(0, 10)}.db`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};