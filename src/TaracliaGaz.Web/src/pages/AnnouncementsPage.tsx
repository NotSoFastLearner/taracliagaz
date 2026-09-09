import { useEffect, useState } from "react";
import { getAnnouncements } from "../api/contentApi";
import type { Announcement } from "../types/content";
import SEO from "../components/SEO";
import { IconMegaphone, IconCalendar, IconPin } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize"; // ✅

export default function AnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAnnouncements().then(setItems).catch(console.error).finally(() => setLoading(false));
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
            <SEO title="Объявления" description="Объявления SRL «Taraclia Gaz»" path="/announcements" />
            <section className="section">
                <div className="container">
                    <h1><IconMegaphone width={32} height={32} /> Объявления</h1>
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : items.length === 0 ? (
                        <p>Объявлений пока нет</p>
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
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.bodyHtml) }} // ✅
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