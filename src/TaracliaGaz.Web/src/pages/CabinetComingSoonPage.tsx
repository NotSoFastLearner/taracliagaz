import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function CabinetComingSoonPage() {
    return (
        <>
            <SEO
                title="Личный кабинет (в разработке)"
                description="Сервис личного кабинета потребителя находится в разработке."
                path="/cabinet"
                noindex
            />

            <section className="section">
                <div className="container">
                    <h1>Личный кабинет</h1>
                    <p style={{ maxWidth: "600px", lineHeight: 1.7 }}>
                        Сервис личного кабинета находится в разработке.
                        В будущем здесь будут доступны электронные услуги для потребителей природного газа.
                    </p>
                    <p style={{ marginTop: "2rem" }}>
                        По всем вопросам обращайтесь в наш офис или по телефонам, указанным в разделе{" "}
                        <Link to="/contacts">Контакты</Link>.
                    </p>
                </div>
            </section>
        </>
    );
}