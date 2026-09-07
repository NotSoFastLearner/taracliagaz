import { useEffect, useState } from "react";
import type { Tender } from "../types/content";
import { getTenders } from "../api/contentApi";

export default function TendersPage() {
  const [items, setItems] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenders()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1>Тендеры</h1>
        {loading && <p>Загрузка...</p>}
        <div className="card-list">
          {items.map((item) => (
            <article key={item.id} className="card tender-card">
              <h3>{item.title}</h3>
              <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString("ru-RU")}</time>
              {item.deadlineAt && (
                <p>
                  <strong>Срок подачи:</strong> {new Date(item.deadlineAt).toLocaleDateString("ru-RU")}
                </p>
              )}
              <div dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
              {item.documentUrl && (
                <a href={item.documentUrl} target="_blank" rel="noreferrer">
                  Скачать документы
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
