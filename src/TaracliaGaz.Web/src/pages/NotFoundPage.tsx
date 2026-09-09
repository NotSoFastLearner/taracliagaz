import { Link } from "react-router-dom";
import { IconHome, IconPhone } from "../components/icons";

export default function NotFoundPage() {
    return (
        <section className="section" style={{ textAlign: "center", padding: "4rem 0" }}>
            <div className="container">
                <h1 style={{ fontSize: "96px", margin: 0, color: "#0057b8" }}>404</h1>
                <h2>Страница не найдена</h2>
                <p>Запрошенная страница не существует или была перемещена.</p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
                    <Link to="/" className="btn btn-primary">
                        <IconHome /> На главную
                    </Link>
                    <a href="tel:904" className="btn btn-secondary">
                        <IconPhone /> Позвонить
                    </a>
                </div>
            </div>
        </section>
    );
}