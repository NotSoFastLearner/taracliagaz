import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTenders } from "../api/contentApi";
import type { Tender } from "../types/content";
import SEO from "../components/SEO";

export default function TenderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [tender, setTender] = useState<Tender | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getTenders()
            .then((items) => {
                const found = items.find((t) => t.id === parseInt(id));
                if (found) {
                    setTender(found);
                } else {
                    setError("Тендер не найден");
                }
            })
            .catch(() => setError("Ошибка загрузки"))
            .finally(() => setLoading(false));
    }, [id]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    const getFileUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("/uploads/")) return `http://localhost:8000${url}`;
        return url;
    };

    if (loading) return <p>Загрузка...</p>;
    if (error || !tender) return <p className="error">{error || "Тендер не найден"}</p>;

    return (
        <>
            <SEO
                title={tender.title}
                description={`Тендер: ${tender.title}. ${tender.deadlineAt ? `Дедлайн: ${formatDate(tender.deadlineAt)}.` : ""}`}
                path={`/tenders/${tender.id}`}
            />

            <section className="section">
                <div className="container">
                    <Link to="/tenders" className="back-link">← Все тендеры</Link>
                    <article className="tender-detail">
                        <h1>{tender.title}</h1>
                        <div className="tender-meta">
                            <small>
                                 Опубликовано: {formatDate(tender.publishedAt)}
                                {tender.deadlineAt && (
                                    <> | Дедлайн: <strong>{formatDate(tender.deadlineAt)}</strong></>
                                )}
                            </small>
                        </div>
                        <div
                            className="tender-body content-body"
                            dangerouslySetInnerHTML={{ __html: tender.bodyHtml }}
                        />

                        {(tender.documentUrl || tender.externalUrl) && (
                            <div className="tender-docs" style={{ marginTop: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                {tender.documentUrl && (
                                    <a
                                        href={getFileUrl(tender.documentUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        Скачать документацию
                                    </a>
                                )}
                                {tender.externalUrl && (
                                    <a
                                        href={tender.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        🔗 Документация онлайн
                                    </a>
                                )}
                            </div>
                        )}
                    </article>
                </div>
            </section>
        </>
    );
}