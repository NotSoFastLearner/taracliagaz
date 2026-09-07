import { useEffect, useState } from "react";
import {
    getNewsAdmin,
    createNews,
    updateNews,
    deleteNews,
} from "../../api/adminApi";
import type { NewsPostDetail } from "../../types/content";
import RichEditor from "../../components/RichEditor";

type EditingNews = Partial<NewsPostDetail> | null;

export default function NewsManager() {
    const [news, setNews] = useState<NewsPostDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingNews>(null);
    const [showForm, setShowForm] = useState(false);

    const loadNews = async () => {
        setLoading(true);
        try {
            const data = await getNewsAdmin();
            setNews(data);
            setError(null);
        } catch (err) {
            setError("Ошибка загрузки новостей");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const payload = {
                title: editing.title || "",
                summary: editing.summary || "",
                bodyHtml: editing.bodyHtml || "",
                publishedAt: editing.publishedAt || new Date().toISOString(),
                languageCode: editing.languageCode || "ru",
                isPublished: editing.isPublished ?? true,
            };

            if (editing.id) {
                await updateNews(editing.id, payload);
            } else {
                await createNews(payload);
            }
            setEditing(null);
            setShowForm(false);
            loadNews();
        } catch (err) {
            alert("Ошибка сохранения");
            console.error(err);
        }
    };

    const handleEdit = (post: NewsPostDetail) => {
        setEditing(post);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить новость?")) return;
        try {
            await deleteNews(id);
            loadNews();
        } catch (err) {
            alert("Ошибка удаления");
            console.error(err);
        }
    };

    const handleNew = () => {
        setEditing({
            title: "",
            summary: "",
            bodyHtml: "",
            publishedAt: new Date().toISOString(),
            languageCode: "ru",
            isPublished: true,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditing(null);
        setShowForm(false);
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Новости</h2>
                <button onClick={handleNew}>+ Добавить новость</button>
            </div>

            {showForm && editing && (
                <form onSubmit={handleSave} className="admin-form" style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>{editing.id ? "Редактирование новости" : "Новая новость"}</h3>

                    <div className="form-group">
                        <label>Заголовок *</label>
                        <input
                            type="text"
                            value={editing.title || ""}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Краткое описание (для списка) *</label>
                        <textarea
                            value={editing.summary || ""}
                            onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                            rows={2}
                            maxLength={500}
                            required
                            style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                        />
                        <small>{(editing.summary || "").length}/500 символов</small>
                    </div>

                    <div className="form-group">
                        <label>Полный текст *</label>
                        <RichEditor
                            value={editing.bodyHtml || ""}
                            onChange={(html) => setEditing({ ...editing, bodyHtml: html })}
                            placeholder="Напишите текст новости..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Дата публикации</label>
                        <input
                            type="datetime-local"
                            value={editing.publishedAt ? editing.publishedAt.slice(0, 16) : ""}
                            onChange={(e) => setEditing({ ...editing, publishedAt: new Date(e.target.value).toISOString() })}
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
                            id="news-published"
                            checked={editing.isPublished ?? true}
                            onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                        />
                        <label htmlFor="news-published">Опубликовано</label>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" className="secondary" onClick={handleCancel}>Отмена</button>
                    </div>
                </form>
            )}

            <ul className="admin-list">
                {news.length === 0 && <li>Нет новостей</li>}
                {news.map((post) => (
                    <li key={post.id}>
                        <div>
                            <div className="item-title">{post.title}</div>
                            <small>
                                📅 {formatDate(post.publishedAt)} |
                                🌐 {post.languageCode.toUpperCase()} |
                                {post.isPublished ? " ✓ Опубликовано" : " Скрыто"}
                            </small>
                            {post.summary && (
                                <div style={{ marginTop: "5px", color: "#666", fontSize: "14px" }}>
                                    {post.summary}
                                </div>
                            )}
                        </div>
                        <div className="item-actions">
                            <button onClick={() => handleEdit(post)}>✏️</button>
                            <button onClick={() => handleDelete(post.id)} className="secondary">🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}