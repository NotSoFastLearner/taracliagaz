import { useEffect, useState } from "react";
import type { Announcement } from "../types/content";
import { getAnnouncements } from "../api/contentApi";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncements()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1>Объявления</h1>
        {loading && <p>Загрузка...</p>}
        <div className="card-list">
          {items.map((item) => (
            <article key={item.id} className="card announce-card">
              <h3>{item.title}</h3>
              <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString("ru-RU")}</time>
              <div dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
