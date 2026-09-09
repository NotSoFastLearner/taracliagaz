import { useEffect, useState } from "react";
import {
    getDocumentsAdmin,
    createDocument,
    updateDocument,
    deleteDocument,
} from "../../api/adminApi";
import type { Document } from "../../types/content";
import FileUpload from "../../components/FileUpload";
import { resolveUploadUrl } from "../../utils/urls";

type EditingDoc = Partial<Document> | null;

export default function DocumentsManager() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingDoc>(null);
    const [showForm, setShowForm] = useState(false);

    const loadDocs = async () => {
        setLoading(true);
        try {
            const data = await getDocumentsAdmin();
            setDocuments(data);
            setError(null);
        } catch (err) {
            setError("Ошибка загрузки документов");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocs();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const payload = {
                title: editing.title || "",
                categorySlug: editing.categorySlug || "general",
                fileUrl: editing.fileUrl || "",
                publishedAt: editing.publishedAt || new Date().toISOString(),
                languageCode: editing.languageCode || "ru",
                isPublished: editing.isPublished ?? true,
            };

            if (editing.id) {
                await updateDocument(editing.id, payload);
            } else {
                await createDocument(payload);
            }
            setEditing(null);
            setShowForm(false);
            loadDocs();
        } catch (err) {
            alert("Ошибка сохранения");
            console.error(err);
        }
    };

    const handleEdit = (doc: Document) => {
        setEditing(doc);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить документ?")) return;
        try {
            await deleteDocument(id);
            loadDocs();
        } catch (err) {
            alert("Ошибка удаления");
            console.error(err);
        }
    };

    const handleNew = () => {
        setEditing({
            title: "",
            categorySlug: "general",
            fileUrl: "",
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
            return new Date(iso).toLocaleDateString("ru-RU");
        } catch {
            return iso;
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Документы</h2>
                <button onClick={handleNew}>+ Добавить документ</button>
            </div>

            {showForm && editing && (
                <form onSubmit={handleSave} className="admin-form" style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>{editing.id ? "Редактирование" : "Новый документ"}</h3>

                    <div className="form-group">
                        <label>Название *</label>
                        <input
                            type="text"
                            value={editing.title || ""}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Категория (slug)</label>
                        <input
                            type="text"
                            value={editing.categorySlug || ""}
                            onChange={(e) => setEditing({ ...editing, categorySlug: e.target.value })}
                            placeholder="general, reports, contracts..."
                            required
                        />
                    </div>

                    <FileUpload
                        type="document"
                        value={editing.fileUrl || ""}
                        onChange={(url) => setEditing({ ...editing, fileUrl: url })}
                        label="Файл (PDF, DOCX, XLSX)"
                    />

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
                            id="doc-published"
                            checked={editing.isPublished ?? true}
                            onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                        />
                        <label htmlFor="doc-published">Опубликовано</label>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" className="secondary" onClick={handleCancel}>Отмена</button>
                    </div>
                </form>
            )}

            <ul className="admin-list">
                {documents.length === 0 && <li>Нет документов</li>}
                {documents.map((doc) => (
                    <li key={doc.id}>
                        <div>
                            <div className="item-title">📄 {doc.title}</div>
                            <small>
                                Категория: <code>{doc.categorySlug}</code> |
                                Дата: {formatDate(doc.publishedAt)} |
                                {doc.isPublished ? " ✓ Опубликовано" : " Скрыто"}
                            </small>
                            {doc.fileUrl && (
                                <div style={{ marginTop: "5px" }}>
                                    <a href={resolveUploadUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                                        🔗 Открыть файл
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="item-actions">
                            <button onClick={() => handleEdit(doc)}>✏️</button>
                            <button onClick={() => handleDelete(doc.id)} className="secondary">🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}