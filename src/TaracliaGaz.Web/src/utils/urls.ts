/**
 * URL-утилиты для работы с API и загрузками.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

// Доверенные домены для внешних ссылок/файлов (whitelist)
const TRUSTED_DOMAINS = [
    "taraclia-gaz.md",
    "www.taraclia-gaz.md",
    "localhost",
    "127.0.0.1",
    // На Google Drive лежат мигрированные документы и тендеры со старого сайта
    "drive.google.com",
    "docs.google.com",
];

/**
 * Преобразует относительный URL загрузки в абсолютный.
 * Принудительно использует HTTPS для внешних URL.
 * Проверяет домен по whitelist для защиты от SSRF.
 */
export function resolveUploadUrl(url: string): string {
    if (!url) return "";

    // Внешние URL — проверяем домен и форсируем HTTPS
    if (url.startsWith("http://") || url.startsWith("https://")) {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname;

            // Проверка whitelist (в production можно строже)
            const isTrusted = TRUSTED_DOMAINS.some(
                (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
            );

            if (!isTrusted) {
                console.warn(`[resolveUploadUrl] Untrusted domain blocked: ${hostname}`);
                return ""; // Возвращаем пустую строку для недоверенных доменов
            }

            // Принудительный HTTPS
            if (parsedUrl.protocol === "http:") {
                parsedUrl.protocol = "https:";
                return parsedUrl.toString();
            }

            return url;
        } catch {
            return url;
        }
    }

    // Относительные URL — добавляем API_ORIGIN
    if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
    // Пути без ведущего слэша ("images/...") — тоже от корня API,
    // иначе браузер относит их к текущему роуту и получает 404
    if (/^(images|uploads|static)\//.test(url)) return `${API_ORIGIN}/${url}`;

    return url;
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