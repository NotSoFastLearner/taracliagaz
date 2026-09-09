import { useEffect, useState, useMemo } from "react";
import { getDocuments } from "../api/contentApi";
import type { Document } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconDocument, IconDownload } from "../components/icons";

const CATEGORIES = [
    { slug: "transparency", name: "Прозрачность" },
    { slug: "reports", name: "Отчёты" },
    { slug: "contracts", name: "Договоры" },
    { slug: "legislation", name: "Законодательство" },
];

export default function TransparencyPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSlug, setActiveSlug] = useState<string>(CATEGORIES[0].slug);

    useEffect(() => {
        setLoading(true);
        getDocuments()
            .then(setDocuments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredDocs = useMemo(
        () => documents.filter((doc) => doc.categorySlug === activeSlug),
        [documents, activeSlug]
    );

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU");
        } catch { return iso; }
    };

    return (
        <>
            <SEO title="Прозрачность" description="Публичные документы SRL «Taraclia Gaz»" path="/transparency" />
            <section className="section">
                <div className="container">
                    <h1>Прозрачность</h1>

                    <div className="transparency-filters">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.slug}
                                type="button"
                                className={`transparency-filter-btn ${activeSlug === cat.slug ? "active" : ""}`}
                                onClick={() => setActiveSlug(cat.slug)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p>Загрузка...</p>
                    ) : filteredDocs.length === 0 ? (
                        <p className="transparency-empty">
                            Документов в категории «{CATEGORIES.find((c) => c.slug === activeSlug)?.name}» пока нет
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
                                    <a
                                        href={resolveUploadUrl(doc.fileUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <IconDownload /> Открыть
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}