import { useState } from "react";
import FileUpload from "../../components/FileUpload";

export default function TestUpload() {
    const [imageUrl, setImageUrl] = useState("");
    const [docUrl, setDocUrl] = useState("");

    return (
        <div className="admin-form">
            <h2>Тест загрузки файлов</h2>

            <FileUpload
                type="image"
                value={imageUrl}
                onChange={setImageUrl}
                label="Загрузить изображение"
            />
            <p>URL изображения: <code>{imageUrl}</code></p>

            <hr style={{ margin: "30px 0" }} />

            <FileUpload
                type="document"
                value={docUrl}
                onChange={setDocUrl}
                label="Загрузить документ"
            />
            <p>URL документа: <code>{docUrl}</code></p>
        </div>
    );
}