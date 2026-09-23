export type Language = 'ru' | 'ro';

export const translations = {
    ru: {
        // Навигация
        'nav.home': 'Главная',
        'nav.about': 'О нас',
        'nav.consumers': 'Потребителям',
        'nav.tenders': 'Тендеры',
        'nav.news': 'Новости',
        'nav.contacts': 'Контакты',
        'nav.announcements': 'ОБЪЯВЛЕНИЯ',
        'nav.transparency': 'Прозрачность',
        'nav.antifraud': 'Линия „ANTIFRAUDĂ"',
        'nav.meterReading': 'Показание Счетчика',

        // Общие
        'common.loading': 'Загрузка...',
        'common.error': 'Ошибка',
        'common.save': 'Сохранить',
        'common.cancel': 'Отмена',
        'common.delete': 'Удалить',
        'common.edit': 'Редактировать',
        'common.create': 'Создать',
        'common.back': 'Назад',
        'close': 'Закрыть',

        // Админ-панель
        'admin.dashboard': 'Панель управления',
        'admin.pages': 'Страницы',
        'admin.news': 'Новости',
        'admin.announcements': 'Объявления',
        'admin.tenders': 'Тендеры',
        'admin.documents': 'Документы',
        'admin.gallery': 'Галерея',
        'admin.menu': 'Меню',
        'admin.contacts': 'Сообщения',
        'admin.logout': 'Выйти',
        'admin.login': 'Войти',
        'admin.username': 'Имя пользователя',
        'admin.password': 'Пароль',
        'admin.loginButton': 'Войти',

        // Формы
        'form.required': 'Обязательное поле',
        'form.name': 'Имя',
        'form.email': 'Email',
        'form.phone': 'Телефон',
        'form.message': 'Сообщение',
        'form.title': 'Заголовок',
        'form.slug': 'URL-адрес (slug)',
        'form.content': 'Содержимое',
        'form.publish': 'Опубликовать',
        'form.draft': 'Черновик',
        'form.publishedAt': 'Дата публикации',

        // Контакты
        'contacts.title': 'Контакты',
        'contacts.address': 'Адрес',
        'contacts.phones': 'Телефоны',
        'contacts.emergency': 'Аварийная служба (24/7)',
        'contacts.office': 'Офис',
        'contacts.qa': 'Вопросы потребителей',
        'contacts.email': 'Email',
        'contacts.workingHours': 'Режим работы',
        'contacts.send': 'Отправить сообщение',
        'contacts.sending': 'Отправка...',
        'contacts.success': 'Сообщение отправлено!',
        'contacts.error': 'Ошибка отправки',

        // Переключатель языка
        'lang.switch': 'RO',
    },

    ro: {
        // Navigare
        'nav.home': 'Acasă',
        'nav.about': 'Despre noi',
        'nav.consumers': 'Consumatori',
        'nav.tenders': 'Tenderuri',
        'nav.news': 'Știri',
        'nav.contacts': 'Contacte',
        'nav.announcements': 'ANUNȚURI',
        'nav.transparency': 'Transparență',
        'nav.antifraud': 'Linia „ANTIFRAUDĂ"',
        'nav.meterReading': 'Citirea Contorului',

        // Comune
        'common.loading': 'Încărcare...',
        'common.error': 'Eroare',
        'common.save': 'Salvare',
        'common.cancel': 'Anulare',
        'common.delete': 'Ștergere',
        'common.edit': 'Editare',
        'common.create': 'Creare',
        'common.back': 'Înapoi',
        'close': 'Închide',

        // Panou admin
        'admin.dashboard': 'Panou de control',
        'admin.pages': 'Pagini',
        'admin.news': 'Știri',
        'admin.announcements': 'Anunțuri',
        'admin.tenders': 'Tenderuri',
        'admin.documents': 'Documente',
        'admin.gallery': 'Galerie',
        'admin.menu': 'Meniu',
        'admin.contacts': 'Mesaje',
        'admin.logout': 'Ieșire',
        'admin.login': 'Autentificare',
        'admin.username': 'Nume utilizator',
        'admin.password': 'Parolă',
        'admin.loginButton': 'Autentificare',

        // Formulare
        'form.required': 'Câmp obligatoriu',
        'form.name': 'Nume',
        'form.email': 'Email',
        'form.phone': 'Telefon',
        'form.message': 'Mesaj',
        'form.title': 'Titlu',
        'form.slug': 'URL (slug)',
        'form.content': 'Conținut',
        'form.publish': 'Publicare',
        'form.draft': 'Ciornă',
        'form.publishedAt': 'Data publicării',

        // Contacte
        'contacts.title': 'Contacte',
        'contacts.address': 'Adresă',
        'contacts.phones': 'Telefoane',
        'contacts.emergency': 'Serviciul de urgență (24/7)',
        'contacts.office': 'Oficiu',
        'contacts.qa': 'Întrebări consumatori',
        'contacts.email': 'Email',
        'contacts.workingHours': 'Program de lucru',
        'contacts.send': 'Trimite mesaj',
        'contacts.sending': 'Trimitere...',
        'contacts.success': 'Mesaj trimis!',
        'contacts.error': 'Eroare la trimitere',

        // Comutator limbă
        'lang.switch': 'RU',
    },
};

export const t = (key: string, lang: Language = 'ru'): string => {
    return translations[lang][key as keyof typeof translations['ru']] || key;
};