import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        const newLang = language === 'ru' ? 'ro' : 'ru';
        setLanguage(newLang);
    };

    return (
        <button
            type="button"
            className="language-switcher"
            onClick={toggleLanguage}
            aria-label={language === 'ru' ? 'Schimbă limba' : 'Сменить язык'}
            title={language === 'ru' ? 'Schimbă limba' : 'Сменить язык'}
        >
            {language === 'ru' ? 'RO' : 'RU'}
        </button>
    );
};
