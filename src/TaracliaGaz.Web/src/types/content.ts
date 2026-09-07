export interface BaseContent {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface Page extends BaseContent {
    slug: string;
    title: string;
    bodyHtml: string;
    languageCode: string;
    isPublished: boolean;
}

export interface NewsPostSummary extends BaseContent {
    title: string;
    summary: string;
    publishedAt: string;
    languageCode: string;
    isPublished: boolean;
}

export interface NewsPostDetail extends NewsPostSummary {
    bodyHtml: string;
}

export interface Announcement extends BaseContent {
    title: string;
    bodyHtml: string;
    publishedAt: string;
    isPinned: boolean;
    languageCode: string;
    isPublished: boolean;
}

export interface Tender extends BaseContent {
    title: string;
    bodyHtml: string;
    publishedAt: string;
    deadlineAt: string | null;
    documentUrl: string | null;
    externalUrl: string | null;  
    languageCode: string;
    isPublished: boolean;
}
export interface Document extends BaseContent {
    title: string;
    categorySlug: string;
    fileUrl: string;
    publishedAt: string;
    languageCode: string;
    isPublished: boolean;
}

export interface GalleryImage extends BaseContent {
    caption: string;
    imageUrl: string;
    sortOrder: number;
    isPublished: boolean;
}

export interface MenuCategory {
    id: number;
    title: string;
    slug: string;
    parentId: number | null;
    order: number;
    languageCode: string;
    createdAt: string;
    updatedAt: string;
}