import { Link } from "react-router-dom";
import { IconHome, IconPhone } from "../components/icons";
import { useLanguage } from "../context/LanguageContext";

export default function NotFoundPage() {
    const { t } = useLanguage();

    return (
        <section className="section not-found-page">
            <div className="container">
                <h1 className="not-found-code">404</h1>
                <h2>{t('notfound.title')}</h2>
                <p>{t('notfound.text')}</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn btn-primary">
                        <IconHome /> {t('notfound.home')}
                    </Link>
                    <a href="tel:904" className="btn btn-secondary">
                        <IconPhone /> {t('notfound.call')}
                    </a>
                </div>
            </div>
        </section>
    );
}
