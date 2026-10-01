import { useLocation } from "react-router-dom";
import { getPage } from "../api/contentApi";
import SEO from "../components/SEO";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";
import { useCachedFetch } from "../hooks/useCachedFetch";

export default function StaticPage() {
    const location = useLocation();
    const { language, t } = useLanguage();

    // Извлекаем последний сегмент URL как slug
    // Например: /page/about/istoriya -> istoriya
    const pathParts = location.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1] ?? "";

    // SWR: мгновенный показ из localStorage, свежие данные подтягиваются в фоне
    const { data: page, loading, error } = useCachedFetch(
        `page:${slug}:${language}`,
        () => getPage(slug, language),
        [slug, language]
    );

    if (loading) return <p>{t('common.loading')}</p>;
    if (error) return <p className="error">{t('static.loadError')}</p>;
    if (!page) return <p>{t('static.notFound')}</p>;

    const plainText = page.bodyHtml.replace(/<[^>]*>/g, "").trim();
    const description =
        plainText.length > 160
            ? plainText.slice(0, 157) + "..."
            : plainText || page.title;

    return (
        <>
            <SEO
                title={page.title}
                description={description}
                path={`/page/${page.slug}`}
            />
            <section className="section">
                <div className="container">
                    <h1>{page.title}</h1>
                    {/* Дата обновления для важных страниц */}
                    {["tariffs", "contracts", "legislation", "safety", "services"].includes(page.slug) && page.updatedAt && (
                        <div className="page-updated">
                            {t('common.updated')}: {new Date(page.updatedAt).toLocaleDateString(dateLocale(language), {
                                day: "2-digit", month: "long", year: "numeric",
                            })}
                        </div>
                    )}
                    <div
                        className="content-body"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.bodyHtml) }}
                    />
                </div>
            </section>
        </>
    );
}
