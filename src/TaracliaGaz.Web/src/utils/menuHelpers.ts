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
 * Максимальная глубина вложенности меню.
 * Защита от бесконечной рекурсии при ошибочных данных.
 */
const MAX_DEPTH = 3;

/**
 * Преобразует плоский список MenuCategory из БД
 * в дерево NavItem для Header.
 * 
 * Защита:
 * - Проверка циклов через visited Set
 * - Ограничение максимальной глубины
 * - Игнорирование висячих ссылок (parent_id на несуществующий узел)
 */
export function buildMenuTree(items: MenuCategory[]): NavItem[] {
    if (!items || items.length === 0) {
        return [];
    }

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

    // 2. Защита от циклов — отслеживаем уже обработанные узлы
    const processed = new Set<number>();
    const MAX_NODES = items.length * 2; // Защита от бесконечного цикла

    // 3. Строим дерево
    items.forEach((item) => {
        const node = nodeMap.get(item.id);
        if (!node) return;

        // Защита от повторной обработки
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
                // Родителя нет — делаем корневым (защита от висячих ссылок)
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

        visited.delete(node.id); // backtracking
        return false;
    };

    for (const root of roots) {
        if (hasCycle(root, new Set(), 0)) {
            console.error("[menuHelpers] Tree contains cycles, returning empty");
            return [];
        }
    }

    // 5. Преобразуем в NavItem (убираем служебные поля)
    const toNavItem = (node: MenuTreeNode, depth = 0): NavItem | null => {
        if (depth > MAX_DEPTH) {
            console.warn(`[menuHelpers] Pruning node ${node.id} at depth ${depth}`);
            return null;
        }

        if (node.children.length === 0) {
            // Листовой узел — ссылка
            return {
                to: node.to,
                label: node.label,
            };
        } else {
            // Узел с детьми — dropdown
            const childItems = node.children
                .map((child) => toNavItem(child, depth + 1))
                .filter((item): item is { to: string; label: string } =>
                    item !== null && "to" in item
                );

            if (childItems.length === 0) {
                // Все дети отфильтрованы — делаем листовым узлом
                return {
                    to: node.to,
                    label: node.label,
                };
            }

            return {
                label: node.label,
                children: childItems,
            };
        }
    };

    return roots
        .map((root) => toNavItem(root, 0))
        .filter((item): item is NavItem => item !== null);
}