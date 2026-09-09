// src/TaracliaGaz.Web/src/components/Sidebar.tsx

import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { NavItem } from "./Header";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    items: NavItem[];
}

export default function Sidebar({ isOpen, onClose, items }: SidebarProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
            <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Главное меню">
                <div className="sidebar-header">
                    <span className="sidebar-title">Меню</span>
                    <button
                        onClick={onClose}
                        className="sidebar-close"
                        aria-label="Закрыть меню"
                    >
                        ✕
                    </button>
                </div>
                <ul className="sidebar-list">
                    {items.map((item) =>
                        item.children ? (
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
                                        {item.children.map((child) => (
                                            <li key={child.to}>
                                                <NavLink
                                                    to={child.to}
                                                    className={({ isActive }) =>
                                                        `sidebar-link ${isActive ? "active" : ""}`
                                                    }
                                                    onClick={onClose}
                                                >
                                                    {child.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ) : (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? "active" : ""}`
                                    }
                                    onClick={onClose}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        )
                    )}
                </ul>
            </aside>
        </>
    );
}

export function HamburgerButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            className="hamburger"
            onClick={onClick}
            aria-label="Открыть меню"
            aria-expanded="false"
        >
            <span></span>
            <span></span>
            <span></span>
        </button>
    );
}