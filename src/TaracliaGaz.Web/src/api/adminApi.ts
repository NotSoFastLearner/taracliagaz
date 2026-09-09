import { http } from "./http";
import type {
    Announcement,
    Document,
    GalleryImage,
    NewsPostDetail,
    Page,
    Tender,
    MenuCategory,
} from "../types/content";

// ===== GALLERY =====
export const getGalleryAdmin = () =>
    http.get<GalleryImage[]>("/admin/gallery"); // ✅ Было /public/gallery

export const createGalleryImage = (data: Omit<GalleryImage, "id" | "createdAt" | "updatedAt">) =>
    http.post<GalleryImage>("/admin/gallery", data);

export const updateGalleryImage = (id: number, data: Partial<GalleryImage>) =>
    http.put<GalleryImage>(`/admin/gallery/${id}`, data);

export const deleteGalleryImage = (id: number) =>
    http.delete<void>(`/admin/gallery/${id}`);

// ===== PAGES =====
export const getPagesAdmin = (lang = "ru") =>
    http.get<Page[]>(`/admin/pages?lang=${lang}`); // ✅ Было /public/pages

export const createPage = (data: Omit<Page, "id" | "createdAt" | "updatedAt">) =>
    http.post<Page>("/admin/pages", data);

export const updatePage = (id: number, data: Partial<Page>) =>
    http.put<Page>(`/admin/pages/${id}`, data);

export const deletePage = (id: number) =>
    http.delete<void>(`/admin/pages/${id}`);

// ===== NEWS =====
export const getNewsAdmin = (lang = "ru") =>
    http.get<NewsPostDetail[]>(`/admin/news?lang=${lang}`); // ✅ Было /public/news

export const createNews = (data: Omit<NewsPostDetail, "id" | "createdAt" | "updatedAt">) =>
    http.post<NewsPostDetail>("/admin/news", data);

export const updateNews = (id: number, data: Partial<NewsPostDetail>) =>
    http.put<NewsPostDetail>(`/admin/news/${id}`, data);

export const deleteNews = (id: number) =>
    http.delete<void>(`/admin/news/${id}`);

// ===== DOCUMENTS =====
export const getDocumentsAdmin = (lang = "ru") =>
    http.get<Document[]>(`/admin/documents?lang=${lang}`); // ✅ Было /public/documents

export const createDocument = (data: Omit<Document, "id" | "createdAt" | "updatedAt">) =>
    http.post<Document>("/admin/documents", data);

export const updateDocument = (id: number, data: Partial<Document>) =>
    http.put<Document>(`/admin/documents/${id}`, data);

export const deleteDocument = (id: number) =>
    http.delete<void>(`/admin/documents/${id}`);

// ===== ANNOUNCEMENTS =====
export const getAnnouncementsAdmin = (lang = "ru") =>
    http.get<Announcement[]>(`/admin/announcements?lang=${lang}`); // ✅ Было /public/announcements

export const createAnnouncement = (data: Omit<Announcement, "id" | "createdAt" | "updatedAt">) =>
    http.post<Announcement>("/admin/announcements", data);

export const updateAnnouncement = (id: number, data: Partial<Announcement>) =>
    http.put<Announcement>(`/admin/announcements/${id}`, data);

export const deleteAnnouncement = (id: number) =>
    http.delete<void>(`/admin/announcements/${id}`);

// ===== TENDERS =====
export const getTendersAdmin = (lang = "ru") =>
    http.get<Tender[]>(`/admin/tenders?lang=${lang}`); // ✅ Было /public/tenders

export const createTender = (data: Omit<Tender, "id" | "createdAt" | "updatedAt">) =>
    http.post<Tender>("/admin/tenders", data);

export const updateTender = (id: number, data: Partial<Tender>) =>
    http.put<Tender>(`/admin/tenders/${id}`, data);

export const deleteTender = (id: number) =>
    http.delete<void>(`/admin/tenders/${id}`);

// ===== MENU =====
export const getMenuAdmin = (lang = "ru") =>
    http.get<MenuCategory[]>(`/admin/menu?lang=${lang}`); // ✅ Было /public/menu

export const createMenuCategory = (data: Omit<MenuCategory, "id" | "createdAt" | "updatedAt">) =>
    http.post<MenuCategory>("/admin/menu", data);

export const updateMenuCategory = (id: number, data: Partial<MenuCategory>) =>
    http.put<MenuCategory>(`/admin/menu/${id}`, data);

export const deleteMenuCategory = (id: number) =>
    http.delete<void>(`/admin/menu/${id}`);