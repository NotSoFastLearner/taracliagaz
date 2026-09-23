
import { useEffect, useState } from "react";
import {
    deleteContact,
    getContactsAdmin,
    markContactRead,
    type ContactMessage,
} from "../../api/adminApi";

export default function ContactsManager() {
    const [contacts, setContacts] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadContacts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getContactsAdmin();
            setContacts(response);
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить сообщения.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, []);

    const handleMarkRead = async (id: number) => {
        try {
            await markContactRead(id);

            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === id
                        ? { ...contact, isRead: true }
                        : contact
                )
            );
        } catch (err) {
            console.error(err);
            setError("Не удалось отметить сообщение как прочитанное.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Удалить это сообщение?")) {
            return;
        }

        try {
            await deleteContact(id);

            setContacts((prev) =>
                prev.filter((contact) => contact.id !== id)
            );
        } catch (err) {
            console.error(err);
            setError("Не удалось удалить сообщение.");
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("ru-RU", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    if (loading) {
        return (
            <section className="admin-section">
                <h1>Обратная связь</h1>
                <p>Загрузка сообщений...</p>
            </section>
        );
    }

    return (
        <section className="admin-section">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                }}
            >
                <div>
                    <h1>Обратная связь</h1>
                    <p style={{ color: "#666", marginTop: "0.5rem" }}>
                        Сообщения, отправленные через форму обратной связи.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadContacts}
                    className="admin-btn"
                >
                    Обновить
                </button>
            </div>

            {error && (
                <div
                    style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        background: "#ffebee",
                        color: "#c62828",
                        borderRadius: "6px",
                    }}
                >
                    {error}
                </div>
            )}

            {contacts.length === 0 ? (
                <div className="admin-card">
                    <p>Сообщений пока нет.</p>
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {contacts.map((contact) => (
                        <article
                            key={contact.id}
                            className="admin-card"
                            style={{
                                borderLeft: contact.isRead
                                    ? "4px solid #ddd"
                                    : "4px solid #1a50b2",
                                opacity: contact.isRead ? 0.85 : 1,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: "1rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                <div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: "1.15rem",
                                        }}
                                    >
                                        {contact.name}
                                    </h2>

                                    <div
                                        style={{
                                            marginTop: "0.4rem",
                                            color: "#666",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {formatDate(contact.createdAt)}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        flexWrap: "wrap",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    {!contact.isRead && (
                                        <span
                                            style={{
                                                padding: "0.25rem 0.6rem",
                                                background: "#e3f2fd",
                                                color: "#1565c0",
                                                borderRadius: "12px",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Новое
                                        </span>
                                    )}

                                    {contact.isSpam && (
                                        <span
                                            style={{
                                                padding: "0.25rem 0.6rem",
                                                background: "#ffebee",
                                                color: "#c62828",
                                                borderRadius: "12px",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Спам
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "0.5rem 1.5rem",
                                    marginBottom: "1rem",
                                    padding: "0.75rem",
                                    background: "#f7f7f7",
                                    borderRadius: "6px",
                                }}
                            >
                                <div>
                                    <strong>Email:</strong>{" "}
                                    <a href={`mailto:${ contact.email }`}>
                                        {contact.email}
                                    </a>
                                </div>

                                {contact.phone && (
                                    <div>
                                        <strong>Телефон:</strong>{" "}
                                        <a href={`tel:${ contact.phone }`}>
                                            {contact.phone}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    padding: "1rem",
                                    background: "#fafafa",
                                    borderRadius: "6px",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    lineHeight: 1.6,
                                    marginBottom: "1rem",
                                }}
                            >
                                {contact.message}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    flexWrap: "wrap",
                                }}
                            >
                                {!contact.isRead && (
                                    <button
                                        type="button"
                                        className="admin-btn"
                                        onClick={() =>
                                            handleMarkRead(contact.id)
                                        }
                                    >
                                        Отметить прочитанным
                                    </button>
                                )}

                                <a
                                    href={`mailto:${ contact.email }?subject = Ответ % 20на % 20сообщение % 20с % 20сайта % 20Тараклия - ГАЗ`}
                                    className="admin-btn"
                                    style={{
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                    }}
                                >
                                    Ответить
                                </a>

                                <button
                                    type="button"
                                    className="admin-btn"
                                    onClick={() =>
                                        handleDelete(contact.id)
                                    }
                                    style={{
                                        background: "#d32f2f",
                                        borderColor: "#d32f2f",
                                    }}
                                >
                                    Удалить
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}