import { useEffect, useState } from "react";
import { getAnnouncements } from "../api/contentApi";
import type { Announcement } from "../types/content";
import SEO from "../components/SEO";
import { IconMegaphone, IconCalendar, IconPin } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function AnnouncementsPage() {
    const { language, t } = useLanguage();
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getAnnouncements(language)
            .then(setItems)
            .catch(console.error)
            .finally(() => setLoading(false));
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
            <SEO title={t('announcements.title')} description={t('seo.announcementsDesc')} path="/announcements" />
            <section className="section">
                <div className="container">
                    <h1><IconMegaphone width={32} height={32} /> {t('announcements.title')}</h1>
                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : items.length === 0 ? (
                        <p>{t('announcements.empty')}</p>
                    ) : (
                        <ul className="announcements-list">
                            {items.map((a) => (
                                <li key={a.id} className={a.isPinned ? "pinned" : ""}>
                                    <div className="announcement-header">
                                        <h2>
                                            {a.isPinned && <IconPin />} {a.title}
                                        </h2>
                                        <small><IconCalendar /> {formatDate(a.publishedAt)}</small>
                                    </div>
                                    <div
                                        className="announcement-body content-body"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.bodyHtml) }}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}
