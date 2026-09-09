import { useEffect, useState } from "react";
import { getGallery } from "../api/contentApi";
import type { GalleryImage } from "../types/content";
import SEO from "../components/SEO";
import { resolveUploadUrl } from "../utils/urls";
import { IconGallery, IconClose } from "../components/icons";

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        getGallery().then(setImages).catch(console.error).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedImage(null);
        };
        if (selectedImage) {
            document.addEventListener("keydown", handleKey);
            return () => document.removeEventListener("keydown", handleKey);
        }
    }, [selectedImage]);

    return (
        <>
            <SEO title="Галерея" description="Фотогалерея SRL «Taraclia Gaz»" path="/gallery" />
            <section className="section">
                <div className="container">
                    <h1><IconGallery width={32} height={32} /> Галерея</h1>
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : images.length === 0 ? (
                        <p>Изображений пока нет</p>
                    ) : (
                        <div className="gallery-grid">
                            {images.map((img) => (
                                <figure
                                    key={img.id}
                                    className="gallery-item"
                                    onClick={() => setSelectedImage(img)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === "Enter") setSelectedImage(img); }}
                                >
                                    <img
                                        src={resolveUploadUrl(img.imageUrl)}
                                        alt={img.caption}
                                        loading="lazy"
                                    />
                                    {img.caption && <figcaption>{img.caption}</figcaption>}
                                </figure>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {selectedImage && (
                <div
                    className="lightbox"
                    onClick={() => setSelectedImage(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedImage.caption}
                >
                    <button
                        className="lightbox-close"
                        onClick={() => setSelectedImage(null)}
                        aria-label="Закрыть"
                    >
                        <IconClose width={32} height={32} />
                    </button>
                    <img
                        src={resolveUploadUrl(selectedImage.imageUrl)}
                        alt={selectedImage.caption}
                        onClick={(e) => e.stopPropagation()}
                    />
                    {selectedImage.caption && <p>{selectedImage.caption}</p>}
                </div>
            )}
        </>
    );
}