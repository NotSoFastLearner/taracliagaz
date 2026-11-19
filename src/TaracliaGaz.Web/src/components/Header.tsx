import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../context/LanguageSwitcher';
import { IconFire, IconSearch, IconClose } from './icons';
import { prefetchProps } from '../utils/prefetch';
import { searchSite, type SearchResultItem } from '../api/contentApi';
import type { MenuItem } from '../types/content';

interface HeaderProps {
    menuItems?: MenuItem[];
}

export default function Header({ menuItems = [] }: HeaderProps) {
    const headerRef = useRef<HTMLElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [searching, setSearching] = useState(false);
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
                setSearchOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpenDropdown(null);
                setMenuOpen(false);
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    useEffect(() => {
        const trimmed = query.trim();
        if (!searchOpen || trimmed.length < 2) {
            return;
        }
        const timer = window.setTimeout(() => {
            searchSite(trimmed, language)
                .then((data) => setResults(data))
                .catch(() => setResults([]))
                .finally(() => setSearching(false));
        }, 250);
        return () => window.clearTimeout(timer);
    }, [query, language, searchOpen]);

    const handleSearchInput = (value: string) => {
        setQuery(value);
        if (value.trim().length < 2) {
            setResults([]);
            setSearching(false);
        } else {
            setSearching(true);
        }
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
        setSearching(false);
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(openDropdown === key ? null : key);
    };

    const closeAll = () => {
        setOpenDropdown(null);
        setMenuOpen(false);
        closeSearch();
    };

    const itemKey = (item: MenuItem) => `${item.path}|${item.label}`;

    return (
        <header className="site-header" ref={headerRef}>
            <div className="container header-inner">
                {/* Кнопка мобильного меню */}
                <button
                    type="button"
                    className={`menu-toggle ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={t('menu.title')}
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Логотип */}
                <Link to="/" className="logo" onClick={closeAll}>
                    <span className="logo-mark" aria-hidden="true">
                        <IconFire width={22} height={22} />
                    </span>
                    <span className="logo-text">
                        <span className="logo-main">{t('home.heroTitle')}</span>
                        <span className="logo-sub">SRL «Taraclia Gaz»</span>
                    </span>
                </Link>

                {/* Навигация */}
                <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
                    <div className="mobile-nav-header">
                        <span className="mobile-nav-title">{t('menu.title')}</span>
                        <button
                            type="button"
                            className="mobile-nav-close"
                            onClick={closeAll}
                            aria-label={t('close')}
                        >
                            <IconClose width={18} height={18} />
                        </button>
                    </div>
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
                                            <svg
                                                className="dropdown-arrow"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
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
                                                            {...prefetchProps(child.path, language)}
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
                                        {...prefetchProps(item.path, language)}
                                    >
                                        {item.label}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Действия справа: поиск, язык, аварийная служба */}
                <div className="header-actions">
                    <button
                        type="button"
                        className={`header-search-btn ${searchOpen ? 'active' : ''}`}
                        onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                        aria-label={t('search.button')}
                        aria-expanded={searchOpen}
                        title={t('search.button')}
                    >
                        <IconSearch width={18} height={18} />
                    </button>

                    <LanguageSwitcher />

                    <a href="tel:904" className="emergency-btn">
                        <span className="emergency-label">{t('emergency.label')}</span>
                        <span className="emergency-number">
                            <IconFire width={14} height={14} /> 904
                        </span>
                    </a>
                </div>
            </div>

            {menuOpen && (
                <div
                    className="mobile-nav-backdrop"
                    onClick={closeAll}
                    aria-hidden="true"
                />
            )}

            {searchOpen && (
                <div className="search-drawer">
                    <div className="container">
                        <div className="search-bar">
                            <input
                                type="search"
                                className="search-input"
                                value={query}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder={t('search.placeholder')}
                                aria-label={t('search.button')}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="search-close-btn"
                                onClick={closeSearch}
                                aria-label={t('close')}
                            >
                                <IconClose width={18} height={18} />
                            </button>
                        </div>

                        {query.trim().length >= 2 && (
                            <div className="search-results">
                                {searching ? (
                                    <p className="search-status">{t('common.loading')}</p>
                                ) : results.length === 0 ? (
                                    <p className="search-status">{t('search.empty')}</p>
                                ) : (
                                    <ul className="search-list">
                                        {results.map((r) => (
                                            <li key={`${r.type}-${r.id}`}>
                                                <button
                                                    type="button"
                                                    className="search-item-btn"
                                                    onClick={() => {
                                                        navigate(r.url);
                                                        closeAll();
                                                    }}
                                                >
                                                    <div className="search-item-header">
                                                        <span className={`search-type-badge type-${r.type}`}>
                                                            {t(`search.type.${r.type}`)}
                                                        </span>
                                                        <span className="search-item-title">{r.title}</span>
                                                    </div>
                                                    {r.snippet && (
                                                        <div className="search-item-snippet">
                                                            {r.snippet}
                                                        </div>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
