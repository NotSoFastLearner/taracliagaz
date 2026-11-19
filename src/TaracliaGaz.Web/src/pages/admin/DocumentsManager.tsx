import { useEffect, useState } from "react";
import {
    getDocumentsAdmin,
    createDocument,
    updateDocument,
    deleteDocument,
} from "../../api/adminApi";
import type { Document } from "../../types/content";
import FileUpload from "../../components/FileUpload";
import AdminLangFilter, { type AdminLangFilterValue } from "../../components/AdminLangFilter";
import { resolveUploadUrl } from "../../utils/urls";

const DOCUMENT_CATEGORIES = [
    { slug: "prozrachnost", label: "Прозрачность (prozrachnost)" },
    { slug: "ustav", label: "Устав (ustav)" },
    { slug: "tekhniko-ekonomicheskie-pokazateli", label: "Технико-экономические показатели" },
    { slug: "investitsionnyj-plan", label: "Инвестиционный план" },
    { slug: "programma-sootvetstviya", label: "Программа соответствия" },
    { slug: "finansovye-otchety", label: "Финансовые отчёты" },
    { slug: "audit-report", label: "Отчёт независимого аудитора" },
    { slug: "vnutrennyaya-informatsiya", label: "Внутренняя информация" },
];

type EditingDoc = Partial<Document> | null;

export default function DocumentsManager() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingDoc>(null);
    const [showForm, setShowForm] = useState(false);
    const [langFilter, setLangFilter] = useState<AdminLangFilterValue>("all");

    const loadDocs = () => {
        getDocumentsAdmin()
            .then((data) => {
                setDocuments(data);
                setError(null);
            })
            .catch((err) => {
                setError("Ошибка загрузки документов");
                console.error(err);
            })
            .finally(() => setLoading(false));
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
                categorySlug: editing.categorySlug || "prozrachnost",
                fileUrl: (editing.fileUrl || "").trim(),
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
            categorySlug: "prozrachnost",
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

    const isLocalUpload = Boolean(
        editing?.fileUrl &&
        (editing.fileUrl.startsWith("/") || /^(images|uploads|static)\//.test(editing.fileUrl))
    );

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
                        <label>Категория *</label>
                        <select
                            value={editing.categorySlug || "prozrachnost"}
                            onChange={(e) => setEditing({ ...editing, categorySlug: e.target.value })}
                            required
                        >
                            {DOCUMENT_CATEGORIES.map((cat) => (
                                <option key={cat.slug} value={cat.slug}>
                                    {cat.label}
                                </option>
                            ))}
                            {editing.categorySlug &&
                                !DOCUMENT_CATEGORIES.some((cat) => cat.slug === editing.categorySlug) && (
                                    <option value={editing.categorySlug}>{editing.categorySlug}</option>
                                )}
                        </select>
                    </div>

                    <div style={{
                        background: "white",
                        padding: "15px",
                        borderRadius: "6px",
                        border: "1px solid #dee2e6",
                        marginBottom: "15px"
                    }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>📎 Файл документа или внешняя ссылка</h4>
                        <p style={{ fontSize: "13px", color: "#666", margin: "0 0 15px 0" }}>
                            Загрузите файл на сайт или вставьте ссылку на внешний документ:
                        </p>

                        <div style={{ marginBottom: "15px" }}>
                            <FileUpload
                                type="document"
                                value={isLocalUpload ? (editing.fileUrl || "") : ""}
                                onChange={(url) => setEditing({ ...editing, fileUrl: url })}
                                label="📥 Вариант 1: Загрузить файл (PDF, DOCX, XLSX)"
                            />
                        </div>

                        <div style={{ textAlign: "center", margin: "10px 0", color: "#999", fontWeight: 500 }}>
                            — или —
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label>🔗 Вариант 2: Ссылка на внешний документ</label>
                            <input
                                type="url"
                                value={isLocalUpload ? "" : (editing.fileUrl || "")}
                                onChange={(e) => setEditing({ ...editing, fileUrl: e.target.value })}
                                placeholder="https://drive.google.com/... или https://..."
                            />
                            <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "4px" }}>
                                Например, ссылка на Google Drive, Google Docs или другой внешний ресурс
                            </small>
                            {!isLocalUpload && editing.fileUrl?.trim() && (
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                                    {resolveUploadUrl(editing.fileUrl) && (
                                        <a
                                            href={resolveUploadUrl(editing.fileUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🔗 Проверить ссылку
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        className="secondary"
                                        onClick={() => setEditing({ ...editing, fileUrl: "" })}
                                    >
                                        Очистить ссылку
                                    </button>
                                </div>
                            )}
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

            <AdminLangFilter value={langFilter} onChange={setLangFilter} items={documents} />

            <ul className="admin-list">
                {documents.filter((d) => langFilter === "all" || d.languageCode === langFilter).length === 0 && (
                    <li>Нет документов</li>
                )}
                {documents
                    .filter((d) => langFilter === "all" || d.languageCode === langFilter)
                    .map((doc) => (
                    <li key={doc.id}>
                        <div>
                            <div className="item-title">📄 {doc.title}</div>
                            <small>
                                🌐 {doc.languageCode.toUpperCase()} |{" "}
                                Категория: <code>{doc.categorySlug}</code> |{" "}
                                Дата: {formatDate(doc.publishedAt)} |{" "}
                                {doc.isPublished ? " ✓ Опубликовано" : " Скрыто"}
                            </small>
                            {doc.fileUrl && (
                                <div style={{ marginTop: "5px" }}>
                                    <a href={resolveUploadUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                                        {/^https?:\/\//i.test(doc.fileUrl.trim())
                                            ? "🔗 Открыть внешнюю ссылку"
                                            : "📥 Открыть файл"}
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