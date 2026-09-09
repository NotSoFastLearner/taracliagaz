import { Helmet } from "react-helmet-async";

export default function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://taraclia-gaz.md/#organization",
        "name": "SRL «Taraclia Gaz»",
        "image": "https://taraclia-gaz.md/og-image.jpg",
        "description": "Поставка природного газа в Тараклийском районе Молдовы",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "ул. Мира, 45",
            "addressLocality": "Тараклия",
            "postalCode": "MD-7400",
            "addressCountry": "MD"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 45.9006,  // ← Замени на реальные координаты
            "longitude": 28.6431
        },
        "url": "https://taraclia-gaz.md",
        "telephone": "+37329422404",
        "email": "office@taraclia-gaz.md",
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "17:00"
            }
        ],
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "+37329422404",
                "contactType": "customer service"
            },
            {
                "@type": "ContactPoint",
                "telephone": "+37329422405",
                "contactType": "customer service",
                "description": "Вопросы потребителей"
            },
            {
                "@type": "ContactPoint",
                "telephone": "904",
                "contactType": "emergency service",
                "availableLanguage": ["Russian", "Romanian"],
                "hoursAvailable": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "00:00",
                    "closes": "23:59"
                }
            }
        ]
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}