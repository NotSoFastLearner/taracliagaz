import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import type { MenuItem } from "../types/content";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    items: MenuItem[];
}

export default function Sidebar({ isOpen, onClose, items }: SidebarProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const { t } = useLanguage();

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(label)) {
                next.delete(label);
            } else {
                next.add(label);
            }
            return next;
        });
    };

    const isExpanded = (label: string) => expandedItems.has(label);

    return (
        <>
            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
            <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label={t('menu.title')}>
                <div className="sidebar-header">
                    <span className="sidebar-title">{t('menu.title')}</span>
                    <button
                        onClick={onClose}
                        className="sidebar-close"
                        aria-label={t('menu.close')}
                    >
                        ✕
                    </button>
                </div>
                <ul className="sidebar-list">
                    {items.map((item) =>
                        item.children && item.children.length > 0 ? (
                            <li key={item.label} className="sidebar-dropdown">
                                <button
                                    type="button"
                                    className={`sidebar-group ${isExpanded(item.label) ? "expanded" : ""}`}
                                    onClick={() => toggleExpand(item.label)}
                                    aria-expanded={isExpanded(item.label)}
                                >
                                    {item.label}
                                    <span className="sidebar-arrow" aria-hidden="true">
                                        {isExpanded(item.label) ? "▲" : "▼"}
                                    </span>
                                </button>
                                {isExpanded(item.label) && (
                                    <ul className="sidebar-submenu">
                                        {item.children.map((child) =>
                                            child.external ? (
                                                <li key={child.path}>
                                                    <a
                                                        href={child.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="sidebar-link"
                                                        onClick={onClose}
                                                    >
                                                        {child.label}
                                                    </a>
                                                </li>
                                            ) : (
                                                <li key={child.path}>
                                                    <NavLink
                                                        to={child.path}
                                                        className={({ isActive }) =>
                                                            `sidebar-link ${isActive ? "active" : ""}`
                                                        }
                                                        onClick={onClose}
                                                    >
                                                        {child.label}
                                                    </NavLink>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                            </li>
                        ) : (
                            item.external ? (
                                <li key={item.path}>
                                    <a
                                        href={item.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sidebar-link"
                                        onClick={onClose}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ) : (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `sidebar-link ${isActive ? "active" : ""}`
                                        }
                                        onClick={onClose}
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            )
                        )
                    )}
                </ul>
            </aside>
        </>
    );
}

export function HamburgerButton({ onClick, isOpen }: { onClick: () => void; isOpen?: boolean }) {
    const { t } = useLanguage();
    return (
        <button
            className={`hamburger ${isOpen ? "open" : ""}`}
            onClick={onClick}
            aria-label={t('menu.open')}
            aria-expanded={isOpen}
        >
            <span></span>
            <span></span>
            <span></span>
        </button>
    );
}