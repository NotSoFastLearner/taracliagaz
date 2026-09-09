import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocuments } from "../api/contentApi";
import type { Document } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconSearch, IconDocument } from "../components/icons";

const CATEGORIES = [
    { slug: "transparency", name: "Прозрачность" },
    { slug: "reports", name: "Отчёты" },
    { slug: "contracts", name: "Договоры" },
    { slug: "legislation", name: "Законодательство" },
];

export default function TransparencyPage() {
    const { slug } = useParams<{ slug?: string }>();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const currentSlug = slug || CATEGORIES[0].slug;

    useEffect(() => {
        setLoading(true);
        getDocuments(currentSlug)
            .then(setDocuments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [currentSlug]);

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
                    <h1><IconSearch width={32} height={32} /> Прозрачность</h1>
                    <div className="transparency-layout">
                        <aside className="transparency-menu">
                            <ul>
                                {CATEGORIES.map((cat) => (
                                    <li key={cat.slug}>
                                        <a
                                            href="#"
                                            className={currentSlug === cat.slug ? "active" : ""}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(`/transparency/${cat.slug}`);
                                            }}
                                        >
                                            {cat.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        <div>
                            {loading ? (
                                <p>Загрузка...</p>
                            ) : documents.length === 0 ? (
                                <p>Документов пока нет</p>
                            ) : (
                                <ul className="document-list">
                                    {documents.map((doc) => (
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
                                            >
                                                Открыть
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}