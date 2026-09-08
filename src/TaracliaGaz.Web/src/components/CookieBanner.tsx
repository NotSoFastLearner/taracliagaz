import { useState } from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "../hooks/useCookieConsent";

export default function CookieBanner() {
    const { consent, acceptAll, rejectAll } = useCookieConsent();
    const [showDetails, setShowDetails] = useState(false);

    // Уже принял решение — не показываем
    if (consent !== null) return null;

    return (
        <div className="cookie-banner">
            <div className="cookie-container">
                <div className="cookie-icon">🍪</div>

                <div className="cookie-content">
                    <h3>Мы используем cookies</h3>
                    <p>
                        Этот сайт использует файлы cookie для обеспечения работы сайта и улучшения
                        вашего опыта. Продолжая использовать сайт, вы соглашаетесь с нашей{" "}
                        <Link to="/page/privacy" target="_blank" rel="noopener noreferrer">
                            политикой конфиденциальности
                        </Link>.
                    </p>

                    {showDetails && (
                        <div className="cookie-details">
                            <div className="cookie-category">
                                <div className="cookie-category-header">
                                    <strong>🔒 Необходимые cookies</strong>
                                    <span className="badge required">Обязательные</span>
                                </div>
                                <p>
                                    Обеспечивают базовую работу сайта: авторизация, сохранение настроек.
                                    Не могут быть отключены.
                                </p>
                            </div>

                            <div className="cookie-category">
                                <div className="cookie-category-header">
                                    <strong>📊 Аналитические cookies</strong>
                                    <span className="badge optional">Опциональные</span>
                                </div>
                                <p>
                                    Помогают нам понимать, как посетители используют сайт,
                                    чтобы мы могли его улучшать. Данные анонимны.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="cookie-actions">
                    {!showDetails ? (
                        <>
                            <button className="btn-cookie btn-details" onClick={() => setShowDetails(true)}>
                                Настроить
                            </button>
                            <button className="btn-cookie btn-reject" onClick={rejectAll}>
                                Только необходимые
                            </button>
                            <button className="btn-cookie btn-accept" onClick={acceptAll}>
                                Принять все
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn-cookie btn-reject" onClick={rejectAll}>
                                Отклонить аналитику
                            </button>
                            <button className="btn-cookie btn-accept" onClick={acceptAll}>
                                Принять все
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}