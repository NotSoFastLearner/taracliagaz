import { useEffect, useState } from "react";
import {
    getAnnouncementsAdmin,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../../api/adminApi";
import type { Announcement } from "../../types/content";
import RichEditor from "../../components/RichEditor";

type EditingItem = Partial<Announcement> | null;

export default function AnnouncementsManager() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingItem>(null);
    const [showForm, setShowForm] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getAnnouncementsAdmin();
            setItems(data);
            setError(null);
        } catch (err) {
            setError("Ошибка загрузки");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const payload = {
                title: editing.title || "",
                bodyHtml: editing.bodyHtml || "",
                publishedAt: editing.publishedAt || new Date().toISOString(),
                isPinned: editing.isPinned ?? false,
                languageCode: editing.languageCode || "ru",
                isPublished: editing.isPublished ?? true,
            };

            if (editing.id) {
                await updateAnnouncement(editing.id, payload);
            } else {
                await createAnnouncement(payload);
            }
            setEditing(null);
            setShowForm(false);
            load();
        } catch (err) {
            alert("Ошибка сохранения");
            console.error(err);
        }
    };

    const handleEdit = (item: Announcement) => {
        setEditing(item);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить объявление?")) return;
        try {
            await deleteAnnouncement(id);
            load();
        } catch (err) {
            alert("Ошибка удаления");
            console.error(err);
        }
    };

    const handleNew = () => {
        setEditing({
            title: "",
            bodyHtml: "",
            publishedAt: new Date().toISOString(),
            isPinned: false,
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
                <h2>Объявления</h2>
                <button onClick={handleNew}>+ Добавить объявление</button>
            </div>

            {showForm && editing && (
                <form onSubmit={handleSave} className="admin-form" style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>{editing.id ? "Редактирование" : "Новое объявление"}</h3>

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
                        <label>Текст объявления *</label>
                        <RichEditor
                            value={editing.bodyHtml || ""}
                            onChange={(html) => setEditing({ ...editing, bodyHtml: html })}
                            placeholder="Напишите объявление..."
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
                            id="ann-pinned"
                            checked={editing.isPinned ?? false}
                            onChange={(e) => setEditing({ ...editing, isPinned: e.target.checked })}
                        />
                        <label htmlFor="ann-pinned">📌 Закрепленное (показывается вверху)</label>
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="ann-published"
                            checked={editing.isPublished ?? true}
                            onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                        />
                        <label htmlFor="ann-published">Опубликовано</label>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" className="secondary" onClick={handleCancel}>Отмена</button>
                    </div>
                </form>
            )}

            <ul className="admin-list">
                {items.length === 0 && <li>Нет объявлений</li>}
                {items.map((item) => (
                    <li key={item.id}>
                        <div>
                            <div className="item-title">
                                {item.isPinned && "📌 "}
                                {item.title}
                            </div>
                            <small>
                                📅 {formatDate(item.publishedAt)} |
                                🌐 {item.languageCode.toUpperCase()} |
                                {item.isPublished ? " ✓ Опубликовано" : " Скрыто"}
                            </small>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => handleEdit(item)}>✏️</button>
                            <button onClick={() => handleDelete(item.id)} className="secondary">🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}