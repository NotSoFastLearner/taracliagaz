import { useEffect, useState } from "react";
import {
    getTendersAdmin,
    createTender,
    updateTender,
    deleteTender,
} from "../../api/adminApi";
import type { Tender } from "../../types/content";
import RichEditor from "../../components/RichEditor";
import FileUpload from "../../components/FileUpload";

type EditingItem = Partial<Tender> | null;

export default function TendersManager() {
    const [items, setItems] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingItem>(null);
    const [showForm, setShowForm] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getTendersAdmin();
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
                deadlineAt: editing.deadlineAt || null,
                documentUrl: editing.documentUrl || null,
                externalUrl: editing.externalUrl || null,
                languageCode: editing.languageCode || "ru",
                isPublished: editing.isPublished ?? true,
            };

            if (editing.id) {
                await updateTender(editing.id, payload);
            } else {
                await createTender(payload);
            }
            setEditing(null);
            setShowForm(false);
            load();
        } catch (err) {
            alert("Ошибка сохранения");
            console.error(err);
        }
    };

    const handleEdit = (item: Tender) => {
        setEditing(item);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить тендер?")) return;
        try {
            await deleteTender(id);
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
            deadlineAt: null,
            documentUrl: null,
            externalUrl: null,
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
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            });
        } catch { return iso; }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Тендеры</h2>
                <button onClick={handleNew}>+ Добавить тендер</button>
            </div>

            {showForm && editing && (
                <form onSubmit={handleSave} className="admin-form" style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>{editing.id ? "Редактирование" : "Новый тендер"}</h3>

                    <div className="form-group">
                        <label>Название тендера *</label>
                        <input
                            type="text"
                            value={editing.title || ""}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Описание *</label>
                        <RichEditor
                            value={editing.bodyHtml || ""}
                            onChange={(html) => setEditing({ ...editing, bodyHtml: html })}
                            placeholder="Описание тендера, условия участия..."
                        />
                    </div>

                    {/* 🆕 Блок документов */}
                    <div style={{
                        background: "white",
                        padding: "15px",
                        borderRadius: "6px",
                        border: "1px solid #dee2e6",
                        marginBottom: "15px"
                    }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>📎 Документация тендера</h4>
                        <p style={{ fontSize: "13px", color: "#666", margin: "0 0 15px 0" }}>
                            Выберите один из вариантов или используйте оба:
                        </p>

                        <div style={{ marginBottom: "15px" }}>
                            <FileUpload
                                type="document"
                                value={editing.documentUrl || ""}
                                onChange={(url) => setEditing({ ...editing, documentUrl: url })}
                                label="📥 Вариант 1: Загрузить файл (PDF, DOCX)"
                            />
                        </div>

                        <div style={{ textAlign: "center", margin: "10px 0", color: "#999", fontWeight: 500 }}>
                            — или —
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label>🔗 Вариант 2: Внешняя ссылка</label>
                            <input
                                type="url"
                                value={editing.externalUrl || ""}
                                onChange={(e) => setEditing({ ...editing, externalUrl: e.target.value })}
                                placeholder="https://docs.google.com/document/d/..."
                            />
                            <small style={{ color: "#666", fontSize: "12px" }}>
                                Например, ссылка на Google Docs, Google Drive или любой внешний документ
                            </small>
                        </div>
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
                        <label>🕐 Крайний срок подачи (дедлайн)</label>
                        <input
                            type="datetime-local"
                            value={editing.deadlineAt ? editing.deadlineAt.slice(0, 16) : ""}
                            onChange={(e) => setEditing({ ...editing, deadlineAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        />
                        <small>Оставьте пустым, если нет дедлайна</small>
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
                            id="tender-published"
                            checked={editing.isPublished ?? true}
                            onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                        />
                        <label htmlFor="tender-published">Опубликовано</label>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" className="secondary" onClick={handleCancel}>Отмена</button>
                    </div>
                </form>
            )}

            <ul className="admin-list">
                {items.length === 0 && <li>Нет тендеров</li>}
                {items.map((item) => (
                    <li key={item.id}>
                        <div>
                            <div className="item-title">{item.title}</div>
                            <small>
                                📅 {formatDate(item.publishedAt)}
                                {item.deadlineAt && <> | 🕐 Дедлайн: {formatDate(item.deadlineAt)}</>}
                                {" | "}🌐 {item.languageCode.toUpperCase()}
                                {item.isPublished ? " | ✓ Опубликовано" : " | Скрыто"}
                                {item.documentUrl && " | 📥 Файл"}
                                {item.externalUrl && " | 🔗 Ссылка"}
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