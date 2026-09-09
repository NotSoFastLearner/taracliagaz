import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import Sidebar, { HamburgerButton } from "./Sidebar";
import { getMenu } from "../api/contentApi";
import type { MenuCategory } from "../types/content";
import { buildMenuTree } from "../utils/menuHelpers";

export type NavItem =
    | { to: string; label: string; children?: undefined }
    | { label: string; children: Array<{ to: string; label: string }>; to?: undefined };

const FALLBACK_NAV: NavItem[] = [
    { to: "/", label: "Главная" },
    {
        label: "О нас", children: [
            { to: "/page/history", label: "История" },
            { to: "/page/leadership", label: "Структура и руководство" },
        ]
    },
    { to: "/page/services", label: "Услуги" },
    {
        label: "Потребителям", children: [
            { to: "/page/tariffs", label: "Тарифы" },
            { to: "/page/legislation", label: "Законодательство" },
            { to: "/page/faq", label: "Вопросы-Ответы" },
            { to: "/page/safety", label: "Правила безопасности" },
            { to: "/page/contracts", label: "Договоры" },
            { to: "/page/network-development", label: "Руководство по процедуре развития сетей" },
        ]
    },
    { to: "/tenders", label: "Тендеры" },
    {
        label: "Новости", children: [
            { to: "/news", label: "Новости" },
            { to: "/gallery", label: "Галерея" },
        ]
    },
    { to: "/announcements", label: "Объявления" },
    { to: "/transparency", label: "Прозрачность" },
    { to: "/contacts", label: "Контакты" },
];

export default function Header() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_NAV);
    const [loading, setLoading] = useState(true);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        getMenu("ru")
            .then((items: MenuCategory[]) => {
                if (items.length > 0) {
                    setNavItems(buildMenuTree(items));
                }
            })
            .catch((err) => {
                console.error("Не удалось загрузить меню:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    // Закрытие dropdown по Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    // Закрытие dropdown по клику вне навигации
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (label: string) => {
        setOpenDropdown(openDropdown === label ? null : label);
    };

    return (
        <>
            <header className="header">
                <div className="container header-inner">
                    <Link to="/" className="brand">
                        <div>
                            <div className="brand-title">Тараклия-ГАЗ</div>
                            <div className="brand-subtitle">SRL «Taraclia Gaz»</div>
                        </div>
                    </Link>

                    <a href="tel:904" className="header-emergency">
                        <span className="header-emergency-label">Аварийная служба 24/7</span>
                        <strong className="header-emergency-number">904</strong>
                    </a>

                    <HamburgerButton onClick={() => setSidebarOpen(true)} />
                </div>
            </header>

            <nav className="main-nav" ref={navRef}>
                <div className="container">
                    {loading ? (
                        <ul className="nav-list">
                            <li className="nav-item"><span className="nav-link">Загрузка меню...</span></li>
                        </ul>
                    ) : (
                        <ul className="nav-list">
                            {navItems.map((item) =>
                                item.children ? (
                                    <li key={item.label} className="nav-item has-dropdown">
                                        <button
                                            type="button"
                                            className={`dropdown-toggle ${openDropdown === item.label ? "active" : ""}`}
                                            onClick={() => toggleDropdown(item.label)}
                                            aria-expanded={openDropdown === item.label}
                                            aria-haspopup="true"
                                        >
                                            {item.label}
                                            <span className="dropdown-arrow" aria-hidden="true">▼</span>
                                        </button>
                                        {openDropdown === item.label && (
                                            <ul className="dropdown">
                                                {item.children.map((child) => (
                                                    <li key={child.to}>
                                                        <NavLink
                                                            to={child.to}
                                                            className={({ isActive }) => (isActive ? "active" : "")}
                                                            onClick={() => setOpenDropdown(null)}
                                                        >
                                                            {child.label}
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ) : (
                                    <li key={item.to} className="nav-item">
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                                        >
                                            {item.label}
                                        </NavLink>
                                    </li>
                                )
                            )}
                        </ul>
                    )}
                </div>
            </nav>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={navItems} />
        </>
    );
}