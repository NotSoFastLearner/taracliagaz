import { useEffect, useState } from "react";
import {
    getGalleryAdmin,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
} from "../../api/adminApi";
import type { GalleryImage } from "../../types/content";
import FileUpload from "../../components/FileUpload";

type EditingImage = Partial<GalleryImage> | null;

export default function GalleryManager() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<EditingImage>(null);
    const [showForm, setShowForm] = useState(false);

    const loadImages = async () => {
        setLoading(true);
        try {
            const data = await getGalleryAdmin();
            setImages(data);
            setError(null);
        } catch (err) {
            setError("Ошибка загрузки галереи");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            if (editing.id) {
                await updateGalleryImage(editing.id, editing);
            } else {
                await createGalleryImage({
                    caption: editing.caption || "",
                    imageUrl: editing.imageUrl || "",
                    sortOrder: editing.sortOrder ?? 0,
                    isPublished: editing.isPublished ?? true,
                });
            }
            setEditing(null);
            setShowForm(false);
            loadImages();
        } catch (err) {
            alert("Ошибка сохранения");
            console.error(err);
        }
    };

    const handleEdit = (img: GalleryImage) => {
        setEditing(img);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить это изображение?")) return;
        try {
            await deleteGalleryImage(id);
            loadImages();
        } catch (err) {
            alert("Ошибка удаления");
            console.error(err);
        }
    };

    const handleNew = () => {
        setEditing({
            caption: "",
            imageUrl: "",
            sortOrder: 0,
            isPublished: true,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditing(null);
        setShowForm(false);
    };

    const getImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("/uploads/")) return `http://localhost:8000${url}`;
        return url;
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Галерея</h2>
                <button onClick={handleNew}>+ Добавить изображение</button>
            </div>

            {showForm && editing && (
                <form onSubmit={handleSave} className="admin-form" style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>{editing.id ? "Редактирование" : "Новое изображение"}</h3>

                    <div className="form-group">
                        <label>Подпись</label>
                        <input
                            type="text"
                            value={editing.caption || ""}
                            onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                            required
                        />
                    </div>

                    <FileUpload
                        type="image"
                        value={editing.imageUrl || ""}
                        onChange={(url) => setEditing({ ...editing, imageUrl: url })}
                        label="Изображение"
                    />

                    <div className="form-group">
                        <label>Порядок сортировки</label>
                        <input
                            type="number"
                            value={editing.sortOrder ?? 0}
                            onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="published"
                            checked={editing.isPublished ?? true}
                            onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                        />
                        <label htmlFor="published">Опубликовано</label>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" className="secondary" onClick={handleCancel}>Отмена</button>
                    </div>
                </form>
            )}

            <ul className="admin-list">
                {images.length === 0 && <li>Нет изображений</li>}
                {images.map((img) => (
                    <li key={img.id}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            {img.imageUrl && (
                                <img
                                    src={getImageUrl(img.imageUrl)}
                                    alt={img.caption}
                                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                                />
                            )}
                            <div>
                                <div className="item-title">{img.caption || "(без подписи)"}</div>
                                <small>Порядок: {img.sortOrder} | {img.isPublished ? "✓ Опубликовано" : "Скрыто"}</small>
                            </div>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => handleEdit(img)}>✏️</button>
                            <button onClick={() => handleDelete(img.id)} className="secondary">🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}