const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export function resolveUploadUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads/")) return `${API_ORIGIN}${url}`;
    if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
    return url;
}

export function getApiOrigin(): string {
    return API_ORIGIN;
}