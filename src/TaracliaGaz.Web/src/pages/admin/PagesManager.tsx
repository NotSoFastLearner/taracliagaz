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
        } catch (err: unknown) {
            // 🆕 Понятное сообщение для дубликатов slug
            const msg = err instanceof Error ? err.message : "Ошибка сохранения";
            if (msg.includes("uq_pages_slug_lang") || msg.includes("UNIQUE constraint") || msg.includes("Duplicate entry")) {
                alert("Страница с таким URL (slug) уже существует. Измените slug и попробуйте снова.");
            } else {
                alert("Ошибка сохранения: " + msg);
            }
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

    const handleNewFromTemplate = (templateId: string) => {
        const template = PAGE_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        setEditing({
            slug: template.slug,
            title: template.title,
            bodyHtml: template.bodyHtml,
            languageCode: "ru",
            isPublished: true,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditing(null);
        setShowForm(false);
    };

    const PAGE_TEMPLATES = [
        {
            id: "privacy",
            name: "🔒 Политика конфиденциальности",
            slug: "privacy",
            title: "Политика конфиденциальности",
            bodyHtml: `<h2>1. Общие положения</h2>
<p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта taraclia-gaz.md...</p>
<p><em>Шаблон — заполните содержимое через редактор</em></p>`
        },
        {
            id: "terms",
            name: "📜 Условия использования",
            slug: "terms",
            title: "Условия использования сайта",
            bodyHtml: `<h2>1. Общие положения</h2>
<p>Настоящие Условия использования регулируют доступ и использование сайта taraclia-gaz.md...</p>
<p><em>Шаблон — заполните содержимое через редактор</em></p>`
        },
        {
            id: "cookies",
            name: "🍪 Политика cookies",
            slug: "cookies",
            title: "Политика использования cookies",
            bodyHtml: `<h2>1. Что такое cookies</h2>
<p>Cookies (куки) — это небольшие текстовые файлы...</p>
<p><em>Шаблон — заполните содержимое через редактор</em></p>`
        },
        {
            id: "about",
            name: "ℹ️ О компании",
            slug: "about",
            title: "О компании",
            bodyHtml: `<h2>О нас</h2>
<p>Расскажите о вашей компании...</p>`
        },
    ];

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "10px", flexWrap: "wrap" }}>
                <h2>Страницы</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {/* 🆕 Dropdown с шаблонами */}
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                handleNewFromTemplate(e.target.value);
                                e.target.value = ""; // сбрасываем выбор
                            }
                        }}
                        style={{
                            padding: "10px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            background: "white",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        <option value="">📋 Создать из шаблона...</option>
                        {PAGE_TEMPLATES.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>

                    <button onClick={handleNew}>+ Пустая страница</button>
                </div>
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