import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPage } from "../api/contentApi";
import type { Page } from "../types/content";
import SEO from "../components/SEO";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function StaticPage() {
    const location = useLocation();
    const { language, t } = useLanguage();
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Извлекаем последний сегмент URL как slug
        // Например: /page/about/istoriya -> istoriya
        const pathParts = location.pathname.split('/').filter(Boolean);
        const slug = pathParts[pathParts.length - 1];

        if (!slug) return;

        setLoading(true);
        setError(null);

        getPage(slug, language)
            .then(setPage)
            .catch(() => setError(t('static.loadError')))
            .finally(() => setLoading(false));
    }, [location.pathname, language, t]);

    if (loading) return <p>{t('common.loading')}</p>;
    if (error) return <p className="error">{error}</p>;
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
