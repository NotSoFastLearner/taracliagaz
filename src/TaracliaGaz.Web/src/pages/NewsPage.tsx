import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../api/contentApi";
import type { NewsPostSummary } from "../types/content";
import SEO from "../components/SEO";

export default function NewsPage() {
    const [news, setNews] = useState<NewsPostSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getNews()
            .then(setNews)
            .catch((err) => {
                setError("Не удалось загрузить новости");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric",
            });
        } catch { return iso; }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <>
            <SEO
                title="Новости"
                description="Последние новости SRL «Taraclia Gaz». Информация о работе компании, важные объявления для потребителей природного газа в Тараклийском районе."
                path="/news"
            />

            <section className="section">
                <div className="container">
                    <h1>📰 Новости</h1>

                    {news.length === 0 ? (
                        <p>Новостей пока нет</p>
                    ) : (
                        <div className="news-grid">
                            {news.map((post) => (
                                <article key={post.id} className="news-card">
                                    <h2>
                                        <Link to={`/news/${post.id}`}>{post.title}</Link>
                                    </h2>
                                    <small>📅 {formatDate(post.publishedAt)}</small>
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