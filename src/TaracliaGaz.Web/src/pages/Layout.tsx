import { Outlet, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export interface SiteOutletContext {
  languageCode: string;
}

export function useSiteContext(): SiteOutletContext {
  return useOutletContext<SiteOutletContext>();
}

export default function Layout() {
  const context: SiteOutletContext = { languageCode: "ru" };

  return (
    <div className="site">
      <Header />
      <main className="site-main">
        <Outlet context={context} />
      </main>
      <Footer />
    </div>
  );
}
