import { Link } from "react-router-dom";
import { getApiOrigin } from "../utils/urls";
import { COMPANY_ADDRESS, COMPANY_PHONES, COMPANY_EMAIL } from "../utils/site";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-inner">
                <div className="footer-section">
                    <h4>SRL «Taraclia Gaz»</h4>
                    <p>© {currentYear}</p>
                    <p>
                        {COMPANY_ADDRESS.city}, {COMPANY_ADDRESS.street}
                    </p>
                    <p>
                        <a href={`tel:${COMPANY_PHONES.office}`}>{COMPANY_PHONES.office}</a>
                    </p>
                    <p>
                        <a href={`tel:${COMPANY_PHONES.qa}`}>{COMPANY_PHONES.qa}</a>
                    </p>
                    <p>
                        Аварийная служба (24/7):{" "}
                        <strong>
                            <a href={`tel:${COMPANY_PHONES.emergency}`}>
                                {COMPANY_PHONES.emergency}
                            </a>
                        </strong>
                    </p>
                    <p>
                        <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
                    </p>
                </div>

                <nav className="footer-legal">
                    <Link to="/page/privacy">Политика конфиденциальности</Link>
                    <Link to="/page/terms">Условия использования</Link>
                    <Link to="/page/cookies">Политика cookies</Link>
                    <a
                        href={`${getApiOrigin()}/sitemap.xml`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Карта сайта
                    </a>
                </nav>
            </div>
        </footer>
    );
}