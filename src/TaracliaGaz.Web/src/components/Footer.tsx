import { Link } from "react-router-dom";
import { getApiOrigin } from "../utils/urls";
import { COMPANY_ADDRESS, COMPANY_PHONES, COMPANY_EMAIL } from "../utils/site";
import { IconMapPin, IconPhone, IconHelpCircle, IconFire, IconMail, IconMap } from "../components/icons";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useLanguage();

    return (
        <footer className="footer">
            <div className="container footer-inner">
                <div className="footer-section">
                    <strong className="footer-heading">SRL «Taraclia Gaz»</strong>
                    <p>© {currentYear}</p>
                    <p><IconMapPin /> {COMPANY_ADDRESS.city}, {COMPANY_ADDRESS.street}</p>
                    <p><IconPhone /> <a href={`tel:${COMPANY_PHONES.office}`}>{COMPANY_PHONES.office}</a></p>
                    <p><IconHelpCircle /> <a href={`tel:${COMPANY_PHONES.qa}`}>{COMPANY_PHONES.qa}</a></p>
                    <p>
                        <IconFire /> {t('contacts.emergency')}:{" "}
                        <a href={`tel:${COMPANY_PHONES.emergency}`} className="emergency">
                            {COMPANY_PHONES.emergency}
                        </a>
                    </p>
                    <p><IconMail /> <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a></p>
                </div>

                <nav className="footer-legal">
                    <Link to="/page/privacy">{t('footer.privacy')}</Link>
                    <Link to="/page/terms">{t('footer.terms')}</Link>
                    <Link to="/page/cookies">{t('footer.cookies')}</Link>
                    <a
                        href={`${getApiOrigin()}/sitemap.xml`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <IconMap /> {t('footer.sitemap')}
                    </a>
                </nav>
            </div>
        </footer>
    );
}
