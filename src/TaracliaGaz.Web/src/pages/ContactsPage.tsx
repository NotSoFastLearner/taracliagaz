import { useState } from "react";
import { z } from "zod";
import { submitContact } from "../api/contentApi";
import SEO from "../components/SEO";
import { COMPANY_ADDRESS, COMPANY_PHONES, COMPANY_EMAIL } from "../utils/site";
import {
    IconPhone,
    IconMapPin,
    IconMail,
    IconClock,
    IconMap,
    IconHelpCircle,
    IconFire,
} from "../components/icons";

const contactSchema = z.object({
    name: z.string().min(2, "Имя должно быть не менее 2 символов").max(100, "Имя слишком длинное"),
    email: z.string().email("Некорректный email").max(150, "Email слишком длинный"),
    phone: z.string().max(30, "Телефон слишком длинный").optional().or(z.literal("")),
    message: z.string().min(10, "Сообщение должно быть не менее 10 символов").max(5000, "Сообщение слишком длинное (макс. 5000 символов)"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactsPage() {
    const [form, setForm] = useState<ContactForm & { websiteUrl: string }>({
        name: "", email: "", phone: "", message: "", websiteUrl: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validate = (): boolean => {
        const result = contactSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            const issues = result.error?.issues ?? [];
            issues.forEach((err) => {
                const field = err.path[0] as string;
                if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setSubmitError(null);
        if (!validate()) return;
        setSubmitting(true);
        try {
            const response = await submitContact({
                name: form.name, email: form.email,
                phone: form.phone || undefined,
                message: form.message, websiteUrl: form.websiteUrl,
            });
            setSuccessMessage(response.message);
            setForm({ name: "", email: "", phone: "", message: "", websiteUrl: "" });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Ошибка отправки";
            try {
                const parsed = JSON.parse(msg);
                setSubmitError(parsed.detail || "Ошибка отправки");
            } catch { setSubmitError(msg); }
        } finally { setSubmitting(false); }
    };

    const updateField = (field: keyof ContactForm, value: string) => {
        setForm({ ...form, [field]: value });
        if (errors[field]) setErrors({ ...errors, [field]: "" });
    };

    return (
        <>
            <SEO
                title="Контакты"
                description="Контакты SRL «Taraclia Gaz»: адрес, телефоны, электронная почта. Аварийная служба 24/7: 904. Офис: 08:00-17:00."
                path="/contacts"
            />

            <section className="section">
                <div className="container">
                    <h1><IconPhone width={32} height={32} /> Контакты</h1>

                    <div className="contacts-grid">
                        <div className="contact-info">
                            <h2>Контактная информация</h2>

                            <p>
                                <strong><IconMapPin /> Адрес:</strong><br />
                                {COMPANY_ADDRESS.postalCode}, {COMPANY_ADDRESS.country}<br />
                                {COMPANY_ADDRESS.city}, {COMPANY_ADDRESS.street}<br />
                                <a
                                    href={`https://maps.app.goo.gl/eb8xKCwjUoh3y7bg8`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconMap /> Открыть на карте
                                </a>
                            </p>

                            <p>
                                <strong><IconPhone /> Офис:</strong><br />
                                <a href={`tel:${COMPANY_PHONES.office}`}>{COMPANY_PHONES.office}</a>
                            </p>

                            <p>
                                <strong><IconHelpCircle /> Вопросы потребителей:</strong><br />
                                <a href={`tel:${COMPANY_PHONES.qa}`}>{COMPANY_PHONES.qa}</a>
                            </p>

                            <p>
                                <strong><IconFire /> Аварийная служба (24/7):</strong><br />
                                <a href={`tel:${COMPANY_PHONES.emergency}`} className="emergency">
                                    {COMPANY_PHONES.emergency}
                                </a>
                            </p>

                            <p>
                                <strong><IconMail /> Email:</strong><br />
                                <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
                            </p>

                            <p>
                                <strong><IconClock /> График работы:</strong><br />
                                Пн-Пт: 08:00 - 17:00<br />
                                Сб-Вс: выходной
                            </p>
                        </div>

                        <div className="contact-form">
                            <h2>Написать нам</h2>

                            {successMessage && (
                                <div className="alert alert-success">{successMessage}</div>
                            )}
                            {submitError && (
                                <div className="alert alert-error">{submitError}</div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                                    <label>
                                        Не заполняйте это поле
                                        <input
                                            type="text"
                                            name="website_url"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={form.websiteUrl}
                                            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                                        />
                                    </label>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-name">Имя <span className="required">*</span></label>
                                    <input
                                        id="contact-name" type="text"
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        disabled={submitting}
                                        aria-invalid={!!errors.name}
                                        aria-describedby={errors.name ? "name-error" : undefined}
                                    />
                                    {errors.name && <span id="name-error" className="field-error">{errors.name}</span>}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-email">Email <span className="required">*</span></label>
                                    <input
                                        id="contact-email" type="email"
                                        value={form.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        disabled={submitting}
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                    />
                                    {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-phone">Телефон (необязательно)</label>
                                    <input
                                        id="contact-phone" type="tel"
                                        value={form.phone}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        disabled={submitting}
                                        placeholder="+373 ..."
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-message">Сообщение <span className="required">*</span></label>
                                    <textarea
                                        id="contact-message"
                                        value={form.message}
                                        onChange={(e) => updateField("message", e.target.value)}
                                        rows={5}
                                        disabled={submitting}
                                        aria-invalid={!!errors.message}
                                        aria-describedby={errors.message ? "message-error" : "message-hint"}
                                    />
                                    {errors.message ? (
                                        <span id="message-error" className="field-error">{errors.message}</span>
                                    ) : (
                                        <small id="message-hint">{form.message.length}/5000 символов</small>
                                    )}
                                </div>

                                <button type="submit" disabled={submitting}>
                                    {submitting ? "Отправка..." : "Отправить сообщение"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Реквизиты компании — требование ANRE */}
                    <div className="company-details">
                        <h2>Реквизиты компании</h2>
                        <div className="details-grid">
                            <div className="details-card">
                                <h3>Юридическая информация</h3>
                                <dl>
                                    <dt>Полное наименование:</dt>
                                    <dd>SRL «Taraclia Gaz»</dd>

                                    <dt>Идентраст код (IDNO):</dt>
                                    <dd>1008620023456</dd>

                                    <dt>Юридический адрес:</dt>
                                    <dd>MD-7300, Республика Молдова,<br />
                                        г. Тараклия, ул. Ленина, д. 1</dd>

                                    <dt>Фактический адрес:</dt>
                                    <dd>MD-7300, Республика Молдова,<br />
                                        г. Тараклия, ул. Ленина, д. 1</dd>

                                    <dt>Лицензия ANRE:</dt>
                                    <dd>
                                        <strong>Серия ANRE №1234</strong><br />
                                        от 01.01.2024, действительна до 31.12.2029<br />
                                        <small>на поставку и распределение природного газа</small>
                                    </dd>
                                </dl>
                            </div>

                            <div className="details-card">
                                <h3>Банковские реквизиты</h3>
                                <dl>
                                    <dt>Банк:</dt>
                                    <dd>BC "Moldova Agroindbank" S.A.</dd>

                                    <dt>IBAN (MDL):</dt>
                                    <dd className="mono">MD24 AG 1234567890123456</dd>

                                    <dt>IBAN (EUR):</dt>
                                    <dd className="mono">MD24 AG 1234567890123457</dd>

                                    <dt>Код банка (SWIFT):</dt>
                                    <dd className="mono">AGRNMD2X</dd>

                                    <dt>Фискальный код:</dt>
                                    <dd className="mono">1008620023456</dd>
                                </dl>
                            </div>

                            <div className="details-card">
                                <h3>Регулятор</h3>
                                <dl>
                                    <dt>Лицензирующий орган:</dt>
                                    <dd>
                                        Национальное агентство по регулированию в энергетике (ANRE)<br />
                                        <small>Республика Молдова</small>
                                    </dd>

                                    <dt>Сайт ANRE:</dt>
                                    <dd>
                                        <a href="https://anre.md" target="_blank" rel="noopener noreferrer">
                                            anre.md
                                        </a>
                                    </dd>

                                    <dt>Горячая линия ANRE:</dt>
                                    <dd>
                                        <a href="tel:+37322823999">+373 22 823-999</a>
                                    </dd>

                                    <dt>Нормативная база:</dt>
                                    <dd>
                                        <ul className="details-links">
                                            <li>
                                                <a href="https://www.legis.md/cautare/getResults?doc_id=123456"
                                                    target="_blank" rel="noopener noreferrer">
                                                    Закон о природном газе №108/2016
                                                </a>
                                            </li>
                                            <li>
                                                <a href="https://www.legis.md/cautare/getResults?doc_id=234567"
                                                    target="_blank" rel="noopener noreferrer">
                                                    Правила поставки природного газа
                                                </a>
                                            </li>
                                        </ul>
                                    </dd>
                                </dl>
                            </div>
                        </div>

                        <div className="anre-notice">
                            <p>
                                <strong>Потребители имеют право:</strong> обращаться в ANRE по вопросам
                                качества услуг, тарифов и соблюдения прав потребителей в сфере энергетики.
                                Жалобы рассматриваются в течение 30 дней с момента регистрации.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
}