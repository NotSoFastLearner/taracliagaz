import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language } from '../i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    /** Перевод ключа на текущий язык */
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang === 'ro' || urlLang === 'ru') {
            localStorage.setItem('language', urlLang);
            return urlLang;
        }
        const saved = localStorage.getItem('language');
        return (saved === 'ro' || saved === 'ru') ? saved : 'ru';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        const url = new URL(window.location.href);
        if (lang === 'ro') {
            url.searchParams.set('lang', 'ro');
        } else {
            url.searchParams.delete('lang');
        }
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    };

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string): string => {
        // Если ключа нет на текущем языке — fallback на русский,
        // и только потом показываем сам ключ (для отладки)
        return translations[language][key as keyof typeof translations['ru']]
            ?? translations.ru[key as keyof typeof translations['ru']]
            ?? key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

/** Локаль для форматирования дат по текущему языку */
// eslint-disable-next-line react-refresh/only-export-components
export const dateLocale = (lang: Language): string => (lang === 'ro' ? 'ro-RO' : 'ru-RU');
