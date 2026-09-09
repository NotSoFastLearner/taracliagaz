import { Helmet } from "react-helmet-async";
import { SITE_URL } from "../utils/site";

interface SEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
    noindex?: boolean;
}

export default function SEO({
    title,
    description,
    path = "",
    image = "/og-image.png",  // ✅ Было "/og-image.jpg"
    noindex = false,
}: SEOProps) {
    const fullTitle = title === "Главная"
        ? "Тараклия-ГАЗ — поставка природного газа"
        : `${title} — Тараклия-ГАЗ`;

    const url = `${SITE_URL}${path}`;
    const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex,nofollow" />}

            {/* Canonical */}
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Тараклия-ГАЗ" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="ru_RU" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
        </Helmet>
    );
}