import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import StaticPage from "./pages/StaticPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import TendersPage from "./pages/TendersPage";
import ContactsPage from "./pages/ContactsPage";
import GalleryPage from "./pages/GalleryPage";
import TransparencyPage from "./pages/TransparencyPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/page/:slug" element={<StaticPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/tenders" element={<TendersPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/transparency/:slug?" element={<TransparencyPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/*" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
