import { useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getNewsById } from "../api/contentApi";
import type { NewsPostDetail } from "../types/content";
import SEO from "../components/SEO";
import { IconCalendar } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";
import { readCache, useCachedFetch, writeCache } from "../hooks/useCachedFetch";

export default function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const numericId = Number(id);

    const cachedList = readCache<NewsPostDetail[]>(`news:${language}`);
    const listMatch = cachedList?.find((n) => n.id === numericId && n.bodyHtml);
    if (listMatch && !readCache<NewsPostDetail>(`news-item:${numericId}`)) {
        writeCache(`news-item:${numericId}`, listMatch);
    }

    const { data: post, loading, error } = useCachedFetch(
        `news-item:${numericId}`,
        () => getNewsById(numericId, language)
    );

    useEffect(() => {
        if (post && post.languageCode && post.languageCode !== language) {
            navigate("/news", { replace: true });
        }
    }, [post, language, navigate]);

    const safeHtml = useMemo(() => (post ? sanitizeHtml(post.bodyHtml) : ""), [post]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language), {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    if (loading) return <p>{t('common.loading')}</p>;
    if (error || !post) return <p className="error">{t('news.notFound')}</p>;

    return (
        <>
            <SEO title={post.title} description={post.summary} path={`/news/${post.id}`} singleLang />
            <section className="section">
                <div className="container">
                    <Link to="/news" className="back-link">{t('news.backAll')}</Link>
                    <article className="news-detail">
                        <h1>{post.title}</h1>
                        <div className="news-meta">
                            <small><IconCalendar /> {formatDate(post.publishedAt)}</small>
                        </div>
                        <div
                            className="content-body"
                            dangerouslySetInnerHTML={{ __html: safeHtml }}
                        />
                    </article>
                </div>
            </section>
        </>
    );
}
