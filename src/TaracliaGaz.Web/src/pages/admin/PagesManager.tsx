import { useEffect, useState } from "react";
import {
    getPagesAdmin,
    createPage,
    updatePage,
    deletePage,
} from "../../api/adminApi";
import type { Page } from "../../types/content";
import RichEditor from "../../components/RichEditor";

type EditingPage = Partial<Page> | null;

export default function PagesManager() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingPage>(null);
    const [showForm, setShowForm] = useState(false);

    const loadPages = async () => {
        setLoading(true);
        try {
            const data = await getPagesAdmin();
            setPages(data);
            setError(null);
        } catch (err) {
            setError("Ошибка загрузки страниц");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPages();
    }, []);

    // Автоматическая генерация slug из заголовка
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^\wа-я\s-]/gi, "") // Убираем спецсимволы, оставляем кириллицу
            .replace(/\s+/g, "-")          // Пробелы → дефисы
            .replace(/-+/g, "-")           // Множественные дефисы → один
            .trim();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const payload = {
                slug: editing.slug || "",
                title: editing.title || "",
                bodyHtml: editing.bodyHtml || "",
                languageCode: editing.languageCode || "ru",
                isPublished: editing.isPublished ?? true,
            };

            if (editing.id) {
                await updatePage(editing.id, payload);
            } else {
                await createPage(payload);
            }
            setEditing(null);
            setShowForm(false);
            loadPages();
        } catch (err) {
            alert("Ошибка сохранения");
            console.error(err);
        }
    };

    const handleEdit = (page: Page) => {
        setEditing(page);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить страницу? Это действие необратимо!")) return;
        try {
            await deletePage(id);
            loadPages();
        } catch (err) {
            alert("Ошибка удаления");
            console.error(err);
        }
    };

    const handleNew = () => {
        setEditing({
            slug: "",
            title: "",
            bodyHtml: "",
            languageCode: "ru",
            isPublished: true,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditing(null);
        setShowForm(false);
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Страницы</h2>
                <button onClick={handleNew}>+ Добавить страницу</button>
            </div>

            {showForm && editing && (
                <form onSubmit={handleSave} className="admin-form" style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>{editing.id ? "Редактирование страницы" : "Новая страница"}</h3>

                    <div className="form-group">
                        <label>Заголовок *</label>
                        <input
                            type="text"
                            value={editing.title || ""}
                            onChange={(e) => {
                                const newTitle = e.target.value;
                                const updates: Partial<Page> = { title: newTitle };
                                // Автоматически генерируем slug только для новых страниц
                                if (!editing.id) {
                                    updates.slug = generateSlug(newTitle);
                                }
                                setEditing({ ...editing, ...updates });
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>URL (slug) *</label>
                        <input
                            type="text"
                            value={editing.slug || ""}
                            onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                            placeholder="about-us"
                            required
                            style={{ fontFamily: "monospace" }}
                        />
                        <small>
                            {editing.id
                                ? "⚠️ Будьте осторожны: изменение URL может сломать ссылки"
                                : "URL страницы, например: /page/about-us"
                            }
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Содержимое страницы *</label>
                        <RichEditor
                            value={editing.bodyHtml || ""}
                            onChange={(html) => setEditing({ ...editing, bodyHtml: html })}
                            placeholder="Напишите содержимое страницы..."
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

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="page-published"
                            checked={editing.isPublished ?? true}
                            onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                        />
                        <label htmlFor="page-published">Опубликовано</label>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" className="secondary" onClick={handleCancel}>Отмена</button>
                    </div>
                </form>
            )}

            <ul className="admin-list">
                {pages.length === 0 && <li>Нет страниц</li>}
                {pages.map((page) => (
                    <li key={page.id}>
                        <div>
                            <div className="item-title">{page.title}</div>
                            <small>
                                🔗 <code>/page/{page.slug}</code> |
                                🌐 {page.languageCode.toUpperCase()} |
                                {page.isPublished ? " ✓ Опубликовано" : " Скрыто"}
                            </small>
                        </div>
                        <div className="item-actions">
                            <a
                                href={`/page/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ padding: "5px 10px", fontSize: "12px" }}
                            >
                                👁️
                            </a>
                            <button onClick={() => handleEdit(page)}>✏️</button>
                            <button onClick={() => handleDelete(page.id)} className="secondary">🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}