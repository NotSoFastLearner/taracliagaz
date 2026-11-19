import { Link } from "react-router-dom";
import { getApiOrigin } from "../utils/urls";
import { COMPANY_PHONES, COMPANY_EMAIL } from "../utils/site";
import { IconMapPin, IconPhone, IconHelpCircle, IconFire, IconMail, IconMap } from "../components/icons";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useLanguage();

    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-col">
                    <strong className="footer-heading">SRL «Taraclia Gaz»</strong>
                    <p className="footer-item">
                        <IconMapPin width={16} height={16} />
                        <span>{t('footer.address')}</span>
                    </p>
                    <p className="footer-item">
                        <IconMail width={16} height={16} />
                        <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
                    </p>
                    <p className="footer-copy">© {currentYear} SRL «Taraclia Gaz»</p>
                </div>

                <div className="footer-col">
                    <strong className="footer-heading">{t('contacts.phones')}</strong>
                    <p className="footer-item">
                        <IconPhone width={16} height={16} />
                        <a href={`tel:${COMPANY_PHONES.office}`}>{COMPANY_PHONES.office}</a>
                    </p>
                    <p className="footer-item">
                        <IconHelpCircle width={16} height={16} />
                        <a href={`tel:${COMPANY_PHONES.qa}`}>{COMPANY_PHONES.qa}</a>
                    </p>
                    <div className="footer-emergency">
                        <IconFire width={16} height={16} />
                        <span>{t('contacts.emergency')}:</span>
                        <a href={`tel:${COMPANY_PHONES.emergency}`} className="emergency">
                            {COMPANY_PHONES.emergency}
                        </a>
                    </div>
                </div>

                <nav className="footer-col footer-legal" aria-label={t('footer.privacy')}>
                    <strong className="footer-heading">{t('transparency.title')}</strong>
                    <Link to="/page/privacy">{t('footer.privacy')}</Link>
                    <Link to="/page/terms">{t('footer.terms')}</Link>
                    <Link to="/page/cookies">{t('footer.cookies')}</Link>
                    <a
                        href={`${getApiOrigin()}/sitemap.xml`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <IconMap width={15} height={15} /> {t('footer.sitemap')}
                    </a>
                </nav>
            </div>
        </footer>
    );
}
