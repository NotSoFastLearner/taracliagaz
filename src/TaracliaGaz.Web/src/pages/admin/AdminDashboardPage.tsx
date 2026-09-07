import { Routes, Route, Link } from "react-router-dom";
import TestUpload from "./TestUpload";
import GalleryManager from "./GalleryManager";
import DocumentsManager from "./DocumentsManager";
import NewsManager from "./NewsManager";
import PagesManager from "./PagesManager";
import MenuManager from "./MenuManager";
import AnnouncementsManager from "./AnnouncementsManager";
import TendersManager from "./TendersManager";

function DashboardHome() {
    return (
        <>
            <h2>Разделы</h2>
            <ul className="admin-grid">
                <li><Link to="/admin/news">📰 Новости</Link></li>
                <li><Link to="/admin/announcements">📢 Объявления</Link></li>
                <li><Link to="/admin/tenders">🏷️ Тендеры</Link></li>
                <li><Link to="/admin/gallery">🖼️ Галерея</Link></li>
                <li><Link to="/admin/documents">📁 Документы</Link></li>
                <li><Link to="/admin/pages">📄 Страницы</Link></li>
                <li><Link to="/admin/menu">🧭 Меню</Link></li>
                <li><Link to="/admin/test-upload">🔧 Тест загрузки</Link></li>
            </ul>
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
                    <Route path="/news" element={<NewsManager />} />
                    <Route path="/announcements" element={<AnnouncementsManager />} />
                    <Route path="/tenders" element={<TendersManager />} />
                    <Route path="/gallery" element={<GalleryManager />} />
                    <Route path="/documents" element={<DocumentsManager />} />
                    <Route path="/pages" element={<PagesManager />} />
                    <Route path="/menu" element={<MenuManager />} />
                    <Route path="/test-upload" element={<TestUpload />} />
                </Routes>
            </div>
        </section>
    );
}