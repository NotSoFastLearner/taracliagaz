import { Routes, Route, Link } from "react-router-dom";

function DashboardHome() {
  return (
    <>
      <h2>Разделы</h2>
      <ul className="admin-grid">
        <li>
          <Link to="/admin/news">Новости</Link>
        </li>
        <li>
          <Link to="/admin/announcements">Объявления</Link>
        </li>
        <li>
          <Link to="/admin/tenders">Тендеры</Link>
        </li>
        <li>
          <Link to="/admin/gallery">Галерея</Link>
        </li>
        <li>
          <Link to="/admin/documents">Документы</Link>
        </li>
        <li>
          <Link to="/admin/pages">Страницы</Link>
        </li>
      </ul>
    </>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <>
      <h2>{title}</h2>
      <p>Форма управления разделом «{title}» будет добавлена позже.</p>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <section className="section admin-dashboard">
      <div className="container">
        <h1>Панель управления</h1>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/news" element={<Placeholder title="Новости" />} />
          <Route path="/announcements" element={<Placeholder title="Объявления" />} />
          <Route path="/tenders" element={<Placeholder title="Тендеры" />} />
          <Route path="/gallery" element={<Placeholder title="Галерея" />} />
          <Route path="/documents" element={<Placeholder title="Документы" />} />
          <Route path="/pages" element={<Placeholder title="Страницы" />} />
        </Routes>
      </div>
    </section>
  );
}
