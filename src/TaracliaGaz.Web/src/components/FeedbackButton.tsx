import { useState } from "react";
import { submitContact } from "../api/contentApi";
import { useLanguage } from "../context/LanguageContext";

type FeedbackType = "bug" | "idea" | "other";

interface FeedbackForm {
    name: string;
    email: string;
    message: string;
    type: FeedbackType;
}

export default function FeedbackButton({ aboveCookieBanner = false }: { aboveCookieBanner?: boolean }) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<FeedbackForm>({
        name: "",
        email: "",
        message: "",
        type: "idea",
    });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const TYPE_LABELS: Record<FeedbackType, string> = {
        bug: t('feedback.bug'),
        idea: t('feedback.idea'),
        other: t('feedback.other'),
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const fieldErrors: { name?: string; email?: string; message?: string } = {};
        const trimmedName = form.name.trim();
        const trimmedEmail = form.email.trim();
        const trimmedMessage = form.message.trim();

        if (trimmedName.length < 2 || trimmedName.length > 100) {
            fieldErrors.name = t('feedback.nameError');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            fieldErrors.email = t('feedback.emailError');
        }
        if (trimmedMessage.length < 5 || form.message.length > 2000) {
            fieldErrors.message = t('feedback.messageError');
        }
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setStatus("sending");
        try {
            await submitContact({
                name: `[Feedback: ${TYPE_LABELS[form.type]}] ${trimmedName}`,
                email: trimmedEmail,
                message: `${t('feedback.typeLabel')}: ${TYPE_LABELS[form.type]}\n\n${trimmedMessage}`,
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
                className={`feedback-toggle ${isOpen ? "open" : ""} ${aboveCookieBanner ? "above-cookie" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? t('feedback.closeForm') : t('feedback.open')}
                title={t('feedback.tooltip')}
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {isOpen && (
                <div className="feedback-modal" role="dialog" aria-label={t('feedback.dialogLabel')}>
                    <div className="feedback-header">
                        <h3>{t('feedback.title')}</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="feedback-close"
                            aria-label={t('close')}
                        >
                            ✕
                        </button>
                    </div>

                    {status === "success" ? (
                        <div className="feedback-success">
                            {t('feedback.success')}
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
                                <label htmlFor="fb-name">{t('form.name')}</label>
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
                                <label htmlFor="fb-message">{t('form.message')}</label>
                                <textarea
                                    id="fb-message"
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    rows={4}
                                    placeholder={t('feedback.placeholder')}
                                />
                                {errors.message && <span className="field-error">{errors.message}</span>}
                            </div>

                            {status === "error" && (
                                <div className="alert alert-error">
                                    {t('contacts.sendError')}
                                </div>
                            )}

                            <button type="submit" disabled={status === "sending"}>
                                {status === "sending" ? t('contacts.sending') : t('feedback.send')}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}
