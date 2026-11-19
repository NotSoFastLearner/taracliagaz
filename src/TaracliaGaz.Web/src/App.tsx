import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";

// Все страницы, кроме главной, грузятся лениво — отдельными чанками.
// Начальный бандл худеет, первый экран рисуется быстрее.
// Чанки подгружаются заранее при наведении на пункт меню (см. Header).
const StaticPage = lazy(() => import("./pages/StaticPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const TendersPage = lazy(() => import("./pages/TendersPage"));
const TenderDetailPage = lazy(() => import("./pages/TenderDetailPage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const TransparencyPage = lazy(() => import("./pages/TransparencyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Админка (тяжёлый редактор TipTap и менеджеры) грузится лениво,
// отдельным чанком — не тормозит публичные страницы
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

function PageFallback() {
    // Пустой блок высотой с контент — без мелькания «Загрузка...»
    // на долю секунды; шапка и каркас уже видны
    return <div style={{ minHeight: "60vh" }} aria-hidden="true" />;
}

function AdminFallback() {
    return <p style={{ padding: "2rem" }}>Загрузка...</p>;
}

/** Обёртка для ленивых публичных страниц */
const S = (el: ReactNode) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                {/* Публичные страницы */}
                <Route path="/" element={<HomePage />} />
                <Route path="/page/*" element={S(<StaticPage />)} />
                <Route path="/news" element={S(<NewsPage />)} />
                <Route path="/news/:id" element={S(<NewsDetailPage />)} />
                <Route path="/announcements" element={S(<AnnouncementsPage />)} />
                <Route path="/tenders" element={S(<TendersPage />)} />
                <Route path="/tenders/:id" element={S(<TenderDetailPage />)} />
                <Route path="/gallery" element={S(<GalleryPage />)} />
                <Route path="/transparency/:slug?" element={S(<TransparencyPage />)} />
                <Route path="/contacts" element={S(<ContactsPage />)} />

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
                <Route path="*" element={S(<NotFoundPage />)} />
            </Route>
        </Routes>
    );
}

export default App;
