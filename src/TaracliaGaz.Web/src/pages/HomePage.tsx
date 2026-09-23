import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews, getAnnouncements, getGallery } from "../api/contentApi";
import type { NewsPostSummary, Announcement, GalleryImage } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl, resolveThumbnailUrl } from "../utils/urls";
import { IconMegaphone, IconNews, IconGallery, IconCalendar } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function HomePage() {
    const { language, t } = useLanguage();
    const [news, setNews] = useState<NewsPostSummary[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);

    useEffect(() => {
        getNews(language).then(setNews).catch(console.error);
        getAnnouncements(language).then(setAnnouncements).catch(console.error);
        getGallery().then(setGallery).catch(console.error);
    }, [language]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language), {
                day: "2-digit", month: "2-digit", year: "numeric",
            });
        } catch { return iso; }
    };

    return (
        <>
            <SEO
                title={t('nav.home')}
                description={t('seo.homeDesc')}
                path="/"
            />
            <section className="hero">
                <div className="container">
                    <h1>{t('home.heroTitle')}</h1>
                    <p className="hero-subtitle">
                        {t('home.heroSubtitle')}
                    </p>
                    <div className="hero-actions">
                        <a href="tel:904" className="btn btn-hero-primary">
                            {t('home.emergency')}
                        </a>
                        <Link to="/contacts" className="btn btn-hero-secondary">
                            {t('home.contacts')}
                        </Link>
                    </div>
                </div>
            </section>

            {announcements.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2><IconMegaphone /> {t('home.announcements')}</h2>
                        <ul className="announcements-list">
                            {announcements.slice(0, 3).map((a) => (
                                <li key={a.id} className={a.isPinned ? "pinned" : ""}>
                                    <div className="announcement-header">
                                        <h3>{a.title}</h3>
                                        <small><IconCalendar /> {formatDate(a.publishedAt)}</small>
                                    </div>
                                    <div
                                        className="announcement-body content-body"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.bodyHtml) }}
                                    />
                                </li>
                            ))}
                        </ul>
                        <Link to="/announcements" className="read-more">
                            {t('home.allAnnouncements')}
                        </Link>
                    </div>
                </section>
            )}

            <section className="section">
                <div className="container">
                    <h2><IconNews /> {t('home.news')}</h2>
                    {news.length === 0 ? (
                        <p>{t('news.empty')}</p>
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
                                            {t('common.readMore')}
                                        </Link>
                                    </article>
                                ))}
                            </div>
                            <Link to="/news" className="read-more">
                                {t('home.allNews')}
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {gallery.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2><IconGallery /> {t('home.gallery')}</h2>
                        <div className="gallery-grid">
                            {gallery.slice(0, 6).map((img) => (
                                <figure key={img.id} className="gallery-item">
                                    <img
                                        src={resolveThumbnailUrl(img.imageUrl)}
                                        alt={img.caption}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            // Миниатюры может не быть — откатываемся на полный файл
                                            const full = resolveUploadUrl(img.imageUrl);
                                            if (e.currentTarget.src !== full) {
                                                e.currentTarget.src = full;
                                            }
                                        }}
                                    />
                                    {img.caption && <figcaption>{img.caption}</figcaption>}
                                </figure>
                            ))}
                        </div>
                        <Link to="/gallery" className="read-more">
                            {t('home.allGallery')}
                        </Link>
                    </div>
                </section>
            )}
        </>
    );
}
