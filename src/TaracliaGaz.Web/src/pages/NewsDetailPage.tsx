import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getNews } from "../api/contentApi";
import type { NewsPost } from "../types/content";
import SEO from "../components/SEO";
import { IconCalendar } from "../components/icons";

export default function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<NewsPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getNews()
            .then((items) => {
                const found = items.find((p) => p.id === parseInt(id));
                if (found) setPost(found);
                else setError("Новость не найдена");
            })
            .catch(() => setError("Ошибка загрузки"))
            .finally(() => setLoading(false));
    }, [id]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error || !post) return <p className="error">{error || "Новость не найдена"}</p>;

    return (
        <>
            <SEO title={post.title} description={post.summary} path={`/news/${post.id}`} />
            <section className="section">
                <div className="container">
                    <Link to="/news" className="back-link">← Все новости</Link>
                    <article className="news-detail">
                        <h1>{post.title}</h1>
                        <div className="news-meta">
                            <small><IconCalendar /> {formatDate(post.publishedAt)}</small>
                        </div>
                        <div className="content-body" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
                    </article>
                </div>
            </section>
        </>
    );
}