import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocuments } from "../api/contentApi";
import type { Document } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconDocument, IconDownload } from "../components/icons";
import { useLanguage, dateLocale } from "../context/LanguageContext";

export default function TransparencyPage() {
    const { slug } = useParams<{ slug?: string }>();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getDocuments(undefined, language)
            .then(setDocuments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [language]);

    // Категории строятся из реальных документов, а не захардкожены
    const categories = useMemo(() => {
        const seen = new Map<string, string>();
        for (const doc of documents) {
            if (!seen.has(doc.categorySlug)) {
                const key = `cat.${doc.categorySlug}`;
                const translated = t(key);
                // Если перевода нет, t() возвращает сам ключ — показываем slug
                seen.set(doc.categorySlug, translated === key ? doc.categorySlug : translated);
            }
        }
        return Array.from(seen, ([catSlug, name]) => ({ slug: catSlug, name }));
    }, [documents, t]);

    const activeSlug = useMemo(() => {
        if (slug && categories.some((c) => c.slug === slug)) return slug;
        return categories[0]?.slug ?? "";
    }, [slug, categories]);

    const filteredDocs = useMemo(
        () => documents.filter((doc) => doc.categorySlug === activeSlug),
        [documents, activeSlug]
    );

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(dateLocale(language));
        } catch { return iso; }
    };

    const activeName = categories.find((c) => c.slug === activeSlug)?.name ?? "";

    return (
        <>
            <SEO title={t('transparency.title')} description={t('seo.transparencyDesc')} path="/transparency" />
            <section className="section">
                <div className="container">
                    <h1>{t('transparency.title')}</h1>

                    {categories.length > 0 && (
                        <div className="transparency-filters">
                            {categories.map((cat) => (
                                <button
                                    key={cat.slug}
                                    type="button"
                                    className={`transparency-filter-btn ${activeSlug === cat.slug ? "active" : ""}`}
                                    onClick={() => navigate(`/transparency/${cat.slug}`)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : filteredDocs.length === 0 ? (
                        <p className="transparency-empty">
                            {t('transparency.empty')}{activeName ? ` — ${activeName}` : ""}
                        </p>
                    ) : (
                        <ul className="document-list">
                            {filteredDocs.map((doc) => (
                                <li key={doc.id}>
                                    <div>
                                        <strong><IconDocument /> {doc.title}</strong>
                                        <br />
                                        <small>{formatDate(doc.publishedAt)}</small>
                                    </div>
                                    {doc.fileUrl && (
                                        <a
                                            href={resolveUploadUrl(doc.fileUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <IconDownload /> {t('transparency.open')}
                                        </a>
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
