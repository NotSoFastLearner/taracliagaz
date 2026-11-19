import { useEffect, useState } from "react";
import { getGallery } from "../api/contentApi";
import { useCachedFetch } from "../hooks/useCachedFetch";
import SEO from "../components/SEO";
import { resolveUploadUrl, resolveThumbnailUrl } from "../utils/urls";
import { IconGallery, IconClose } from "../components/icons";
import { useLanguage } from "../context/LanguageContext";

export default function GalleryPage() {
    const { t } = useLanguage();
    // SWR: мгновенный показ из localStorage, свежие данные в фоне
    const { data: imagesData, loading } = useCachedFetch("gallery", () => getGallery());
    const images = imagesData ?? [];
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const selectedImage = selectedIndex !== null ? images[selectedIndex] ?? null : null;

    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedIndex(null);
            } else if (e.key === "ArrowLeft" && images.length > 1) {
                setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
            } else if (e.key === "ArrowRight" && images.length > 1) {
                setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [selectedIndex, images.length]);

    return (
        <>
            <SEO title={t('gallery.title')} description={t('seo.galleryDesc')} path="/gallery" />
            <section className="section">
                <div className="container">
                    <h1><IconGallery width={32} height={32} /> {t('gallery.title')}</h1>
                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : images.length === 0 ? (
                        <p>{t('gallery.empty')}</p>
                    ) : (
                        <div className="gallery-grid">
                            {images.map((img, idx) => (
                                <figure
                                    key={img.id}
                                    className="gallery-item"
                                    onClick={() => setSelectedIndex(idx)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setSelectedIndex(idx);
                                        }
                                    }}
                                >
                                    <img
                                        src={resolveThumbnailUrl(img.imageUrl)}
                                        alt={img.caption}
                                        width={320}
                                        height={240}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            // Миниатюры может не быть — откатываемся на полный файл
                                            const full = resolveUploadUrl(img.imageUrl);
                                            if (e.currentTarget.src !== full) {
                                                e.currentTarget.src = full;
                                            }
                                        }}
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
                    onClick={() => setSelectedIndex(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedImage.caption}
                >
                    <button
                        type="button"
                        className="lightbox-close"
                        onClick={() => setSelectedIndex(null)}
                        aria-label={t('close')}
                    >
                        <IconClose width={32} height={32} />
                    </button>
                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="lightbox-nav lightbox-prev"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
                                }}
                                aria-label={t('gallery.prev')}
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                className="lightbox-nav lightbox-next"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
                                }}
                                aria-label={t('gallery.next')}
                            >
                                ›
                            </button>
                        </>
                    )}
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
