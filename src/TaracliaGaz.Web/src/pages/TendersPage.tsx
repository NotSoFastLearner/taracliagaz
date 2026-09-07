import { useEffect, useState } from "react";
import { getTenders } from "../api/contentApi";
import type { Tender } from "../types/content";

export default function TendersPage() {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getTenders()
            .then(setTenders)
            .catch((err) => {
                setError("Не удалось загрузить тендеры");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            });
        } catch { return iso; }
    };

    const getFileUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("/uploads/")) return `http://localhost:8000${url}`;
        return url;
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <section className="section">
            <div className="container">
                <h1>Тендеры</h1>

                {tenders.length === 0 ? (
                    <p>Нет активных тендеров</p>
                ) : (
                    <ul className="admin-list">
                        {tenders.map((t) => (
                            <li key={t.id}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: "0 0 5px 0" }}>{t.title}</h3>
                                    <small>
                                        📅 Опубликовано: {formatDate(t.publishedAt)}
                                        {t.deadlineAt && (
                                            <> | 🕐 Дедлайн: <strong>{formatDate(t.deadlineAt)}</strong></>
                                        )}
                                    </small>
                                    <div
                                        style={{ marginTop: "10px", color: "#333" }}
                                        dangerouslySetInnerHTML={{ __html: t.bodyHtml }}
                                    />

                                    {/* 🆕 Кнопки документации */}
                                    {(t.documentUrl || t.externalUrl) && (
                                        <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                            {t.documentUrl && (
                                                <a
                                                    href={getFileUrl(t.documentUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "8px 16px",
                                                        background: "#007bff",
                                                        color: "white",
                                                        textDecoration: "none",
                                                        borderRadius: "4px",
                                                        fontSize: "14px"
                                                    }}
                                                >
                                                    📥 Скачать документацию
                                                </a>
                                            )}
                                            {t.externalUrl && (
                                                <a
                                                    href={t.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "8px 16px",
                                                        background: "#28a745",
                                                        color: "white",
                                                        textDecoration: "none",
                                                        borderRadius: "4px",
                                                        fontSize: "14px"
                                                    }}
                                                >
                                                    🔗 Документация онлайн
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}