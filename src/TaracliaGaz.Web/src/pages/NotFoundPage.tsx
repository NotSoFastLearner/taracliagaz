import { Link } from "react-router-dom";
import { IconHome, IconPhone } from "../components/icons";

export default function NotFoundPage() {
    return (
        <section className="section not-found-page">
            <div className="container">
                <h1 className="not-found-code">404</h1>
                <h2>Страница не найдена</h2>
                <p>Запрошенная страница не существует или была перемещена.</p>
                <div className="not-found-actions">
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