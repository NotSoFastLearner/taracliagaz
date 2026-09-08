import { Helmet } from "react-helmet-async";

interface SEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
    type?: "website" | "article";
    publishedTime?: string;
    noindex?: boolean;
}

const SITE_NAME = "Тараклия-ГАЗ";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://taraclia-gaz.md";
const DEFAULT_IMAGE = "/og-image.svg";
const DEFAULT_DESCRIPTION =
    "SRL «Taraclia Gaz» — поставка природного газа в Тараклийском районе Молдовы. " +
    "Тарифы, услуги, новости, тендеры, контакты. Аварийная служба: 904";

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    image = DEFAULT_IMAGE,
    type = "website",
    publishedTime,
    noindex = false,
}: SEOProps) {
    const fullTitle = title === "Главная" ? `${SITE_NAME} — ${description.slice(0, 60)}` : `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;
    const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    return (
        <Helmet>
            {/* Основные мета-теги */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {!noindex && <meta name="robots" content="index, follow" />}

            {/* Open Graph (Facebook, LinkedIn, Telegram, WhatsApp, VK) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="ru_MD" />
            <meta property="og:locale:alternate" content="ro_MD" />
            {publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Дополнительно */}
            <meta name="language" content="Russian" />
            <meta name="author" content={SITE_NAME} />
        </Helmet>
    );
}