import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from '../components/Header';
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";
import FeedbackButton from "../components/FeedbackButton";
import LocalBusinessSchema from "../components/LocalBusinessSchema";
import { useLanguage } from "../context/LanguageContext";
import { getMenu } from "../api/contentApi";
import { buildMenuTree } from "../utils/menuHelpers";
import type { MenuItem } from "../types/content";

export interface SiteOutletContext {
    languageCode: string;
}

export default function Layout() {
    const { language, t } = useLanguage();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        getMenu(language)
            .then((items) => setMenuItems(buildMenuTree(items)))
            .catch(console.error);
    }, [language]);

    const context: SiteOutletContext = { languageCode: language };

    return (
        <div className="site">
            <a href="#main-content" className="skip-link">
                {t('common.skipLink')}
            </a>

            <Header menuItems={menuItems} />
            <LocalBusinessSchema />

            <main id="main-content" className="site-main" tabIndex={-1}>
                <Outlet context={context} />
            </main>

            <Footer />
            <FeedbackButton />
            <CookieBanner />
        </div>
    );
}
