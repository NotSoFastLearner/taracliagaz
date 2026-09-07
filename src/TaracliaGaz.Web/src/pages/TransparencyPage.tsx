import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Document } from "../types/content";
import { getDocuments } from "../api/contentApi";

const categories: Record<string, string> = {
  "technical-economic": "Технико-экономические показатели",
  "investment-plan": "Инвестиционный план",
  "compliance-program": "Программа соответствия",
  "financial-reports": "Финансовые отчёты",
  vacancies: "Вакансии",
  charter: "УСТАВ",
  "auditor-report": "Отчёт независимого аудитора",
  "internal-info": "Внутренняя информация",
};

export default function TransparencyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]));
  }, []);

  const activeCategory = slug ?? "technical-economic";
  const filtered = documents.filter((d) => d.categorySlug === activeCategory);

  return (
    <section className="section">
      <div className="container transparency-layout">
        <aside className="transparency-menu">
          <h2>Прозрачность</h2>
          <ul>
            {Object.entries(categories).map(([key, label]) => (
              <li key={key}>
                <Link to={`/transparency/${key}`} className={key === activeCategory ? "active" : ""}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="transparency-content">
          <h1>{categories[activeCategory] ?? "Прозрачность"}</h1>
          <ul className="document-list">
            {filtered.map((doc) => (
              <li key={doc.id}>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  {doc.title}
                </a>
                <time dateTime={doc.publishedAt}>{new Date(doc.publishedAt).toLocaleDateString("ru-RU")}</time>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
