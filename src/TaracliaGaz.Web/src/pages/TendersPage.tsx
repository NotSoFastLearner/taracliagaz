import { Link } from "react-router-dom";
import { getTenders } from "../api/contentApi";
import { useCachedFetch } from "../hooks/useCachedFetch";
import SEO from "../components/SEO";
import { IconCalendar, IconClock } from "../components/icons";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function TendersPage() {
    const { language, t } = useLanguage();
    // SWR: мгновенный показ из localStorage, свежие данные в фоне
    const { data: tendersData, loading } = useCachedFetch(
        `tenders:${language}`, () => getTenders(language), [language]
    );
    const tenders = tendersData ?? [];

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language), {
                day: "2-digit", month: "2-digit", year: "numeric",
            });
        } catch { return iso; }
    };

    const getStatusBadge = (deadline?: string | null) => {
        if (!deadline) {
            return { label: t('tenders.active'), className: "badge optional" };
        }
        const dl = new Date(deadline);
        const now = new Date();
        if (dl < now) {
            return { label: t('tenders.closed'), className: "badge required" };
        }
        return {
            label: `${t('tenders.until')} ${formatDate(deadline)}`,
            className: "badge optional",
        };
    };

    return (
        <>
            <SEO title={t('tenders.title')} description={t('seo.tendersDesc')} path="/tenders" />
            <section className="section">
                <div className="container">
                    <h1>{t('tenders.title')}</h1>
                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : tenders.length === 0 ? (
                        <p>{t('tenders.empty')}</p>
                    ) : (
                        <ul className="tenders-list">
                            {tenders.map((tender) => {
                                const badge = getStatusBadge(tender.deadlineAt);
                                return (
                                    <li key={tender.id}>
                                        <h2>
                                            <Link to={`/tenders/${tender.id}`}>{tender.title}</Link>
                                        </h2>
                                        <div className="tender-meta-inline">
                                            <small>
                                                <IconCalendar /> {t('common.published')}: {formatDate(tender.publishedAt)}
                                            </small>
                                            {tender.deadlineAt && (
                                                <small>
                                                    <IconClock /> {t('common.deadline')}: {formatDate(tender.deadlineAt)}
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
