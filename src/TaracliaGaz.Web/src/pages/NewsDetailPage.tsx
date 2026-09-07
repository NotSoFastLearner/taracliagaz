import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { NewsPostDetail } from "../types/content";
import { getNewsById } from "../api/contentApi";

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getNewsById(id)
      .then(setItem)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!item) return <p>Новость не найдена.</p>;

  return (
    <article className="section">
      <div className="container">
        <h1>{item.title}</h1>
        <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString("ru-RU")}</time>
        <div className="content-body" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
      </div>
    </article>
  );
}
