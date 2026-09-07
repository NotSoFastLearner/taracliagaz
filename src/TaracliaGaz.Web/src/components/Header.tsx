import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Sidebar, { HamburgerButton } from "./Sidebar";

const navItems = [
  { to: "/", label: "Главная" },
  {
    label: "О Нас",
    children: [
      { to: "/page/history", label: "История" },
      { to: "/page/leadership", label: "Структура и руководство" },
    ],
  },
  { to: "/page/services", label: "Услуги" },
  {
    label: "Потребителям",
    children: [
      { to: "/page/tariffs", label: "Тарифы" },
      { to: "/page/legislation", label: "Законодательство" },
      { to: "/page/faq", label: "Вопросы-Ответы" },
      { to: "/page/safety", label: "Правила безопасности" },
      { to: "/page/contracts", label: "ДОГОВОРА" },
      { to: "/page/network-development", label: "Руководство по процедуре развития сетей" },
    ],
  },
  { to: "/tenders", label: "Тендеры" },
  {
    label: "Новости",
    children: [
      { to: "/news", label: "новости" },
      { to: "/gallery", label: "Галерея" },
    ],
  },
  { to: "/announcements", label: "ОБЪЯВЛЕНИЯ" },
  { to: "/transparency", label: "Прозрачность" },
  { to: "/contacts", label: "Контакты" },
];

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <HamburgerButton onClick={() => setSidebarOpen(true)} />
          <Link to="/" className="brand">
            <span className="brand-title">Тараклия-ГАЗ</span>
          </Link>
        </div>
      </header>
      <nav className="main-nav">
        <div className="container">
          <ul className="nav-list">
            {navItems.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className="nav-item has-dropdown"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <span className="nav-link">{item.label}</span>
                  {openDropdown === item.label && (
                    <ul className="dropdown">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <NavLink to={child.to} className={({ isActive }) => (isActive ? "active" : "")}>
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.to} className="nav-item">
                  <NavLink to={item.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                    {item.label}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </div>
      </nav>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={navItems} />
    </>
  );
}

export type NavItem =
  | { to: string; label: string; children?: undefined }
  | { label: string; children: Array<{ to: string; label: string }>; to?: undefined };
