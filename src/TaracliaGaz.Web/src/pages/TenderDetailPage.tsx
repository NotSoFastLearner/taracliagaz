import { useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTenderById } from "../api/contentApi";
import type { Tender } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconCalendar, IconClock, IconDownload, IconExternalLink } from "../components/icons";
import { sanitizeHtml } from "../utils/sanitize";
import { useLanguage, dateLocale } from "../context/LanguageContext";
import { readCache, useCachedFetch, writeCache } from "../hooks/useCachedFetch";

export default function TenderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const numericId = Number(id);

    const cachedList = readCache<Tender[]>(`tenders:${language}`);
    const listMatch = cachedList?.find((item) => item.id === numericId);
    if (listMatch && !readCache<Tender>(`tender-item:${numericId}`)) {
        writeCache(`tender-item:${numericId}`, listMatch);
    }

    const { data: tender, loading, error } = useCachedFetch(
        `tender-item:${numericId}`,
        () => getTenderById(numericId, language)
    );

    useEffect(() => {
        if (tender && tender.languageCode && tender.languageCode !== language) {
            navigate("/tenders", { replace: true });
        }
    }, [tender, language, navigate]);

    const safeHtml = useMemo(() => (tender ? sanitizeHtml(tender.bodyHtml) : ""), [tender]);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language), {
                day: "2-digit", month: "long", year: "numeric",
            });
        } catch { return iso; }
    };

    if (loading) return <p>{t('common.loading')}</p>;
    if (error || !tender) return <p className="error">{t('tenders.notFound')}</p>;

    return (
        <>
            <SEO
                title={tender.title}
                description={`${t('tenders.title')}: ${tender.title}. ${tender.deadlineAt ? `${t('common.deadline')}: ${formatDate(tender.deadlineAt)}.` : ""}`}
                path={`/tenders/${tender.id}`}
                singleLang
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
                            dangerouslySetInnerHTML={{ __html: safeHtml }}
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
                                        href={resolveUploadUrl(tender.externalUrl)}
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
