import { useEffect, useState } from "react";
import {
    getMenuAdmin,
    createMenuCategory,
    updateMenuCategory,
    deleteMenuCategory,
} from "../../api/adminApi";
import type { MenuCategory } from "../../types/content";

type EditingMenu = Partial<MenuCategory> | null;

export default function MenuManager() {
    const [menu, setMenu] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingMenu>(null);
    const [showForm, setShowForm] = useState(false);
    const [lang, setLang] = useState("ru");

    const loadMenu = async () => {
        setLoading(true);
        try {
            const data = await getMenuAdmin(lang);
            setMenu(data);
            setError(null);
        } catch (err) {
            setError("Ошибка загрузки меню");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenu();
    }, [lang]);

    // Преобразуем плоский список в дерево
    const buildTree = (items: MenuCategory[]): any[] => {
        const map = new Map<number, any>();
        const roots: any[] = [];

        items.forEach((item) => {
            map.set(item.id, { ...item, children: [] });
        });

        items.forEach((item) => {
            const node = map.get(item.id);
            if (item.parentId === null) {
                roots.push(node);
            } else {
                const parent = map.get(item.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            }
        });

        return roots;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const payload = {
                title: editing.title || "",
                slug: editing.slug || "",
                parentId: editing.parentId ?? null,
                order: editing.order ?? 0,
                languageCode: editing.languageCode || "ru",
            };

            if (editing.id) {
                await updateMenuCategory(editing.id, payload);
            } else {
                await createMenuCategory(payload);
            }
            setEditing(null);
            setShowForm(false);
            loadMenu();
        } catch (err) {
            alert("Ошибка сохранения");
            console.error(err);
        }
    };

    const handleEdit = (item: MenuCategory) => {
        setEditing(item);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить этот пункт меню? Все дочерние пункты тоже будут удалены!")) return;
        try {
            await deleteMenuCategory(id);
            loadMenu();
        } catch (err) {
            alert("Ошибка удаления");
            console.error(err);
        }
    };

    const handleNew = (parentId: number | null = null) => {
        setEditing({
            title: "",
            slug: "",
            parentId: parentId,
            order: menu.length,
            languageCode: lang,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditing(null);
        setShowForm(false);
    };

    // Рекурсивный рендер дерева
    const renderTree = (nodes: any[], level: number = 0): React.ReactNode => {
        return nodes.map((node) => (
            <li key={node.id} style={{ marginLeft: level * 30 }}>
                <div className="menu-item-row">
                    <div className="menu-item-info">
                        <span className="menu-title">{node.title}</span>
                        <code className="menu-slug">
                            {node.slug.startsWith("/") ? node.slug : `/${node.slug}`}
                        </code>
                        {node.parentId && <small className="menu-parent">↳ дочерний</small>}
                    </div>
                    <div className="menu-actions">
                        <button onClick={() => handleNew(node.id)} title="Добавить подпункт">➕</button>
                        <button onClick={() => handleEdit(node)} title="Редактировать">✏️</button>
                        <button onClick={() => handleDelete(node.id)} className="secondary" title="Удалить">🗑️</button>
                    </div>
                </div>
                {node.children.length > 0 && (
                    <ul className="menu-tree">
                        {renderTree(node.children, level + 1)}
                    </ul>
                )}
            </li>
        ));
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    const tree = buildTree(menu);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Меню сайта</h2>
                <div style={{ display: "flex", gap: "10px" }}>
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                        <option value="ru">Русский</option>
                        <option value="ro">Română</option>
                    </select>
                    <button onClick={() => handleNew(null)}>+ Добавить пункт</button>
                </div>
            </div>

            {showForm && editing && (
                <form onSubmit={handleSave} className="admin-form" style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>{editing.id ? "Редактирование" : "Новый пункт меню"}</h3>

                    <div className="form-group">
                        <label>Название *</label>
                        <input
                            type="text"
                            value={editing.title || ""}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            required
                            placeholder="О нас"
                        />
                    </div>

                    <div className="form-group">
                        <label>URL (slug или полный путь) *</label>
                        <input
                            type="text"
                            value={editing.slug || ""}
                            onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                            required
                            placeholder="page/about или /news"
                            style={{ fontFamily: "monospace" }}
                        />
                        <small>Примеры: <code>page/history</code>, <code>/news</code>, <code>/contacts</code></small>
                    </div>

                    <div className="form-group">
                        <label>Родительский пункт (для вложенности)</label>
                        <select
                            value={editing.parentId ?? ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setEditing({ ...editing, parentId: val === "" ? null : parseInt(val) });
                            }}
                            style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                        >
                            <option value="">— Корневой пункт —</option>
                            {menu
                                .filter((item) => item.id !== editing.id)
                                .map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.title}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Порядок сортировки</label>
                        <input
                            type="number"
                            value={editing.order ?? 0}
                            onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Язык</label>
                        <select
                            value={editing.languageCode || "ru"}
                            onChange={(e) => setEditing({ ...editing, languageCode: e.target.value })}
                            style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                        >
                            <option value="ru">Русский</option>
                            <option value="ro">Română</option>
                        </select>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" className="secondary" onClick={handleCancel}>Отмена</button>
                    </div>
                </form>
            )}

            {tree.length === 0 ? (
                <p>Меню пустое. Добавьте первый пункт кнопкой выше.</p>
            ) : (
                <ul className="menu-tree admin-list" style={{ listStyle: "none", padding: 0 }}>
                    {renderTree(tree)}
                </ul>
            )}
        </div>
    );
}