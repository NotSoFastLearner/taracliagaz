import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFoundPage() {
    return (
        <>
            <SEO
                title="Страница не найдена"
                description="Запрошенная страница не существует на сайте Тараклия-ГАЗ"
                path="/404"
                noindex
            />

            <section className="section">
                <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <h1 style={{ fontSize: "120px", margin: 0, color: "#1e40af" }}>404</h1>
                    <h2>Страница не найдена</h2>
                    <p>
                        К сожалению, запрошенная страница не существует или была перемещена.
                    </p>
                    <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "center" }}>
                        <Link to="/" className="btn btn-primary">
                            🏠 На главную
                        </Link>
                        <Link to="/page/contacts" className="btn btn-secondary">
                            📞 Контакты
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}