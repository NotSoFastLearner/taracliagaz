import { useEffect, useState } from "react";
import { getGallery } from "../api/contentApi";
import type { GalleryImage } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        getGallery()
            .then(setImages)
            .catch((err) => {
                setError("Не удалось загрузить галерею");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);



    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <>
            <SEO
                title="Галерея"
                description="Фотогалерея SRL «Taraclia Gaz». Фотографии объектов, мероприятий, инфраструктуры газовой сети Тараклийского района."
                path="/gallery"
            />

            <section className="section">
                <div className="container">
                    <h1>🖼️ Галерея</h1>

                    {images.length === 0 ? (
                        <p>Галерея пуста</p>
                    ) : (
                        <div className="gallery-grid">
                            {images.map((img) => (
                                <figure
                                    key={img.id}
                                    className="gallery-item"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={resolveUploadUrl(img.imageUrl)}
                                        alt={img.caption || "Фото"}
                                        loading="lazy"
                                    />
                                    {img.caption && <figcaption>{img.caption}</figcaption>}
                                </figure>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="lightbox"
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.9)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        zIndex: 1000, padding: "20px", cursor: "pointer",
                    }}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <img
                            src={resolveUploadUrl(selectedImage.imageUrl)}
                            alt={selectedImage.caption}
                            style={{ maxWidth: "90vw", maxHeight: "85vh" }}
                        />
                        {selectedImage.caption && (
                            <p style={{ color: "white", textAlign: "center", marginTop: "10px" }}>
                                {selectedImage.caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}