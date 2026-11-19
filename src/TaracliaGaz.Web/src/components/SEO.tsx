import { Helmet } from "react-helmet-async";
import { SITE_URL } from "../utils/site";
import { useLanguage } from "../context/LanguageContext";

interface SEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
    noindex?: boolean;
    singleLang?: boolean;
}

export default function SEO({
    title,
    description,
    path = "",
    image = "/og-image.png",
    noindex = false,
    singleLang = false,
}: SEOProps) {
    const { language, t } = useLanguage();
    const siteName = t('home.heroTitle');
    const fullTitle = path === "/"
        ? t('seo.homeTitle')
        : `${title} — ${siteName}`;

    const ruUrl = `${SITE_URL}${path}`;
    const roUrl = `${SITE_URL}${path}${path.includes('?') ? '&' : '?'}lang=ro`;
    const url = language === 'ro' ? roUrl : ruUrl;
    const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex,nofollow" />}

            <link rel="canonical" href={url} />
            {!singleLang && <link rel="alternate" hrefLang="ru" href={ruUrl} />}
            {!singleLang && <link rel="alternate" hrefLang="ro" href={roUrl} />}
            {!singleLang && <link rel="alternate" hrefLang="x-default" href={ruUrl} />}

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content={language === 'ro' ? 'ro_RO' : 'ru_RU'} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
        </Helmet>
    );
}