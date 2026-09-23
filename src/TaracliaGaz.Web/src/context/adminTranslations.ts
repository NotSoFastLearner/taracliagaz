export const adminTranslations = {
    ru: {
        // Навигация
        'admin.nav.dashboard': 'Панель управления',
        'admin.nav.pages': 'Страницы',
        'admin.nav.news': 'Новости',
        'admin.nav.announcements': 'Объявления',
        'admin.nav.tenders': 'Тендеры',
        'admin.nav.documents': 'Документы',
        'admin.nav.gallery': 'Галерея',
        'admin.nav.menu': 'Меню',
        'admin.nav.contacts': 'Сообщения',
        'admin.nav.logout': 'Выйти',

        // Общие действия
        'admin.action.create': 'Создать',
        'admin.action.edit': 'Редактировать',
        'admin.action.delete': 'Удалить',
        'admin.action.save': 'Сохранить',
        'admin.action.cancel': 'Отмена',
        'admin.action.back': 'Назад',
        'admin.action.upload': 'Загрузить',
        'admin.action.preview': 'Предпросмотр',

        // Заголовки страниц
        'admin.page.pages': 'Управление страницами',
        'admin.page.news': 'Управление новостями',
        'admin.page.announcements': 'Управление объявлениями',
        'admin.page.tenders': 'Управление тендерами',
        'admin.page.documents': 'Управление документами',
        'admin.page.gallery': 'Управление галереей',
        'admin.page.menu': 'Управление меню',
        'admin.page.contacts': 'Сообщения от пользователей',

        // Формы
        'admin.form.title': 'Заголовок',
        'admin.form.slug': 'URL (slug)',
        'admin.form.content': 'Содержимое',
        'admin.form.summary': 'Краткое описание',
        'admin.form.publishDate': 'Дата публикации',
        'admin.form.published': 'Опубликовано',
        'admin.form.draft': 'Черновик',
        'admin.form.language': 'Язык',
        'admin.form.category': 'Категория',
        'admin.form.image': 'Изображение',
        'admin.form.file': 'Файл',

        // Таблицы
        'admin.table.title': 'Заголовок',
        'admin.table.date': 'Дата',
        'admin.table.status': 'Статус',
        'admin.table.actions': 'Действия',
        'admin.table.name': 'Название',
        'admin.table.email': 'Email',
        'admin.table.phone': 'Телефон',
        'admin.table.message': 'Сообщение',

        // Сообщения
        'admin.message.created': 'Запись успешно создана',
        'admin.message.updated': 'Запись успешно обновлена',
        'admin.message.deleted': 'Запись успешно удалена',
        'admin.message.confirmDelete': 'Вы уверены, что хотите удалить эту запись?',
        'admin.message.noData': 'Нет данных',
    },

    ro: {
        // Navigare
        'admin.nav.dashboard': 'Panou de control',
        'admin.nav.pages': 'Pagini',
        'admin.nav.news': 'Știri',
        'admin.nav.announcements': 'Anunțuri',
        'admin.nav.tenders': 'Tenderuri',
        'admin.nav.documents': 'Documente',
        'admin.nav.gallery': 'Galerie',
        'admin.nav.menu': 'Meniu',
        'admin.nav.contacts': 'Mesaje',
        'admin.nav.logout': 'Ieșire',

        // Acțiuni comune
        'admin.action.create': 'Creare',
        'admin.action.edit': 'Editare',
        'admin.action.delete': 'Ștergere',
        'admin.action.save': 'Salvare',
        'admin.action.cancel': 'Anulare',
        'admin.action.back': 'Înapoi',
        'admin.action.upload': 'Încărcare',
        'admin.action.preview': 'Previzualizare',

        // Titluri pagini
        'admin.page.pages': 'Gestionare pagini',
        'admin.page.news': 'Gestionare știri',
        'admin.page.announcements': 'Gestionare anunțuri',
        'admin.page.tenders': 'Gestionare tenderuri',
        'admin.page.documents': 'Gestionare documente',
        'admin.page.gallery': 'Gestionare galerie',
        'admin.page.menu': 'Gestionare meniu',
        'admin.page.contacts': 'Mesaje de la utilizatori',

        // Formulare
        'admin.form.title': 'Titlu',
        'admin.form.slug': 'URL (slug)',
        'admin.form.content': 'Conținut',
        'admin.form.summary': 'Descriere scurtă',
        'admin.form.publishDate': 'Data publicării',
        'admin.form.published': 'Publicat',
        'admin.form.draft': 'Ciornă',
        'admin.form.language': 'Limbă',
        'admin.form.category': 'Categorie',
        'admin.form.image': 'Imagine',
        'admin.form.file': 'Fișier',

        // Tabele
        'admin.table.title': 'Titlu',
        'admin.table.date': 'Data',
        'admin.table.status': 'Status',
        'admin.table.actions': 'Acțiuni',
        'admin.table.name': 'Nume',
        'admin.table.email': 'Email',
        'admin.table.phone': 'Telefon',
        'admin.table.message': 'Mesaj',

        // Mesaje
        'admin.message.created': 'Înregistrare creată cu succes',
        'admin.message.updated': 'Înregistrare actualizată cu succes',
        'admin.message.deleted': 'Înregistrare ștearsă cu succes',
        'admin.message.confirmDelete': 'Sunteți sigur că doriți să ștergeți această înregistrare?',
        'admin.message.noData': 'Nu există date',
    },
};

export const adminT = (key: string, lang: 'ru' | 'ro' = 'ru'): string => {
    return adminTranslations[lang][key as keyof typeof adminTranslations['ru']] || key;
};