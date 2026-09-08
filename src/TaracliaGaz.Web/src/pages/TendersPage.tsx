import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTenders } from "../api/contentApi";
import type { Tender } from "../types/content";
import SEO from "../components/SEO";

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
        <>
            <SEO
                title="Тендеры"
                description="Актуальные тендеры SRL «Taraclia Gaz». Закупки, конкурсы, документация для участия. Информация о дедлайнах и условиях."
                path="/tenders"
            />

            <section className="section">
                <div className="container">
                    <h1>Тендеры</h1>

                    {tenders.length === 0 ? (
                        <p>Нет активных тендеров</p>
                    ) : (
                        <ul className="tenders-list">
                            {tenders.map((t) => (
                                <li key={t.id}>
                                    <h2>
                                        <Link to={`/tenders/${t.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                            {t.title}
                                        </Link>
                                    </h2>
                                    <small>
                                         Опубликовано: {formatDate(t.publishedAt)}
                                        {t.deadlineAt && (
                                            <> |  Дедлайн: <strong>{formatDate(t.deadlineAt)}</strong></>
                                        )}
                                    </small>
                                    <div
                                        className="tender-body content-body"
                                        dangerouslySetInnerHTML={{ __html: t.bodyHtml }}
                                    />

                                    {(t.documentUrl || t.externalUrl) && (
                                        <div className="tender-docs">
                                            {t.documentUrl && (
                                                <a
                                                    href={getFileUrl(t.documentUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary"
                                                >
                                                    Скачать документацию
                                                </a>
                                            )}
                                            {t.externalUrl && (
                                                <a
                                                    href={t.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary"
                                                >
                                                    Документация онлайн
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}