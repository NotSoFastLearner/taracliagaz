import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { downloadDatabaseBackup, getContactsAdmin } from "../../api/adminApi";
import { changePassword } from "../../api/authApi";

const GalleryManager = lazy(() => import("./GalleryManager"));
const DocumentsManager = lazy(() => import("./DocumentsManager"));
const NewsManager = lazy(() => import("./NewsManager"));
const PagesManager = lazy(() => import("./PagesManager"));
const MenuManager = lazy(() => import("./MenuManager"));
const AnnouncementsManager = lazy(() => import("./AnnouncementsManager"));
const TendersManager = lazy(() => import("./TendersManager"));
const ContactsManager = lazy(() => import("./ContactsManager"));

function extractErrorMessage(err: unknown, fallback: string): string {
    if (!(err instanceof Error)) return fallback;
    try {
        const parsed = JSON.parse(err.message);
        if (typeof parsed?.detail === "string") return parsed.detail;
        if (Array.isArray(parsed?.detail) && parsed.detail[0]?.msg) return String(parsed.detail[0].msg);
    } catch {
        // Not JSON; fall through to raw error message
    }
    return err.message || fallback;
}

function DashboardHome({ unreadCount }: { unreadCount: number }) {
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupError, setBackupError] = useState("");
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");

    async function handleBackup() {
        setBackupError("");
        setBackupLoading(true);
        try {
            await downloadDatabaseBackup();
        } catch (err) {
            setBackupError(extractErrorMessage(err, "Не удалось скачать резервную копию"));
        } finally {
            setBackupLoading(false);
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPwdError("");
        setPwdSuccess("");
        if (newPassword !== confirmPassword) {
            setPwdError("Новый пароль и подтверждение не совпадают");
            return;
        }
        setPwdSaving(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            if (res.access_token) {
                localStorage.setItem("taracliagaz_auth", res.access_token);
            }
            setPwdSuccess(res.message || "Пароль успешно изменён");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setPwdError(extractErrorMessage(err, "Не удалось сменить пароль"));
        } finally {
            setPwdSaving(false);
        }
    }

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
                <li>
                    <Link to="/admin/menu">Меню</Link>
                </li>
                <li>
                    <Link to="/admin/contacts">
                        Обратная связь
                        {unreadCount > 0 && <span className="admin-badge" style={{ marginLeft: "6px" }}>{unreadCount}</span>}
                    </Link>
                </li>
            </ul>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e0e0e0" }}>
                <h3>Обслуживание и безопасность</h3>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                    <button type="button" onClick={handleBackup} disabled={backupLoading}>
                        {backupLoading ? "Создание копии..." : "💾 Скачать резервную копию БД (SQLite)"}
                    </button>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                            setShowPwdForm((prev) => !prev);
                            setPwdError("");
                            setPwdSuccess("");
                        }}
                    >
                        🔑 Сменить пароль администратора
                    </button>
                </div>

                {backupError && (
                    <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>
                        {backupError}
                    </div>
                )}

                {showPwdForm && (
                    <form
                        onSubmit={handlePasswordSubmit}
                        style={{
                            marginTop: "1rem",
                            maxWidth: "420px",
                            padding: "1rem",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            background: "#fafafa",
                        }}
                    >
                        {pwdError && <div className="alert alert-error">{pwdError}</div>}
                        {pwdSuccess && <div className="alert alert-success">{pwdSuccess}</div>}
                        <div className="form-field">
                            <label htmlFor="admin-current-pwd">Текущий пароль</label>
                            <input
                                id="admin-current-pwd"
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="admin-new-pwd">Новый пароль (мин. 12 символов, A-z и цифра)</label>
                            <input
                                id="admin-new-pwd"
                                type="password"
                                required
                                minLength={12}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="admin-confirm-pwd">Подтвердите новый пароль</label>
                            <input
                                id="admin-confirm-pwd"
                                type="password"
                                required
                                minLength={12}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button type="submit" disabled={pwdSaving}>
                                {pwdSaving ? "Сохранение..." : "Сохранить пароль"}
                            </button>
                            <button type="button" className="secondary" onClick={() => setShowPwdForm(false)}>
                                Отмена
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

const ADMIN_NAV_LINKS = [
    { to: "/admin", label: "Обзор", end: true },
    { to: "/admin/pages", label: "Страницы" },
    { to: "/admin/news", label: "Новости" },
    { to: "/admin/announcements", label: "Объявления" },
    { to: "/admin/tenders", label: "Тендеры" },
    { to: "/admin/documents", label: "Документы" },
    { to: "/admin/gallery", label: "Галерея" },
    { to: "/admin/menu", label: "Меню" },
    { to: "/admin/contacts", label: "Обратная связь", showUnread: true },
];

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        getContactsAdmin(true)
            .then((list) => {
                if (!cancelled) setUnreadCount(list.length);
            })
            .catch(() => {
                // ignore background badge refresh errors
            });
        return () => {
            cancelled = true;
        };
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("taracliagaz_auth");
        navigate("/admin/login", { replace: true });
    };

    return (
        <section className="section admin-dashboard">
            <div className="container">
                <div className="admin-topbar">
                    <h1>Панель управления</h1>
                    <button type="button" className="admin-logout-btn" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>

                <nav className="admin-nav" aria-label="Навигация по админ-панели">
                    {ADMIN_NAV_LINKS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                        >
                            {item.label}
                            {item.showUnread && unreadCount > 0 && (
                                <span className="admin-badge">{unreadCount}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <Suspense fallback={<p>Загрузка раздела...</p>}>
                    <Routes>
                        <Route path="/" element={<DashboardHome unreadCount={unreadCount} />} />
                        <Route path="/news" element={<NewsManager />} />
                        <Route path="/announcements" element={<AnnouncementsManager />} />
                        <Route path="/tenders" element={<TendersManager />} />
                        <Route path="/gallery" element={<GalleryManager />} />
                        <Route path="/documents" element={<DocumentsManager />} />
                        <Route path="/pages" element={<PagesManager />} />
                        <Route path="/menu" element={<MenuManager />} />
                        <Route path="/contacts" element={<ContactsManager />} />
                    </Routes>
                </Suspense>
            </div>
        </section>
    );
}