import { Helmet } from "react-helmet-async";
import {
    COMPANY_NAME,
    COMPANY_ADDRESS,
    COMPANY_COORDINATES,
    COMPANY_PHONES,
    COMPANY_EMAIL,
    SITE_URL,
} from "../utils/site";

export default function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#organization`,
        name: COMPANY_NAME,
        image: `${SITE_URL}/og-image.jpg`,
        description: "Поставка природного газа в Тараклийском районе Молдовы",
        address: {
            "@type": "PostalAddress",
            streetAddress: COMPANY_ADDRESS.street,
            addressLocality: COMPANY_ADDRESS.city.replace("г. ", ""),
            postalCode: COMPANY_ADDRESS.postalCode,
            addressCountry: "MD",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: COMPANY_COORDINATES.latitude,
            longitude: COMPANY_COORDINATES.longitude,
        },
        url: SITE_URL,
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
                description: "Вопросы потребителей",
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