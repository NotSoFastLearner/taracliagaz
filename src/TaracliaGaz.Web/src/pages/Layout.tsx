import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";
import Analytics from "../components/Analytics";
import LocalBusinessSchema from "../components/LocalBusinessSchema";
export interface SiteOutletContext {
    languageCode: string;
}

export default function Layout() {
    const context: SiteOutletContext = { languageCode: "ru" };

    return (
        <div className="site">
            <Header />
            <LocalBusinessSchema />
            <main id="main-content">
                <Outlet context={context} />
            </main>
            <Footer />
            <CookieBanner />
            <Analytics />
        </div>
    );
}