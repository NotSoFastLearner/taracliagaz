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
        const saved = localStorage.getItem('language');
        return (saved === 'ro' || saved === 'ru') ? saved : 'ru';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
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

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

/** Локаль для форматирования дат по текущему языку */
export const dateLocale = (lang: Language): string => (lang === 'ro' ? 'ro-RO' : 'ru-RU');
