import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-inner">
                {/* Основная информация */}
                <div className="footer-section">
                    <h4>SRL «Taraclia Gaz»</h4>
                    <p>© {currentYear}</p>
                    <p>📍 г. Тараклия, ул. Мира, 45</p>
                    <p>📞 <a href="tel:+37329422404">0-294-22-4-04</a></p>
                    <p>❓ <a href="tel:+37329422405">0-294-22-4-05</a></p>
                    <p>🔥 Аварийная служба (24/7): <strong><a href="tel:904">904</a></strong></p>
                    <p>✉️ <a href="mailto:office@taraclia-gaz.md">office@taraclia-gaz.md</a></p>
                </div>

                {/* Юридические ссылки */}
                <nav className="footer-legal">
                    <Link to="/page/privacy">Политика конфиденциальности</Link>
                    <Link to="/page/terms">Условия использования</Link>
                    <Link to="/page/cookies">Политика cookies</Link>
                    <a
                        href="http://localhost:8000/sitemap.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        🗺️ Карта сайта
                    </a>
                </nav>
            </div>
        </footer>
    );
}