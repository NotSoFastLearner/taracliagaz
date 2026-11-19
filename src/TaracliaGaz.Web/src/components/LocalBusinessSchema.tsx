import { Helmet } from "react-helmet-async";
import {
    COMPANY_NAME,
    COMPANY_ADDRESS,
    COMPANY_COORDINATES,
    COMPANY_PHONES,
    COMPANY_EMAIL,
    SITE_URL,
} from "../utils/site";
import { useLanguage } from "../context/LanguageContext";

export default function LocalBusinessSchema() {
    const { language, t } = useLanguage();
    const isRo = language === "ro";

    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#organization`,
        name: COMPANY_NAME,
        image: `${SITE_URL}/og-image.png`,
        description: isRo
            ? "Furnizarea gazelor naturale în raionul Taraclia, Moldova"
            : "Поставка природного газа в Тараклийском районе Молдовы",
        address: {
            "@type": "PostalAddress",
            streetAddress: isRo ? "str. Lenin, 110A" : COMPANY_ADDRESS.street,
            addressLocality: isRo ? "Taraclia" : COMPANY_ADDRESS.city.replace("г. ", ""),
            postalCode: COMPANY_ADDRESS.postalCode,
            addressCountry: "MD",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: COMPANY_COORDINATES.latitude,
            longitude: COMPANY_COORDINATES.longitude,
        },
        url: isRo ? `${SITE_URL}/?lang=ro` : SITE_URL,
        telephone: COMPANY_PHONES.office,
        email: COMPANY_EMAIL,
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                ],
                opens: "08:00",
                closes: "17:00",
            },
        ],
        contactPoint: [
            {
                "@type": "ContactPoint",
                telephone: COMPANY_PHONES.office,
                contactType: "customer service",
            },
            {
                "@type": "ContactPoint",
                telephone: COMPANY_PHONES.qa,
                contactType: "customer service",
                description: t('contacts.qa'),
            },
            {
                "@type": "ContactPoint",
                telephone: COMPANY_PHONES.emergency,
                contactType: "emergency service",
                availableLanguage: ["Russian", "Romanian"],
                hoursAvailable: {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                    opens: "00:00",
                    closes: "23:59",
                },
            },
        ],
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}