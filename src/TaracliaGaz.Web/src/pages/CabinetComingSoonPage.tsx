import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const FEATURES = [
    {
        icon: "👤",
        title: "Смена домовладельца",
        description: "Электронная подача заявления на переоформление договора",
        status: "planned"
    },
    {
        icon: "🔥",
        title: "Вкл/Выкл газоснабжения",
        description: "Заявки на подключение и отключение газопровода онлайн",
        status: "planned"
    },
    {
        icon: "📊",
        title: "Показания счётчика",
        description: "Подача показаний и история потребления",
        status: "planned"
    },
    {
        icon: "💳",
        title: "Оплата онлайн",
        description: "Оплата счетов банковской картой",
        status: "planned"
    },
    {
        icon: "📄",
        title: "История платежей",
        description: "Все ваши платежи в одном месте",
        status: "planned"
    },
    {
        icon: "📨",
        title: "Электронные счета",
        description: "Получение счетов на email вместо бумажных",
        status: "planned"
    },
];

export default function CabinetComingSoonPage() {
    return (
        <>
            <SEO
                title="Личный кабинет (в разработке)"
                description="В будущем: смена домовладельца онлайн, включение/отключение газоснабжения, подача показаний счётчика, оплата счетов."
                path="/cabinet"
                noindex
            />

            <section className="section coming-soon-section">
                <div className="container">
                    <div className="coming-soon-badge">
                        <span className="pulse-dot"></span>
                        В разработке
                    </div>

                    <h1>🏠 Личный кабинет потребителя</h1>
                    <p className="coming-soon-subtitle">
                        Мы разрабатываем удобный электронный сервис для потребителей природного газа.
                        Скоро все услуги станут доступны онлайн — без очередей и визитов в офис.
                    </p>

                    <div className="features-grid">
                        {FEATURES.map((feature, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <span className="feature-status">Скоро</span>
                            </div>
                        ))}
                    </div>

                    <div className="coming-soon-cta">
                        <h2>Пока вы можете воспользоваться нашими услугами:</h2>
                        <div className="cta-buttons">
                            <Link to="/page/contacts" className="btn btn-primary">
                                📞 Позвонить в офис
                            </Link>
                            <Link to="/page/services" className="btn btn-secondary">
                                📋 Услуги компании
                            </Link>
                            <Link to="/page/faq" className="btn btn-secondary">
                                ❓ Вопросы-Ответы
                            </Link>
                        </div>
                    </div>

                    <div className="coming-soon-contact">
                        <p>
                            Хотите получать уведомления о запуске? Напишите нам на{" "}
                            <a href="mailto:office@taraclia-gaz.md">office@taraclia-gaz.md</a>{" "}
                            с темой «Личный кабинет»
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}