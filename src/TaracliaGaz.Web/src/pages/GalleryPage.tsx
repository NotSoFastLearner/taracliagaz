import { useEffect, useState } from "react";
import type { GalleryImage } from "../types/content";
import { getGallery } from "../api/contentApi";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1>Галерея</h1>
        {loading && <p>Загрузка...</p>}
        <div className="gallery-grid">
          {items.map((item) => (
            <figure key={item.id} className="gallery-item">
              <img src={item.imageUrl} alt={item.caption} loading="lazy" />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
