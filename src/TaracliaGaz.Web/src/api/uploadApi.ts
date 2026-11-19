import { http } from "./http";

export interface UploadResponse {
    url: string;
    filename: string;
    size: number;
}

const MAX_IMAGE_DIM = 2000;
const IMAGE_QUALITY = 0.82;
const SKIP_COMPRESS_TYPES = new Set(["image/gif", "image/svg+xml"]);
const ALLOWED_NATIVE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function getTargetDimensions(width: number, height: number, maxDim = MAX_IMAGE_DIM) {
    const longest = Math.max(width, height);
    if (longest <= maxDim || width <= 0 || height <= 0) {
        return { width, height };
    }
    const scale = maxDim / longest;
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

export function replaceImageExtension(filename: string, mimeType: string): string {
    const ext = mimeType === "image/webp" ? ".webp" : ".jpg";
    const dot = filename.lastIndexOf(".");
    const stem = dot > 0 ? filename.slice(0, dot) : filename;
    return `${stem}${ext}`;
}

const encodeCanvas = (canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> =>
    new Promise((resolve) => canvas.toBlob(resolve, mime, quality));

/**
 * Сжимает изображение в браузере (до MAX_IMAGE_DIM px и качества IMAGE_QUALITY) перед загрузкой.
 * GIF/SVG не пережимает; при любой ошибке или отсутствии выигрыша возвращает исходный файл.
 */
export async function compressImage(file: File): Promise<File> {
    if (
        SKIP_COMPRESS_TYPES.has(file.type)
        || typeof document === "undefined"
        || typeof createImageBitmap !== "function"
    ) {
        return file;
    }

    let bitmap: ImageBitmap | null = null;
    try {
        bitmap = await createImageBitmap(file);
        const { width, height } = getTargetDimensions(bitmap.width, bitmap.height);
        if (!width || !height) return file;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return file;

        ctx.drawImage(bitmap, 0, 0, width, height);

        let blob = await encodeCanvas(canvas, "image/webp", IMAGE_QUALITY);
        if (!blob || blob.type !== "image/webp") {
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            blob = await encodeCanvas(canvas, "image/jpeg", IMAGE_QUALITY);
        }

        if (!blob) return file;
        if (blob.size >= file.size && ALLOWED_NATIVE_TYPES.has(file.type)) {
            return file;
        }

        return new File([blob], replaceImageExtension(file.name, blob.type), {
            type: blob.type,
            lastModified: file.lastModified,
        });
    } catch {
        return file;
    } finally {
        bitmap?.close();
    }
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
    const prepared = await compressImage(file);
    const formData = new FormData();
    formData.append("file", prepared);
    return http.post<UploadResponse>("/uploads/image", formData);
};

export const uploadDocument = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<UploadResponse>("/uploads/document", formData);
};