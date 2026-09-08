import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews, getAnnouncements, getGallery } from "../api/contentApi";
import type { NewsPostSummary, Announcement, GalleryImage } from "../types/content";
import SEO from "../components/SEO";

export default function HomePage() {
    const [news, setNews] = useState<NewsPostSummary[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);

    useEffect(() => {
        getNews().then(setNews).catch(console.error);
        getAnnouncements().then(setAnnouncements).catch(console.error);
        getGallery().then(setGallery).catch(console.error);
    }, []);

    const getImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("/uploads/")) return `http://localhost:8000${url}`;
        return url;
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric",
            });
        } catch { return iso; }
    };

    return (
        <>
            <SEO
                title="Главная"
                description="SRL «Taraclia Gaz» — поставка природного газа в Тараклийском районе Молдовы. Актуальные тарифы, новости, объявления, тендеры. Аварийная служба 24/7: 904"
                path="/"
            />

            {/* Hero-блок */}
            <section className="hero">
                <div className="container">
                    <h1>Тараклия-ГАЗ</h1>
                    <p>Надёжный поставщик природного газа с 1990-х годов</p>
                    <div className="hero-actions">
                        <a href="tel:904" className="btn btn-primary">Номер аварийной службы: 904  </a>
                        <Link to="/page/contacts" className="btn btn-secondary">Контакты</Link>
                    </div>
                </div>
            </section>

            {/* Объявления */}
            {announcements.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2>📢 Объявления</h2>
                        <ul className="announcements-list">
                            {announcements.slice(0, 3).map((a) => (
                                <li key={a.id}>
                                    {a.isPinned && "📌 "}
                                    <strong>{a.title}</strong>
                                    <div dangerouslySetInnerHTML={{ __html: a.bodyHtml }} />
                                </li>
                            ))}
                        </ul>
                        <Link to="/announcements">Все объявления →</Link>
                    </div>
                </section>
            )}

            {/* Новости */}
            <section className="section">
                <div className="container">
                    <h2>📰 Новости</h2>
                    <div className="news-grid">
                        {news.slice(0, 3).map((post) => (
                            <article key={post.id} className="news-card">
                                <h3>{post.title}</h3>
                                <small>📅 {formatDate(post.publishedAt)}</small>
                                <p>{post.summary}</p>
                                <Link to={`/news/${post.id}`}>Читать далее →</Link>
                            </article>
                        ))}
                    </div>
                    <Link to="/news">Все новости →</Link>
                </div>
            </section>

            {/* Галерея */}
            {gallery.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2>🖼️ Галерея</h2>
                        <div className="gallery-grid">
                            {gallery.slice(0, 6).map((img) => (
                                <img
                                    key={img.id}
                                    src={getImageUrl(img.imageUrl)}
                                    alt={img.caption}
                                    loading="lazy"
                                />
                            ))}
                        </div>
                        <Link to="/gallery">Вся галерея →</Link>
                    </div>
                </section>
            )}
        </>
    );
}