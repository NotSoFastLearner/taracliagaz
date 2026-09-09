import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import StaticPage from "./pages/StaticPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import TendersPage from "./pages/TendersPage";
import TenderDetailPage from "./pages/TenderDetailPage";
import ContactsPage from "./pages/ContactsPage";
import GalleryPage from "./pages/GalleryPage";
import TransparencyPage from "./pages/TransparencyPage";
import NotFoundPage from "./pages/NotFoundPage";
import CabinetComingSoonPage from "./pages/CabinetComingSoonPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                {/* Публичные страницы */}
                <Route path="/" element={<HomePage />} />
                <Route path="/page/:slug" element={<StaticPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/tenders" element={<TendersPage />} />
                <Route path="/tenders/:id" element={<TenderDetailPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/transparency/:slug?" element={<TransparencyPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/cabinet" element={<CabinetComingSoonPage />} />

                {/* Админка */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* 404 — должен быть последним */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;