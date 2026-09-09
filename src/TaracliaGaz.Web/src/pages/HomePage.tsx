import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews, getAnnouncements, getGallery } from "../api/contentApi";
import type { NewsPostSummary, Announcement, GalleryImage } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconMegaphone, IconNews, IconGallery, IconCalendar } from "../components/icons";

export default function HomePage() {
    const [news, setNews] = useState<NewsPostSummary[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);

    useEffect(() => {
        getNews().then(setNews).catch(console.error);
        getAnnouncements().then(setAnnouncements).catch(console.error);
        getGallery().then(setGallery).catch(console.error);
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
            <SEO
                title="Главная"
                description="SRL «Taraclia Gaz» — поставка природного газа в Тараклийском районе Молдовы. Актуальные тарифы, новости, объявления, тендеры. Аварийная служба 24/7: 904"
                path="/"
            />

            <section className="hero">
                <div className="container">
                    <h1>Тараклия-ГАЗ</h1>
                    <p className="hero-subtitle">
                        Надёжное газоснабжение для жителей и предприятий Тараклийского района
                    </p>
                    <div className="hero-actions">
                        <a href="tel:904" className="btn btn-hero-primary">
                            Аварийная служба: 904
                        </a>
                        <Link to="/contacts" className="btn btn-hero-secondary">
                            Контакты
                        </Link>
                    </div>
                </div>
            </section>

            {announcements.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2><IconMegaphone /> Объявления</h2>
                        <ul className="announcements-list">
                            {announcements.slice(0, 3).map((a) => (
                                <li key={a.id} className={a.isPinned ? "pinned" : ""}>
                                    <div className="announcement-header">
                                        <h3>{a.title}</h3>
                                        <small><IconCalendar /> {formatDate(a.publishedAt)}</small>
                                    </div>
                                    <div className="announcement-body content-body" dangerouslySetInnerHTML={{ __html: a.bodyHtml }} />
                                </li>
                            ))}
                        </ul>
                        <Link to="/announcements" className="read-more">
                            Все объявления →
                        </Link>
                    </div>
                </section>
            )}

            <section className="section">
                <div className="container">
                    <h2><IconNews /> Новости</h2>
                    {news.length === 0 ? (
                        <p>Новостей пока нет</p>
                    ) : (
                        <>
                            <div className="news-grid">
                                {news.slice(0, 3).map((post) => (
                                    <article key={post.id} className="news-card">
                                        <h3>
                                            <Link to={`/news/${post.id}`}>{post.title}</Link>
                                        </h3>
                                        <small><IconCalendar /> {formatDate(post.publishedAt)}</small>
                                        <p>{post.summary}</p>
                                        <Link to={`/news/${post.id}`} className="read-more">
                                            Читать далее →
                                        </Link>
                                    </article>
                                ))}
                            </div>
                            <Link to="/news" className="read-more">
                                Все новости →
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {gallery.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2><IconGallery /> Галерея</h2>
                        <div className="gallery-grid">
                            {gallery.slice(0, 6).map((img) => (
                                <figure key={img.id} className="gallery-item">
                                    <img
                                        src={resolveUploadUrl(img.imageUrl)}
                                        alt={img.caption}
                                        loading="lazy"
                                    />
                                    {img.caption && <figcaption>{img.caption}</figcaption>}
                                </figure>
                            ))}
                        </div>
                        <Link to="/gallery" className="read-more">
                            Вся галерея →
                        </Link>
                    </div>
                </section>
            )}
        </>
    );
}