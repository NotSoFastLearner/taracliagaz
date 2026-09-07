import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPage } from "../api/contentApi";
import type { Page } from "../types/content";

export default function StaticPage() {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        getPage(slug)
            .then(setPage)
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : "Ошибка загрузки страницы")
            )
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!page) return <p>Страница не найдена.</p>;

    return (
        <section className="section">
            <div className="container">
                <h1>{page.title}</h1>
                <div className="content-body" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
            </div>
        </section>
    );
}