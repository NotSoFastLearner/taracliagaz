import DOMPurify from "dompurify";

/**
 * Санитизация HTML для защиты от XSS.
 * Разрешает только безопасные теги и атрибуты.
 */

// iframe разрешён только для доверенных видео-хостингов (страница
// «Видео-инструкция» — embeds YouTube, мигрированные с Joomla).
// Всё остальное (произвольные src, javascript: и т.п.) вырезается.
const TRUSTED_IFRAME_SRC = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i;

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe") {
        const el = node as Element;
        const src = el.getAttribute("src") ?? "";
        if (!TRUSTED_IFRAME_SRC.test(src)) {
            el.remove();
        }
    }
});

export function sanitizeHtml(dirty: string): string {
    if (!dirty) return "";

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "s", "b", "i",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li",
            "a", "blockquote", "code", "pre",
            "img", "hr", "div", "span",
            // Таблицы и figure — мигрированный контент Joomla
            "table", "thead", "tbody", "tfoot", "tr", "th", "td",
            "caption", "colgroup", "col",
            "figure", "figcaption",
            // YouTube-embeds (только доверенный src — см. хук выше)
            "iframe",
        ],
        ALLOWED_ATTR: [
            "href", "title", "target", "rel",
            "src", "alt", "width", "height",
            "class", "id",
            // Инлайн-стили мигрированного контента (редактируют только админы)
            "style", "colspan", "rowspan",
            // Атрибуты iframe для видео
            "allowfullscreen", "frameborder", "allow", "loading",
        ],
        ADD_ATTR: ["target"],
        ALLOW_DATA_ATTR: false,
    });
}
