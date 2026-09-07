import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { NewsPostSummary } from "../types/content";
import { getNews } from "../api/contentApi";

export default function NewsPage() {
  const [items, setItems] = useState<NewsPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNews()
      .then(setItems)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1>Новости</h1>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        <div className="card-list">
          {items.map((item) => (
            <article key={item.id} className="card">
              <Link to={`/news/${item.id}`}>
                <h3>{item.title}</h3>
                <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString("ru-RU")}</time>
                <p>{item.summary}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
