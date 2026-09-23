import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getNewsById } from "../api/contentApi";
import type { NewsPostDetail } from "../types/content";
import SEO from "../components/SEO";
import { IconCalendar } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { language, t } = useLanguage();
    const [post, setPost] = useState<NewsPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        getNewsById(parseInt(id))
            .then((item) => {
                setPost(item);
            })
            .catch(() => setError(t('news.notFound')))
            .finally(() => setLoading(false));
    }, [id, t]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language), {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    if (loading) return <p>{t('common.loading')}</p>;
    if (error || !post) return <p className="error">{error || t('news.notFound')}</p>;

    return (
        <>
            <SEO title={post.title} description={post.summary} path={`/news/${post.id}`} />
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
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.bodyHtml) }}
                        />
                    </article>
                </div>
            </section>
        </>
    );
}
