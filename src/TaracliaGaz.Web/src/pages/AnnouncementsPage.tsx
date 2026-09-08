import { useEffect, useState } from "react";
import { getAnnouncements } from "../api/contentApi";
import type { Announcement } from "../types/content";
import SEO from "../components/SEO";

export default function AnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAnnouncements()
            .then(setItems)
            .catch((err) => {
                setError("Не удалось загрузить объявления");
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
                title="Объявления"
                description="Актуальные объявления SRL «Taraclia Gaz» для потребителей природного газа. Отключения, профилактические работы, важные сообщения."
                path="/announcements"
            />

            <section className="section">
                <div className="container">
                    <h1>📢 Объявления</h1>

                    {items.length === 0 ? (
                        <p>Активных объявлений нет</p>
                    ) : (
                        <ul className="announcements-list">
                            {items.map((item) => (
                                <li key={item.id} className={item.isPinned ? "pinned" : ""}>
                                    <div className="announcement-header">
                                        <h2>
                                            {item.isPinned && "📌 "}
                                            {item.title}
                                        </h2>
                                        <small>📅 {formatDate(item.publishedAt)}</small>
                                    </div>
                                    <div
                                        className="announcement-body content-body"
                                        dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
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