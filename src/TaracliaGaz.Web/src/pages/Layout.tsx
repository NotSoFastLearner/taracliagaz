import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";
import FeedbackButton from "../components/FeedbackButton";
import LocalBusinessSchema from "../components/LocalBusinessSchema";

export interface SiteOutletContext {
    languageCode: string;
}

export default function Layout() {
    const context: SiteOutletContext = { languageCode: "ru" };

    return (
        <div className="site">
            <a href="#main-content" className="skip-link">
                Перейти к содержимому
            </a>

            <Header />
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