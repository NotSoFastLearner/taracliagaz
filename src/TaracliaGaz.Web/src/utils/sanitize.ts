import DOMPurify from "dompurify";
import { resolveUploadUrl } from "./urls";

/**
 * Санитизация HTML для защиты от XSS.
 * Разрешает только безопасные теги и атрибуты.
 */

// iframe разрешён только для доверенных видео-хостингов (страница
// «Видео-инструкция» — embeds YouTube, мигрированные с Joomla).
// Всё остальное (произвольные src, javascript: и т.п.) вырезается.
const TRUSTED_IFRAME_SRC = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i;
const RELATIVE_MEDIA_RE = /^\/?(images|uploads|static)\//i;

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    const el = node as Element;
    if (data.tagName === "iframe") {
        const src = el.getAttribute("src") ?? "";
        if (!TRUSTED_IFRAME_SRC.test(src)) {
            el.remove();
        }
    } else if (data.tagName === "img") {
        const src = el.getAttribute("src");
        if (src && RELATIVE_MEDIA_RE.test(src)) {
            const resolved = resolveUploadUrl(src);
            if (resolved) el.setAttribute("src", resolved);
        }
    } else if (data.tagName === "a") {
        const href = el.getAttribute("href");
        if (href && RELATIVE_MEDIA_RE.test(href)) {
            const resolved = resolveUploadUrl(href);
            if (resolved) el.setAttribute("href", resolved);
        }
    }
});

/**
 * Конвертирует legacy-шорткоды Joomla (плагин spoiler) из мигрированного
 * контента в семантический HTML <details>/<summary> — работает без JS.
 * {spoiler title=Текст opened=1}...{/spoiler}
 *   → <details open><summary>Текст</summary>...</details>
 */
function convertLegacyShortcodes(html: string): string {
    return html.replace(
        /\{spoiler\s+([^}]*)\}([\s\S]*?)\{\/spoiler\}/g,
        (_match, attrs: string, content: string) => {
            const titleMatch = attrs.match(/title=(.*?)(?:\s+opened=\d)?\s*$/);
            const title = (titleMatch?.[1] ?? "").trim();
            const isOpen = /\bopened=1\b/.test(attrs);
            return `<details class="spoiler-accordion"${isOpen ? " open" : ""}>` +
                `<summary>${title}</summary>${content}</details>`;
        }
    );
}

/**
 * Нормализация инлайн-размеров шрифта в мигрированном контенте:
 * редактор Joomla/Word сохранял значения в pt (48pt = 64px — гигантский
 * текст, на мобильном нечитаемо). Конвертируем pt→px и ограничиваем 36px.
 */
function normalizeInlineFontSize(html: string): string {
    return html.replace(
        /font-size:\s*([0-9.]+)\s*(pt|px)/gi,
        (_m, v: string, unit: string) => {
            let px = unit.toLowerCase() === "pt"
                ? parseFloat(v) * (96 / 72)
                : parseFloat(v);
            if (!Number.isFinite(px)) return "font-size: inherit";
            if (px > 36) px = 36;
            return `font-size: ${Math.round(px * 100) / 100}px`;
        }
    );
}

export function sanitizeHtml(dirty: string): string {
    if (!dirty) return "";

    return DOMPurify.sanitize(
        normalizeInlineFontSize(convertLegacyShortcodes(dirty)), {
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
            // Аккордеоны из legacy-шорткодов Joomla ({spoiler...} → convertLegacyShortcodes)
            "details", "summary",
            // YouTube-embeds (только доверенный src — см. хук выше)
            "iframe",
        ],
        ALLOWED_ATTR: [
            "href", "title", "target", "rel",
            "src", "alt", "width", "height",
            "class", "id",
            // Инлайн-стили мигрированного контента (редактируют только админы)
            "style", "colspan", "rowspan",
            // Аккордеон: открытое состояние <details open>
            "open",
            // Атрибуты iframe для видео
            "allowfullscreen", "frameborder", "allow", "loading",
        ],
        ADD_ATTR: ["target"],
        ALLOW_DATA_ATTR: false,
    });
}
