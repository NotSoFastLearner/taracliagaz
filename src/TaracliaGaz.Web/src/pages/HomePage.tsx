import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getBootstrap } from "../api/contentApi";
import SEO from "../components/SEO";
import { resolveUploadUrl, resolveThumbnailUrl } from "../utils/urls";
import {
    IconMegaphone, IconNews, IconGallery, IconCalendar, IconPin,
    IconCalculator, IconDocument, IconHelpCircle, IconFire, IconArrowRight,
} from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize";
import { prefetchProps } from "../utils/prefetch";
import { useLanguage, dateLocale } from "../context/LanguageContext";
import { readCache, useCachedFetch } from "../hooks/useCachedFetch";
import type { Announcement, GalleryImage, NewsPostSummary } from "../types/content";

export default function HomePage() {
    const { language, t } = useLanguage();

    // SWR + 1 запрос: повторные визиты рендерятся мгновенно из localStorage,
    // свежие данные (меню, объявления, новости, галерея) подгружаются одним запросом
    const { data: bootstrap } = useCachedFetch(
        `bootstrap:${language}`,
        () => getBootstrap(language),
        [language]
    );

    const news = bootstrap?.news ?? readCache<NewsPostSummary[]>(`news:${language}`) ?? [];
    const announcements = useMemo(
        () => bootstrap?.announcements ?? readCache<Announcement[]>(`announcements:home:${language}`) ?? [],
        [bootstrap, language]
    );
    const topAnnouncements = useMemo(
        () =>
            announcements.slice(0, 3).map((a) => ({
                ...a,
                safeHtml: sanitizeHtml(a.bodyHtml),
            })),
        [announcements]
    );
    const gallery = bootstrap?.gallery ?? readCache<GalleryImage[]>("gallery:home") ?? [];

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
                    <div className="hero-badge">
                        <IconFire width={16} height={16} />
                        <span>{t('contacts.emergency')}: 904</span>
                    </div>
                    <h1>{t('home.heroTitle')}</h1>
                    <p className="hero-subtitle">
                        {t('home.heroSubtitle')}
                    </p>
                    <div className="hero-actions">
                        <a href="tel:904" className="btn btn-hero-primary">
                            {t('home.emergency')}
                        </a>
                        <Link to="/contacts" className="btn btn-hero-secondary" {...prefetchProps("/contacts", language)}>
                            {t('home.contacts')}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="quick-links-section">
                <div className="container">
                    <div className="quick-links-grid">
                        <Link to="/page/tariffs" className="quick-link-card" {...prefetchProps("/page/tariffs", language)}>
                            <span className="quick-link-icon"><IconCalculator width={24} height={24} /></span>
                            <div className="quick-link-body">
                                <h3>{t('home.quickTariffs')}</h3>
                                <p>{t('home.quickTariffsDesc')}</p>
                            </div>
                            <span className="quick-link-arrow" aria-hidden="true">
                                <IconArrowRight width={18} height={18} />
                            </span>
                        </Link>
                        <Link to="/page/safety" className="quick-link-card" {...prefetchProps("/page/safety", language)}>
                            <span className="quick-link-icon"><IconFire width={24} height={24} /></span>
                            <div className="quick-link-body">
                                <h3>{t('home.quickSafety')}</h3>
                                <p>{t('home.quickSafetyDesc')}</p>
                            </div>
                            <span className="quick-link-arrow" aria-hidden="true">
                                <IconArrowRight width={18} height={18} />
                            </span>
                        </Link>
                        <Link to="/page/services" className="quick-link-card" {...prefetchProps("/page/services", language)}>
                            <span className="quick-link-icon"><IconDocument width={24} height={24} /></span>
                            <div className="quick-link-body">
                                <h3>{t('home.quickServices')}</h3>
                                <p>{t('home.quickServicesDesc')}</p>
                            </div>
                            <span className="quick-link-arrow" aria-hidden="true">
                                <IconArrowRight width={18} height={18} />
                            </span>
                        </Link>
                        <Link to="/page/faq" className="quick-link-card" {...prefetchProps("/page/faq", language)}>
                            <span className="quick-link-icon"><IconHelpCircle width={24} height={24} /></span>
                            <div className="quick-link-body">
                                <h3>{t('home.quickFaq')}</h3>
                                <p>{t('home.quickFaqDesc')}</p>
                            </div>
                            <span className="quick-link-arrow" aria-hidden="true">
                                <IconArrowRight width={18} height={18} />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {announcements.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <h2><IconMegaphone /> {t('home.announcements')}</h2>
                            <Link to="/announcements" className="section-more" {...prefetchProps("/announcements", language)}>
                                {t('home.allAnnouncements')}
                            </Link>
                        </div>
                        <ul className="announcements-list">
                            {topAnnouncements.map((a) => (
                                <li key={a.id} className={a.isPinned ? "pinned" : ""}>
                                    <div className="announcement-header">
                                        <h3>{a.isPinned && <IconPin />} {a.title}</h3>
                                        <small><IconCalendar /> {formatDate(a.publishedAt)}</small>
                                    </div>
                                    <div
                                        className="announcement-body announcement-body-preview content-body"
                                        dangerouslySetInnerHTML={{ __html: a.safeHtml }}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2><IconNews /> {t('home.news')}</h2>
                        {news.length > 0 && (
                            <Link to="/news" className="section-more" {...prefetchProps("/news", language)}>
                                {t('home.allNews')}
                            </Link>
                        )}
                    </div>
                    {news.length === 0 ? (
                        <p>{t('news.empty')}</p>
                    ) : (
                        <div className="news-grid">
                            {news.slice(0, 3).map((post) => (
                                <article key={post.id} className="news-card">
                                    <h3>
                                        <Link to={`/news/${post.id}`} {...prefetchProps(`/news/${post.id}`, language)}>{post.title}</Link>
                                    </h3>
                                    <small><IconCalendar /> {formatDate(post.publishedAt)}</small>
                                    <p>{post.summary}</p>
                                    <Link to={`/news/${post.id}`} className="read-more" {...prefetchProps(`/news/${post.id}`, language)}>
                                        {t('common.readMore')}
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {gallery.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <h2><IconGallery /> {t('home.gallery')}</h2>
                            <Link to="/gallery" className="section-more" {...prefetchProps("/gallery", language)}>
                                {t('home.allGallery')}
                            </Link>
                        </div>
                        <div className="gallery-grid">
                            {gallery.slice(0, 6).map((img) => (
                                <figure key={img.id} className="gallery-item">
                                    <img
                                        src={resolveThumbnailUrl(img.imageUrl)}
                                        alt={img.caption}
                                        width={320}
                                        height={240}
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
                    </div>
                </section>
            )}
        </>
    );
}
