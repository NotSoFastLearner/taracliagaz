import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "../api/http"; // ✅
import type { Tender } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconCalendar, IconClock, IconDownload, IconExternalLink } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize"; // ✅

export default function TenderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [tender, setTender] = useState<Tender | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        // ✅ Используем эндпоинт конкретного тендера
        http.get<Tender>(`/public/tenders/${id}`)
            .then(setTender)
            .catch(() => setError("Тендер не найден"))
            .finally(() => setLoading(false));
    }, [id]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
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
                                <IconCalendar /> Опубликовано: {formatDate(tender.publishedAt)}
                                {tender.deadlineAt && (
                                    <> | <IconClock /> Дедлайн: <strong>{formatDate(tender.deadlineAt)}</strong></>
                                )}
                            </small>
                        </div>
                        <div
                            className="tender-body content-body"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(tender.bodyHtml) }} // ✅
                        />

                        {(tender.documentUrl || tender.externalUrl) && (
                            <div className="tender-docs">
                                {tender.documentUrl && (
                                    <a
                                        href={resolveUploadUrl(tender.documentUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        <IconDownload /> Скачать документацию
                                    </a>
                                )}
                                {tender.externalUrl && (
                                    <a
                                        href={tender.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        <IconExternalLink /> Документация онлайн
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