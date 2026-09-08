import type { MenuCategory } from "../types/content";
import type { NavItem } from "../components/Header";

/**
 * Внутренний тип для построения дерева меню.
 * Содержит дополнительные служебные поля.
 */
interface MenuTreeNode {
    id: number;
    to: string;
    label: string;
    parentId: number | null;
    children: MenuTreeNode[];
}

/**
 * Преобразует плоский список MenuCategory из БД
 * в дерево NavItem для Header
 */
export function buildMenuTree(items: MenuCategory[]): NavItem[] {
    // 1. Создаём карту узлов
    const nodeMap = new Map<number, MenuTreeNode>();
    const roots: MenuTreeNode[] = [];

    items.forEach((item) => {
        nodeMap.set(item.id, {
            id: item.id,
            to: item.slug.startsWith("/") ? item.slug : `/${item.slug}`,
            label: item.title,
            parentId: item.parentId,
            children: [],
        });
    });

    // 2. Строим дерево
    items.forEach((item) => {
        const node = nodeMap.get(item.id);
        if (!node) return;

        if (item.parentId === null) {
            roots.push(node);
        } else {
            const parent = nodeMap.get(item.parentId);
            if (parent) {
                parent.children.push(node);
            }
        }
    });

    // 3. Преобразуем в NavItem (убираем служебные поля)
    const toNavItem = (node: MenuTreeNode): NavItem => {
        if (node.children.length === 0) {
            // Листовой узел — ссылка
            return {
                to: node.to,
                label: node.label,
            };
        } else {
            // Узел с детьми — dropdown
            return {
                label: node.label,
                children: node.children.map((child) => ({
                    to: child.to,
                    label: child.label,
                })),
            };
        }
    };

    return roots.map(toNavItem);
}