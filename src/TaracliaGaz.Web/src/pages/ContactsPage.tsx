import { useState, type FormEvent } from "react";
import SEO from "../components/SEO";
import { submitContact, type ContactFormData } from "../api/contentApi";
import { IconPhone, IconMail, IconMapPin, IconClock } from "../components/icons";
import { useLanguage } from "../context/LanguageContext";

export default function ContactsPage() {
    const { t } = useLanguage();
    const [form, setForm] = useState<ContactFormData>({
        name: "",
        email: "",
        phone: "",
        message: "",
        websiteUrl: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (!form.name.trim() || form.name.trim().length < 2) {
            errs.name = t('contacts.nameError');
        }
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = t('contacts.emailError');
        }
        if (!form.message.trim() || form.message.trim().length < 10) {
            errs.message = t('contacts.messageShort');
        }
        if (form.message.length > 5000) {
            errs.message = t('contacts.messageLong');
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        setSubmitError(null);

        if (!validate()) return;

        setSubmitting(true);
        try {
            const result = await submitContact(form);
            setSuccess(result.message);
            setForm({ name: "", email: "", phone: "", message: "", websiteUrl: "" });
            setErrors({});
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : t('contacts.sendError');
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field: keyof ContactFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    return (
        <>
            <SEO
                title={t('contacts.title')}
                description={t('seo.contactsDesc')}
                path="/contacts"
            />
            <section className="section">
                <div className="container">
                    <h1>{t('contacts.title')}</h1>

                    <div className="contacts-grid">
                        <div className="contact-info">
                            <h2>{t('contacts.coords')}</h2>

                            <p>
                                <IconMapPin />{" "}
                                <strong>{t('contacts.address')}:</strong>
                                <br />
                                MD-7401, Republica Moldova,
                                <br />
                                or. Taraclia, str. Lenin, 110A
                            </p>

                            <p>
                                <IconPhone />{" "}
                                <strong>{t('contacts.phones')}:</strong>
                                <br />
                                <a href="tel:+37329422404">+373 (294) 2-24-04</a>
                                <br />
                                <a href="tel:+37329422405">+373 (294) 2-24-05</a>
                            </p>

                            <p>
                                <IconPhone />{" "}
                                <strong>
                                    {t('contacts.emergency')}:
                                </strong>
                                <br />
                                <a href="tel:904" className="emergency">
                                    904
                                </a>
                            </p>

                            <p>
                                <IconMail />{" "}
                                <strong>Email:</strong>
                                <br />
                                <a href="mailto:office@taraclia-gaz.md">
                                    office@taraclia-gaz.md
                                </a>
                            </p>

                            <p>
                                <IconClock />{" "}
                                <strong>{t('contacts.workingHours')}:</strong>
                                <br />
                                {t('contacts.workdays')}
                                <br />
                                {t('contacts.weekend')}
                                <br />
                                <em>{t('contacts.emergency247')}</em>
                            </p>
                        </div>

                        <div className="contact-form">
                            <h2>{t('contacts.feedback')}</h2>

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}

                            {submitError && (
                                <div className="alert alert-error" role="alert">
                                    {submitError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="form-field">
                                    <label htmlFor="contact-name">
                                        {t('form.name')} <span className="required">*</span>
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            updateField("name", e.target.value)
                                        }
                                        aria-invalid={!!errors.name}
                                        aria-describedby={
                                            errors.name ? "name-error" : undefined
                                        }
                                        disabled={submitting}
                                    />
                                    {errors.name && (
                                        <span
                                            id="name-error"
                                            className="field-error"
                                            role="alert"
                                        >
                                            {errors.name}
                                        </span>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-email">
                                        Email <span className="required">*</span>
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            updateField("email", e.target.value)
                                        }
                                        aria-invalid={!!errors.email}
                                        aria-describedby={
                                            errors.email ? "email-error" : undefined
                                        }
                                        disabled={submitting}
                                    />
                                    {errors.email && (
                                        <span
                                            id="email-error"
                                            className="field-error"
                                            role="alert"
                                        >
                                            {errors.email}
                                        </span>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-phone">
                                        {t('form.phone')} <small>({t('contacts.optional')})</small>
                                    </label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) =>
                                            updateField("phone", e.target.value)
                                        }
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-message">
                                        {t('form.message')} <span className="required">*</span>
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) =>
                                            updateField("message", e.target.value)
                                        }
                                        aria-invalid={!!errors.message}
                                        aria-describedby={
                                            errors.message
                                                ? "message-error"
                                                : "message-hint"
                                        }
                                        disabled={submitting}
                                    />
                                    {errors.message ? (
                                        <span
                                            id="message-error"
                                            className="field-error"
                                            role="alert"
                                        >
                                            {errors.message}
                                        </span>
                                    ) : (
                                        <small id="message-hint">
                                            {form.message.length}/5000 {t('contacts.charsCount')}
                                        </small>
                                    )}
                                </div>

                                <button type="submit" disabled={submitting}>
                                    {submitting ? t('contacts.sending') : t('contacts.send')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
