import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

export default function CabinetComingSoonPage() {
    const { t } = useLanguage();

    return (
        <>
            <SEO
                title={t('cabinet.title')}
                description={t('seo.cabinetDesc')}
                path="/cabinet"
                noindex
            />

            <section className="section">
                <div className="container">
                    <h1>{t('cabinet.title')}</h1>
                    <p style={{ maxWidth: "600px", lineHeight: 1.7 }}>
                        {t('cabinet.text')}
                    </p>
                    <p style={{ marginTop: "2rem" }}>
                        {t('cabinet.note')}{" "}
                        <Link to="/contacts">{t('nav.contacts')}</Link>.
                    </p>
                </div>
            </section>
        </>
    );
}
