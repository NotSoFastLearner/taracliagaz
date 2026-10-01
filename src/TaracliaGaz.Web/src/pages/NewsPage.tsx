import { Link } from "react-router-dom";
import { getNews } from "../api/contentApi";
import { useCachedFetch } from "../hooks/useCachedFetch";
import SEO from "../components/SEO";
import { IconNews, IconCalendar } from "../components/icons";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function NewsPage() {
    const { language, t } = useLanguage();
    // SWR: мгновенный показ из localStorage, свежие данные в фоне
    const { data: newsData, loading } = useCachedFetch(
        `news:${language}`, () => getNews(language), [language]
    );
    const news = newsData ?? [];

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language), {
                day: "2-digit", month: "2-digit", year: "numeric",
            });
        } catch { return iso; }
    };

    return (
        <>
            <SEO title={t('news.title')} description={t('seo.newsDesc')} path="/news" />
            <section className="section">
                <div className="container">
                    <h1><IconNews width={32} height={32} /> {t('news.title')}</h1>
                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : news.length === 0 ? (
                        <p>{t('news.empty')}</p>
                    ) : (
                        <div className="news-grid">
                            {news.map((post) => (
                                <article key={post.id} className="news-card">
                                    <h3><Link to={`/news/${post.id}`}>{post.title}</Link></h3>
                                    <small><IconCalendar /> {formatDate(post.publishedAt)}</small>
                                    <p>{post.summary}</p>
                                    <Link to={`/news/${post.id}`} className="read-more">
                                        {t('common.readMore')}
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
