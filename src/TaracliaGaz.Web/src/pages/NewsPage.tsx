import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../api/contentApi";
import type { NewsPostSummary } from "../types/content";
import SEO from "../components/SEO";
import { IconNews, IconCalendar } from "../components/icons";

export default function NewsPage() {
    const [news, setNews] = useState<NewsPostSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNews().then(setNews).catch(console.error).finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric",
            });
        } catch { return iso; }
    };

    return (
        <>
            <SEO title="Новости" description="Новости и события SRL «Taraclia Gaz»" path="/news" />
            <section className="section">
                <div className="container">
                    <h1><IconNews width={32} height={32} /> Новости</h1>
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : news.length === 0 ? (
                        <p>Новостей пока нет</p>
                    ) : (
                        <div className="news-grid">
                            {news.map((post) => (
                                <article key={post.id} className="news-card">
                                    <h3><Link to={`/news/${post.id}`}>{post.title}</Link></h3>
                                    <small><IconCalendar /> {formatDate(post.publishedAt)}</small>
                                    <p>{post.summary}</p>
                                    <Link to={`/news/${post.id}`} className="read-more">
                                        Читать далее →
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}