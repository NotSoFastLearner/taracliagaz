import { useState } from "react";
import { z } from "zod";
import { submitContact } from "../api/contentApi";

const feedbackSchema = z.object({
    name: z.string().min(2, "Укажите имя").max(100),
    email: z.string().email("Некорректный email"),
    message: z.string().min(5, "Минимум 5 символов").max(2000),
    type: z.enum(["bug", "idea", "other"]),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

const TYPE_LABELS = {
    bug: "Нашёл ошибку",
    idea: "Есть идея",
    other: "✉️ Другое",
};

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<FeedbackForm>({
        name: "",
        email: "",
        message: "",
        type: "idea",
    });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = feedbackSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as string;
                if (field && !fieldErrors[field]) {
                    fieldErrors[field] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        setStatus("sending");
        try {
            await submitContact({
                name: `[Feedback: ${TYPE_LABELS[form.type]}] ${form.name}`,
                email: form.email,
                message: `Тип: ${TYPE_LABELS[form.type]}\n\n${form.message}`,
                websiteUrl: "",  // honeypot
            });
            setStatus("success");
            setForm({ name: "", email: "", message: "", type: "idea" });
            setTimeout(() => {
                setIsOpen(false);
                setStatus("idle");
            }, 3000);
        } catch {
            setStatus("error");
        }
    };

    return (
        <>
            <button
                className={`feedback-toggle ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Закрыть форму обратной связи" : "Открыть форму обратной связи"}
                title="Сообщить об ошибке или предложить улучшение"
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {isOpen && (
                <div className="feedback-modal" role="dialog" aria-label="Обратная связь">
                    <div className="feedback-header">
                        <h3>Помогите улучшить сайт</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="feedback-close"
                            aria-label="Закрыть"
                        >
                            ✕
                        </button>
                    </div>

                    {status === "success" ? (
                        <div className="feedback-success">
                            Спасибо! Мы получили ваше сообщение.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="feedback-form">
                            <div className="feedback-types">
                                {(["bug", "idea", "other"] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`feedback-type ${form.type === type ? "active" : ""}`}
                                        onClick={() => setForm({ ...form, type })}
                                    >
                                        {TYPE_LABELS[type]}
                                    </button>
                                ))}
                            </div>

                            <div className="form-field">
                                <label htmlFor="fb-name">Имя</label>
                                <input
                                    id="fb-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                {errors.name && <span className="field-error">{errors.name}</span>}
                            </div>

                            <div className="form-field">
                                <label htmlFor="fb-email">Email</label>
                                <input
                                    id="fb-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>

                            <div className="form-field">
                                <label htmlFor="fb-message">Сообщение</label>
                                <textarea
                                    id="fb-message"
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    rows={4}
                                    placeholder="Опишите ошибку или идею..."
                                />
                                {errors.message && <span className="field-error">{errors.message}</span>}
                            </div>

                            {status === "error" && (
                                <div className="alert alert-error">
                                    Ошибка отправки. Попробуйте позже.
                                </div>
                            )}

                            <button type="submit" disabled={status === "sending"}>
                                {status === "sending" ? "Отправка..." : "Отправить"}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}