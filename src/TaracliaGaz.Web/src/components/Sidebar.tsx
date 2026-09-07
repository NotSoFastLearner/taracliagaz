import { NavLink } from "react-router-dom";
import type { NavItem } from "./Header";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

export function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="hamburger" onClick={onClick} aria-label="Открыть меню">
      <span />
      <span />
      <span />
    </button>
  );
}

export default function Sidebar({ isOpen, onClose, items }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Меню</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Закрыть меню">
            ×
          </button>
        </div>
        <ul className="sidebar-list">
          {items.map((item, index) =>
            item.children ? (
              <li key={index}>
                <span className="sidebar-group">{item.label}</span>
                <ul>
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <NavLink to={child.to} onClick={onClose}>
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={item.to}>
                <NavLink to={item.to} onClick={onClose}>
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
