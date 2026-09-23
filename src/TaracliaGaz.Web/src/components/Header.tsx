import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../context/LanguageSwitcher';
import type { MenuItem } from '../types/content';

interface HeaderProps {
    menuItems?: MenuItem[];  // ← делаем опциональным
}

export default function Header({ menuItems = [] }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const { t } = useLanguage();

    const toggleDropdown = (slug: string) => {
        setOpenDropdown(openDropdown === slug ? null : slug);
    };

    return (
        <header className="site-header">
            <div className="container header-inner">
                {/* Логотип */}
                <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
                    <span className="logo-main">Тараклия-ГАЗ</span>
                    <span className="logo-sub">SRL «Taraclia Gaz»</span>
                </Link>

                {/* Кнопка аварийной службы */}
                <a href="tel:904" className="emergency-btn">
                    <span className="emergency-label">{t('emergency.label')}</span>
                    <span className="emergency-number">904</span>
                </a>

                {/* Переключатель языка */}
                <LanguageSwitcher />

                {/* Кнопка мобильного меню */}
                <button
                    className={`menu-toggle ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Меню"
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Навигация */}
                <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
                    <ul className="nav-list">
                        {/* Защита от undefined через menuItems?.map() или menuItems = [] */}
                        {menuItems.map((item) => (
                            <li
                                key={item.slug}
                                className={`nav-item ${openDropdown === item.slug ? 'open' : ''}`}
                            >
                                {item.children && item.children.length > 0 ? (
                                    <>
                                        <button
                                            className="nav-link dropdown-toggle"
                                            onClick={() => toggleDropdown(item.slug)}
                                        >
                                            {item.title}
                                            <span className="dropdown-arrow">▼</span>
                                        </button>
                                        <ul className="dropdown-menu">
                                            {item.children.map((child) => (
                                                <li key={child.slug}>
                                                    <Link
                                                        to={child.url || `/page/${child.slug}`}
                                                        className="dropdown-link"
                                                        onClick={() => {
                                                            setOpenDropdown(null);
                                                            setMenuOpen(false);
                                                        }}
                                                    >
                                                        {child.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <NavLink
                                        to={item.url || `/page/${item.slug}`}
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {item.title}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}