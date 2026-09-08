import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";
import { uploadImage } from "../api/uploadApi";

interface RichEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Синхронизация value извне (например, при редактировании существующей новости)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) return null;

    const handleImageUpload = async () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const response = await uploadImage(file);
            const fullUrl = `http://localhost:8000${response.url}`;
            editor.chain().focus().setImage({ src: fullUrl }).run();
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
            {/* Панель инструментов */}
            <div className="editor-toolbar">
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="Заголовок H2"
                >
                    H2
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                    title="Заголовок H3"
                >
                    H3
                </ToolBtn>
                <span className="divider" />
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Жирный"
                >
                    <b>B</b>
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Курсив"
                >
                    <i>I</i>
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="Подчёркнутый"
                    disabled
                >
                    <u>U</u>
                </ToolBtn>
                <span className="divider" />
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Маркированный список"
                >
                    •
                </ToolBtn>
                <ToolBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Нумерованный список"
                >
                    1.
                </ToolBtn>
                <span className="divider" />
                <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Ссылка">
                    🔗
                </ToolBtn>
                <ToolBtn onClick={handleImageUpload} title="Вставить изображение">
                    🖼️
                </ToolBtn>
            </div>

            {/* Скрытый input для выбора файла */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {/* Редактор */}
            <EditorContent editor={editor} className="editor-content" />
        </div>
    );
}

// Вспомогательная кнопка тулбара
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