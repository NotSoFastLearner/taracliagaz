import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../context/LanguageSwitcher';
import { prefetchCache } from '../hooks/useCachedFetch';
import {
    getPage, getNews, getAnnouncements, getTenders, getGallery,
} from '../api/contentApi';
import type { MenuItem } from '../types/content';

interface HeaderProps {
    menuItems?: MenuItem[];
}

/**
 * Предзагрузка при наведении/фокусе на пункт меню:
 * 1) JS-чанк страницы (ленивый import — браузер кладёт его в кэш);
 * 2) данные страницы в SWR-кэш (localStorage).
 * К моменту клика страница рендерится мгновенно.
 */
const pageChunks: Record<string, () => Promise<unknown>> = {
    '/news': () => import('../pages/NewsPage'),
    '/announcements': () => import('../pages/AnnouncementsPage'),
    '/tenders': () => import('../pages/TendersPage'),
    '/gallery': () => import('../pages/GalleryPage'),
    '/contacts': () => import('../pages/ContactsPage'),
    '/transparency': () => import('../pages/TransparencyPage'),
    '/cabinet': () => import('../pages/CabinetComingSoonPage'),
};

function prefetchForPath(path: string, language: string): void {
    if (!path || path === '#') return;

    // JS-чанк страницы
    const basePath = path.startsWith('/page/')
        ? '/page'
        : path;
    if (basePath === '/page') {
        void import('../pages/StaticPage');
    } else {
        void pageChunks[basePath]?.();
    }

    // Данные страницы — в тот же кэш, что читают страницы
    if (path.startsWith('/page/')) {
        const slug = path.split('/').filter(Boolean).pop() ?? '';
        if (slug) {
            prefetchCache(`page:${slug}:${language}`, () => getPage(slug, language));
        }
    } else if (path === '/news') {
        prefetchCache(`news:${language}`, () => getNews(language));
    } else if (path === '/announcements') {
        prefetchCache(`announcements:${language}`, () => getAnnouncements(language));
    } else if (path === '/tenders') {
        prefetchCache(`tenders:${language}`, () => getTenders(language));
    } else if (path === '/gallery') {
        prefetchCache('gallery', () => getGallery());
    }
}

export default function Header({ menuItems = [] }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const { language, t } = useLanguage();

    const prefetch = (path: string) => () => prefetchForPath(path, language);

    const toggleDropdown = (key: string) => {
        setOpenDropdown(openDropdown === key ? null : key);
    };

    const closeAll = () => {
        setOpenDropdown(null);
        setMenuOpen(false);
    };

    const itemKey = (item: MenuItem) => `${item.path}|${item.label}`;

    return (
        <header className="site-header">
            <div className="container header-inner">
                {/* Логотип */}
                <Link to="/" className="logo" onClick={closeAll}>
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
                    aria-label={t('menu.title')}
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Навигация */}
                <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li
                                key={itemKey(item)}
                                className={`nav-item ${openDropdown === itemKey(item) ? 'open' : ''}`}
                            >
                                {item.children && item.children.length > 0 ? (
                                    <>
                                        <button
                                            type="button"
                                            className="nav-link dropdown-toggle"
                                            onClick={() => toggleDropdown(itemKey(item))}
                                            aria-expanded={openDropdown === itemKey(item)}
                                        >
                                            {item.label}
                                            <span className="dropdown-arrow">▼</span>
                                        </button>
                                        <ul className="dropdown-menu">
                                            {item.children.map((child) => (
                                                <li key={itemKey(child)}>
                                                    {child.external ? (
                                                        <a
                                                            href={child.path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="dropdown-link"
                                                            onClick={closeAll}
                                                        >
                                                            {child.label}
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            to={child.path}
                                                            className="dropdown-link"
                                                            onClick={closeAll}
                                                            onMouseEnter={prefetch(child.path)}
                                                            onFocus={prefetch(child.path)}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : item.external ? (
                                    <a
                                        href={item.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="nav-link"
                                        onClick={closeAll}
                                    >
                                        {item.label}
                                    </a>
                                ) : item.path === '#' ? (
                                    <span className="nav-link nav-link-static">{item.label}</span>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                        onClick={closeAll}
                                        onMouseEnter={prefetch(item.path)}
                                        onFocus={prefetch(item.path)}
                                    >
                                        {item.label}
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
