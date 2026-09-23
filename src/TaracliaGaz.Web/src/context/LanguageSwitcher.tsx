import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        const newLang = language === 'ru' ? 'ro' : 'ru';
        setLanguage(newLang);
    };

    return (
        <button
            className="language-switcher"
            onClick={toggleLanguage}
            aria-label={language === 'ru' ? 'Schimbă limba' : 'Сменить язык'}
            title={language === 'ru' ? 'Schimbă limba' : 'Сменить язык'}
            style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '2px solid #0057b8',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0057b8',
                transition: 'all 0.2s',
            }}
        >
            {language === 'ru' ? 'RO' : 'RU'}
        </button>
    );
};