import type { MenuCategory } from "../types/content";
import type { NavItem } from "../components/Header";

/**
 * Преобразует плоский список MenuCategory из БД
 * в дерево NavItem для Header
 */
export function buildMenuTree(items: MenuCategory[]): NavItem[] {
    const map = new Map<number, NavItem & { _parentId: number | null }>();
    const roots: NavItem[] = [];

    // Первый проход — создаём узлы
    items.forEach((item) => {
        map.set(item.id, {
            to: item.slug.startsWith("/") ? item.slug : `/${item.slug}`,
            label: item.title,
            children: [],
            _parentId: item.parentId,
        });
    });

    // Второй проход — строим дерево
    items.forEach((item) => {
        const node = map.get(item.id)!;
        if (item.parentId === null) {
            roots.push(node);
        } else {
            const parent = map.get(item.parentId);
            if (parent && parent.children) {
                parent.children.push(node);
            }
        }
    });

    // Убираем служебное поле _parentId и очищаем пустые children
    const clean = (nodes: NavItem[]): NavItem[] =>
        nodes.map((n) => {
            const node = n as any;
            delete node._parentId;
            if (n.children && n.children.length === 0) {
                delete n.children;
            } else if (n.children) {
                n.children = clean(n.children);
            }
            return n;
        });

    return clean(roots);
}