import type { MenuCategory, MenuItem } from "../types/content";

/**
 * Внутренний тип для построения дерева меню.
 * Содержит дополнительные служебные поля.
 */
interface MenuTreeNode {
    id: number;
    to: string;
    label: string;
    external: boolean;
    parentId: number | null;
    children: MenuTreeNode[];
}

/**
 * Нормализует slug из БД в путь для роутера.
 * - "#"           → "#" (родитель-заглушка, не ссылка)
 * - "http(s)://…" → как есть (внешняя ссылка)
 * - "/tenders"    → как есть (уже абсолютный путь)
 * - "page/about"  → "/page/about"
 */
function normalizePath(slug: string): { to: string; external: boolean } {
    if (!slug || slug === "#") {
        return { to: "#", external: false };
    }
    if (/^https?:\/\//i.test(slug)) {
        return { to: slug, external: true };
    }
    return { to: slug.startsWith("/") ? slug : `/${slug}`, external: false };
}

/**
 * Максимальная глубина вложенности меню.
 * Защита от бесконечной рекурсии при ошибочных данных.
 */
const MAX_DEPTH = 3;

/**
 * Преобразует плоский список MenuCategory из БД
 * в дерево MenuItem для Header.
 */
export function buildMenuTree(items: MenuCategory[]): MenuItem[] {
    if (!items || items.length === 0) {
        return [];
    }

    // 1. Создаём карту узлов
    const nodeMap = new Map<number, MenuTreeNode>();
    const roots: MenuTreeNode[] = [];

    items.forEach((item) => {
        const { to, external } = normalizePath(item.slug);
        nodeMap.set(item.id, {
            id: item.id,
            to,
            label: item.title,
            external,
            parentId: item.parentId,
            children: [],
        });
    });

    // 2. Защита от циклов
    const processed = new Set<number>();
    const MAX_NODES = items.length * 2;

    // 3. Строим дерево
    items.forEach((item) => {
        const node = nodeMap.get(item.id);
        if (!node) return;

        if (processed.has(item.id)) {
            console.warn(`[menuHelpers] Cycle detected at node ${item.id}, skipping`);
            return;
        }
        if (processed.size > MAX_NODES) {
            console.error("[menuHelpers] Max nodes exceeded, aborting tree build");
            return;
        }
        processed.add(item.id);

        if (item.parentId === null || item.parentId === undefined) {
            roots.push(node);
        } else {
            const parent = nodeMap.get(item.parentId);
            if (parent) {
                parent.children.push(node);
            } else {
                console.warn(
                    `[menuHelpers] Orphan node ${item.id} (parent ${item.parentId} not found), making root`
                );
                roots.push(node);
            }
        }
    });

    // 4. Проверка на циклы в уже построенном дереве
    const hasCycle = (node: MenuTreeNode, visited: Set<number>, depth: number): boolean => {
        if (depth > MAX_DEPTH) {
            console.warn(`[menuHelpers] Max depth ${MAX_DEPTH} exceeded at ${node.id}`);
            return true;
        }
        if (visited.has(node.id)) {
            console.warn(`[menuHelpers] Cycle detected at node ${node.id}`);
            return true;
        }
        visited.add(node.id);
        for (const child of node.children) {
            if (hasCycle(child, visited, depth + 1)) {
                return true;
            }
        }
        visited.delete(node.id);
        return false;
    };

    for (const root of roots) {
        if (hasCycle(root, new Set(), 0)) {
            console.error("[menuHelpers] Tree contains cycles, returning empty");
            return [];
        }
    }

    // 5. Преобразуем в MenuItem (убираем служебные поля)
    const toMenuItem = (node: MenuTreeNode, depth = 0): MenuItem | null => {
        if (depth > MAX_DEPTH) {
            console.warn(`[menuHelpers] Pruning node ${node.id} at depth ${depth}`);
            return null;
        }

        if (node.children.length === 0) {
            return {
                label: node.label,
                path: node.to,
                ...(node.external ? { external: true } : {}),
            };
        } else {
            const childItems = node.children
                .map((child: MenuTreeNode) => toMenuItem(child, depth + 1))
                .filter((item): item is MenuItem => item !== null);

            if (childItems.length === 0) {
                return {
                    label: node.label,
                    path: node.to,
                    ...(node.external ? { external: true } : {}),
                };
            }

            return {
                label: node.label,
                path: node.to,
                ...(node.external ? { external: true } : {}),
                children: childItems,
            };
        }
    };

    return roots
        .map((root) => toMenuItem(root, 0))
        .filter((item): item is MenuItem => item !== null);
}