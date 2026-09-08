import { useEffect, useState } from "react";
import { getDocuments } from "../api/contentApi";
import type { Document } from "../types/content";
import SEO from "../components/SEO";

export default function TransparencyPage() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocuments("transparency")
            .then(setDocs)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getFileUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("/uploads/")) return `http://localhost:8000${url}`;
        return url;
    };

    return (
        <>
            <SEO
                title="Прозрачность"
                description="Информация о прозрачности деятельности SRL «Taraclia Gaz»: отчёты, финансовая информация, нормативные документы."
                path="/transparency"
            />

            <section className="section">
                <div className="container">
                    <h1>🔍 Прозрачность</h1>
                    <p>
                        SRL «Taraclia Gaz» стремится к открытости и публикует информацию
                        о своей деятельности в соответствии с требованиями законодательства
                        Республики Молдова.
                    </p>

                    {loading ? (
                        <p>Загрузка...</p>
                    ) : docs.length === 0 ? (
                        <p>Документы в этом разделе пока отсутствуют.</p>
                    ) : (
                        <ul className="documents-list">
                            {docs.map((doc) => (
                                <li key={doc.id}>
                                    <a href={getFileUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                                        📄 {doc.title}
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