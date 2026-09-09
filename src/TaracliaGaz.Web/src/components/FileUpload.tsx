import { useState, useRef } from "react";
import { uploadImage, uploadDocument } from "../api/uploadApi";
import { resolveUploadUrl } from "../utils/urls";

interface FileUploadProps {
    type: "image" | "document";
    value?: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function FileUpload({ type, value, onChange, label = "Файл" }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const uploadFn = type === "image" ? uploadImage : uploadDocument;
            const response = await uploadFn(file);
            onChange(response.url);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ошибка загрузки файла");
            }
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="file-upload">
            <label>{label}</label>

            {value && (
                <div className="file-preview">
                    {type === "image" ? (
                        <img
                            src={resolveUploadUrl(value)}
                            alt="Preview"
                            style={{ maxWidth: "200px", maxHeight: "200px", display: "block", marginBottom: "10px" }}
                        />
                    ) : (
                        <a
                            href={resolveUploadUrl(value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "block", marginBottom: "10px" }}
                        >
                            📄 Открыть файл
                        </a>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                accept={type === "image" ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx"}
            />

            {uploading && <p className="loading">Загрузка...</p>}
            {error && <p className="error">{error}</p>}

            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    style={{ marginTop: "5px" }}
                >
                    Удалить файл
                </button>
            )}
        </div>
    );
}