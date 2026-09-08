import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-inner">
                {/* Основная информация */}
                <div className="footer-main">
                    <p className="footer-copyright">
                        SRL «Taraclia Gaz» © {currentYear}
                    </p>
                    <address className="footer-contacts">
                        <span>📞 тел: 0-294-22-4-04</span>
                        <span>Аварийная служба: <strong>904</strong></span>
                        <a href="mailto:office@taraclia-gaz.md">✉️ office@taraclia-gaz.md</a>
                    </address>
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