import { lazy, Suspense } from "react";
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

// Админка (тяжёлый редактор TipTap и менеджеры) грузится лениво,
// отдельным чанком — не тормозит публичные страницы
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

function AdminFallback() {
    return <p style={{ padding: "2rem" }}>Загрузка...</p>;
}

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                {/* Публичные страницы */}
                <Route path="/" element={<HomePage />} />
                <Route path="/page/*" element={<StaticPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/tenders" element={<TendersPage />} />
                <Route path="/tenders/:id" element={<TenderDetailPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/transparency/:slug?" element={<TransparencyPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/cabinet" element={<CabinetComingSoonPage />} />

                {/* Админка — ленивая загрузка */}
                <Route
                    path="/admin/login"
                    element={
                        <Suspense fallback={<AdminFallback />}>
                            <AdminLoginPage />
                        </Suspense>
                    }
                />
                <Route
                    path="/admin/*"
                    element={
                        <Suspense fallback={<AdminFallback />}>
                            <ProtectedRoute>
                                <AdminDashboardPage />
                            </ProtectedRoute>
                        </Suspense>
                    }
                />

                {/* 404 — должен быть последним */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
