import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTenderById } from "../api/contentApi";
import type { Tender } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconCalendar, IconClock, IconDownload, IconExternalLink } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function TenderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { language, t } = useLanguage();
    const [tender, setTender] = useState<Tender | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        getTenderById(parseInt(id))
            .then(setTender)
            .catch(() => setError(t('tenders.notFound')))
            .finally(() => setLoading(false));
    }, [id, t]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language), {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    if (loading) return <p>{t('common.loading')}</p>;
    if (error || !tender) return <p className="error">{error || t('tenders.notFound')}</p>;

    return (
        <>
            <SEO
                title={tender.title}
                description={`${t('tenders.title')}: ${tender.title}. ${tender.deadlineAt ? `${t('common.deadline')}: ${formatDate(tender.deadlineAt)}.` : ""}`}
                path={`/tenders/${tender.id}`}
            />
            <section className="section">
                <div className="container">
                    <Link to="/tenders" className="back-link">{t('tenders.backAll')}</Link>
                    <article className="tender-detail">
                        <h1>{tender.title}</h1>
                        <div className="tender-meta">
                            <small>
                                <IconCalendar /> {t('common.published')}: {formatDate(tender.publishedAt)}
                                {tender.deadlineAt && (
                                    <> | <IconClock /> {t('common.deadline')}: <strong>{formatDate(tender.deadlineAt)}</strong></>
                                )}
                            </small>
                        </div>
                        <div
                            className="tender-body content-body"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(tender.bodyHtml) }}
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
                                        <IconDownload /> {t('tenders.download')}
                                    </a>
                                )}
                                {tender.externalUrl && (
                                    <a
                                        href={tender.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        <IconExternalLink /> {t('tenders.online')}
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
