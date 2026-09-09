import DOMPurify from "dompurify";

/**
 * Санитизация HTML для защиты от XSS.
 * Разрешает только безопасные теги и атрибуты.
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty) return "";

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "s",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li",
            "a", "blockquote", "code", "pre",
            "img", "hr", "div", "span",
        ],
        ALLOWED_ATTR: [
            "href", "title", "target", "rel",
            "src", "alt", "width", "height",
            "class", "id",
        ],
        ADD_ATTR: ["target"],
        ALLOW_DATA_ATTR: false,
    });
}