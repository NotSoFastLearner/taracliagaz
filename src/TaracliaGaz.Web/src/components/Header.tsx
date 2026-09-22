import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export interface MenuItem {
    label: string;
    path: string;
    children?: MenuItem[];
    external?: boolean;
}

// Только нужные пункты меню (без демо-пунктов Joomla-шаблона)
const menuItems: MenuItem[] = [
    { label: "Главная", path: "/" },
    {
        label: "О нас",
        path: "/page/about",
        children: [
            { label: "История", path: "/page/istoriya" },
            { label: "Структура и руководство", path: "/page/struktura-i-rukovodstvo" },
        ],
    },
    {
        label: "Потребителям",
        path: "/page/potrebiteli",
        children: [
            { label: "Услуги", path: "/page/uslugi" },
            { label: "Законодательство", path: "/page/zakonodatelstvo" },
            { label: "Вопросы-Ответы", path: "/page/voproy-otvety" },
            { label: "Правила безопасности", path: "/page/pravila-polzovaniya-gazom-v-bytu" },
            { label: "ДОГОВОРА", path: "/page/dogovora" },
            { label: "Руководство по процедуре развития сетей", path: "/page/rukovodstvo-po-protsedure-razvitiya-setej-raspredeleniya-osd" },
        ],
    },
    { label: "Тендеры", path: "/tenders" },
    {
        label: "Новости",
        path: "/news",
        children: [
            { label: "Галерея", path: "/gallery" },
            { label: "Новости", path: "/news" },
        ],
    },
    { label: "Контакты", path: "/contacts" },
    { label: "ОБЪЯВЛЕНИЯ", path: "/announcements" },
    {
        label: "Прозрачность",
        path: "/transparency",
        children: [
            { label: "Технико-экономические показатели", path: "/page/tekhniko-ekonomicheskie-pokazateli-za-2026g" },
            { label: "Инвестиционный план", path: "/page/investitsionnyj-plan-na-2026-god" },
            { label: "Программа соответствия", path: "/page/programma-sootvetstviya-2026g" },
            { label: "Финансовое состояние", path: "/page/finansovoe-sostoyanie-ooo-tarakliya-gaz-na-period-01-yanvarya-31-dekabrya-2021" },
            { label: "Отчет независимого аудитора", path: "/page/otchet-nezavisimogo-auditora" },
            { label: "Вакансии", path: "/page/vakansii" },
            { label: "УСТАВ", path: "/page/ustav" },
            { label: "Список крупных небытовых потребителей", path: "/page/spisok-krupnykh-nebytovykh-potrebitelej" },
            { label: "Список прерываемых потребителей", path: "/page/spisok-preryvaemykh-potrebitelej" },
            { label: "Плановые и внеплановые отключения", path: "/page/planovye-i-neplanovye-otklyucheniya-za-2025g" },
        ],
    },
    { label: "Линия „ANTIFRAUDĂ", path: "https://www.moldovagaz.md/rus/goryachaya-liniya", external: true },
    { label: "Показание Счетчика", path: "https://www.moldovagaz.md/rus/potrebiteli/usluga-onlayn-peredachi-dannyh-schetchika", external: true },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const toggleDropdown = (label: string) => {
        setOpenDropdown(openDropdown === label ? null : label);
    };

    const closeMenu = () => {
        setMenuOpen(false);
        setOpenDropdown(null);
    };

    return (
        <header className="site-header">
            <div className="container header-inner">
                {/* Логотип */}
                <Link to="/" className="logo" onClick={closeMenu}>
                    <span className="logo-main">Тараклия-ГАЗ</span>
                    <span className="logo-sub">SRL «Taraclia Gaz»</span>
                </Link>

                {/* Кнопка аварийной службы */}
                <a href="tel:904" className="emergency-btn">
                    <span className="emergency-label">Аварийная служба 24/7</span>
                    <span className="emergency-number">904</span>
                </a>

                {/* Кнопка мобильного меню */}
                <button
                    className={`menu-toggle ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Меню"
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Главное меню */}
                <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
                    <ul className="nav-list">
                        {menuItems.map((item) => {
                            const hasChildren = item.children && item.children.length > 0;

                            if (item.external) {
                                return (
                                    <li key={item.label} className="nav-item">
                                        <a
                                            href={item.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="nav-link external"
                                            onClick={closeMenu}
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                );
                            }

                            if (hasChildren) {
                                return (
                                    <li
                                        key={item.label}
                                        className={`nav-item has-dropdown ${openDropdown === item.label ? "open" : ""}`}
                                        onMouseEnter={() => setOpenDropdown(item.label)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        <button
                                            className="nav-link dropdown-toggle"
                                            onClick={() => toggleDropdown(item.label)}
                                            aria-expanded={openDropdown === item.label}
                                        >
                                            {item.label}
                                            <span className="dropdown-arrow">▼</span>
                                        </button>
                                        <ul className="dropdown-menu">
                                            {item.children!.map((child) => (
                                                <li key={child.path}>
                                                    <NavLink
                                                        to={child.path}
                                                        className="dropdown-link"
                                                        onClick={closeMenu}
                                                    >
                                                        {child.label}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                );
                            }

                            return (
                                <li key={item.label} className="nav-item">
                                    <NavLink
                                        to={item.path}
                                        className="nav-link"
                                        onClick={closeMenu}
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </header>
    );
}