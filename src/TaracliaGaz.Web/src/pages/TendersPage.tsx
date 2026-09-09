import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTenders } from "../api/contentApi";
import type { Tender } from "../types/content";
import SEO from "../components/SEO";
import { IconCalendar, IconClock } from "../components/icons";

export default function TendersPage() {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTenders().then(setTenders).catch(console.error).finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric",
            });
        } catch { return iso; }
    };

    const getStatusBadge = (deadline?: string | null) => {
        if (!deadline) {
            return { label: "Активный тендер", className: "badge optional" };
        }
        const dl = new Date(deadline);
        const now = new Date();
        if (dl < now) {
            return { label: "Приём заявок завершён", className: "badge required" };
        }
        return {
            label: `Приём заявок до ${formatDate(deadline)}`,
            className: "badge optional",
        };
    };

    return (
        <>
            <SEO title="Тендеры" description="Тендеры SRL «Taraclia Gaz»" path="/tenders" />
            <section className="section">
                <div className="container">
                    <h1>Тендеры</h1>
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : tenders.length === 0 ? (
                        <p>Тендеров пока нет</p>
                    ) : (
                        <ul className="tenders-list">
                            {tenders.map((t) => {
                                const badge = getStatusBadge(t.deadlineAt);
                                return (
                                    <li key={t.id}>
                                        <h2>
                                            <Link to={`/tenders/${t.id}`}>{t.title}</Link>
                                        </h2>
                                        <div className="tender-meta-inline">
                                            <small>
                                                <IconCalendar /> Опубликовано: {formatDate(t.publishedAt)}
                                            </small>
                                            {t.deadlineAt && (
                                                <small>
                                                    <IconClock /> Дедлайн: {formatDate(t.deadlineAt)}
                                                </small>
                                            )}
                                        </div>
                                        <div style={{ marginTop: "8px" }}>
                                            <span className={badge.className}>{badge.label}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}