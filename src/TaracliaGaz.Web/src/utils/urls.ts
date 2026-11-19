/**
 * URL-утилиты для работы с API и загрузками.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

// Домены, для которых принудительно переключаем http -> https
const FORCE_HTTPS_DOMAINS = ["taraclia-gaz.md", "www.taraclia-gaz.md"];

/**
 * Преобразует относительный URL загрузки в абсолютный.
 * Принудительно использует HTTPS для собственного домена и пропускает валидные внешние http/https URL.
 */
export function resolveUploadUrl(rawUrl: string): string {
    if (!rawUrl) return "";
    const url = rawUrl.trim().replace(/&amp;/gi, "&");

    // Внешние URL — валидируем синтаксис через URL и форсируем HTTPS для своего домена
    if (/^https?:\/\//i.test(url)) {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
                return "";
            }
            if (
                parsedUrl.protocol === "http:" &&
                FORCE_HTTPS_DOMAINS.includes(parsedUrl.hostname.toLowerCase())
            ) {
                parsedUrl.protocol = "https:";
                return parsedUrl.toString();
            }

            return url;
        } catch {
            return "";
        }
    }

    // Защита от protocol-relative URL (//evil.com)
    if (url.startsWith("//")) return "";

    // Относительные URL — добавляем API_ORIGIN
    if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
    // Пути без ведущего слэша ("images/...") — тоже от корня API,
    // иначе браузер относит их к текущему роуту и получает 404
    if (/^(images|uploads|static)\//.test(url)) return `${API_ORIGIN}/${url}`;

    return "";
}

/**
 * Возвращает origin API-сервера (без /api)
 */
export function getApiOrigin(): string {
    return API_ORIGIN;
}

/**
 * URL миниатюры для изображений JoomGallery.
 * Полные версии лежат в .../joomgallery/details/..., миниатюры —
 * в .../joomgallery/thumbnails/... с тем же именем файла.
 * Если путь не из JoomGallery — возвращает исходный URL.
 */
export function resolveThumbnailUrl(url: string): string {
    if (!url) return "";
    const thumb = url.replace("/joomgallery/details/", "/joomgallery/thumbnails/");
    return resolveUploadUrl(thumb);
}