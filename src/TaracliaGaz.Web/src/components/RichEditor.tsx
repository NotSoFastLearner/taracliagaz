import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "../api/uploadApi";
import { sanitizeHtml } from "../utils/sanitize";

const COMPLEX_HTML_RE = /<(table|iframe|details)\b|\{spoiler/i;

interface RichEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [htmlMode, setHtmlMode] = useState(() => COMPLEX_HTML_RE.test(value));
    const [previewMode, setPreviewMode] = useState(false);
    const [prevValue, setPrevValue] = useState(value);

    if (value !== prevValue) {
        setPrevValue(value);
        if (COMPLEX_HTML_RE.test(value) && !htmlMode) {
            setHtmlMode(true);
        }
    }

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: "editor-image",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: "noopener noreferrer",
                    target: "_blank",
                },
            }),
        ],
        content: COMPLEX_HTML_RE.test(value) ? "" : value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && !htmlMode && !previewMode && value !== editor.getHTML()) {
            editor.commands.setContent(value || "", { emitUpdate: false });
        }
    }, [value, editor, htmlMode, previewMode]);

    if (!editor) return null;

    const toggleHtmlMode = () => {
        if (htmlMode && COMPLEX_HTML_RE.test(value)) {
            if (!window.confirm("Содержимое содержит таблицы, видео или спойлеры — визуальный редактор может удалить эти элементы. Всё равно переключить?")) {
                return;
            }
        }
        setPreviewMode(false);
        setHtmlMode((m) => !m);
    };

    const handleImageUpload = async () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const response = await uploadImage(file);
            editor.chain().focus().setImage({ src: response.url }).run();
        } catch (err) {
            alert("Ошибка загрузки изображения");
            console.error(err);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const addLink = () => {
        const url = window.prompt("Введите URL:");
        if (url) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    };

    return (
        <div className="rich-editor">
            <div className="editor-toolbar">
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={!htmlMode && !previewMode && editor.isActive("heading", { level: 2 })}
                    disabled={htmlMode || previewMode}
                    title="Заголовок H2"
                >
                    H2
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={!htmlMode && !previewMode && editor.isActive("heading", { level: 3 })}
                    disabled={htmlMode || previewMode}
                    title="Заголовок H3"
                >
                    H3
                </ToolBtn>
                <span className="divider" />
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={!htmlMode && !previewMode && editor.isActive("bold")}
                    disabled={htmlMode || previewMode}
                    title="Жирный"
                >
                    <b>B</b>
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={!htmlMode && !previewMode && editor.isActive("italic")}
                    disabled={htmlMode || previewMode}
                    title="Курсив"
                >
                    <i>I</i>
                </ToolBtn>
                <span className="divider" />
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={!htmlMode && !previewMode && editor.isActive("bulletList")}
                    disabled={htmlMode || previewMode}
                    title="Маркированный список"
                >
                    •
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={!htmlMode && !previewMode && editor.isActive("orderedList")}
                    disabled={htmlMode || previewMode}
                    title="Нумерованный список"
                >
                    1.
                </ToolBtn>
                <span className="divider" />
                <ToolBtn onClick={addLink} active={!htmlMode && !previewMode && editor.isActive("link")} disabled={htmlMode || previewMode} title="Ссылка">
                    🔗
                </ToolBtn>
                <ToolBtn onClick={handleImageUpload} disabled={htmlMode || previewMode} title="Вставить изображение">
                    🖼️
                </ToolBtn>
                <button
                    type="button"
                    onClick={() => setPreviewMode((p) => !p)}
                    className={`tool-btn ${previewMode ? "is-active" : ""}`}
                    title="Предпросмотр"
                    style={{ marginLeft: "auto" }}
                >
                    👁️ Предпросмотр
                </button>
                <button
                    type="button"
                    onClick={toggleHtmlMode}
                    className={`tool-btn ${htmlMode && !previewMode ? "is-active" : ""}`}
                    title="HTML код (для таблиц, видео и спойлеров)"
                >
                    {"</> HTML"}
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {previewMode ? (
                <div
                    className="editor-content content-body"
                    style={{ background: "#fcfcfc", borderTop: "1px dashed #ccc" }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(value || "") }}
                />
            ) : htmlMode ? (
                <textarea
                    className="editor-content"
                    rows={14}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ fontFamily: "monospace", width: "100%", border: "none", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
            ) : (
                <EditorContent editor={editor} className="editor-content" />
            )}
        </div>
    );
}

function ToolBtn({
    onClick,
    active = false,
    disabled = false,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`tool-btn ${active ? "is-active" : ""}`}
            title={title}
        >
            {children}
        </button>
    );
}