// Если пользователь ранее выбрал румынский — сразу показываем каркас на ro,
// а bootstrap запускаем параллельно с загрузкой JS-бандла.
try {
    var scriptEl = document.currentScript;
    var apiBase = scriptEl ? scriptEl.getAttribute('data-api-base') : '';
    var lang = localStorage.getItem('language') === 'ro' ? 'ro' : 'ru';
    if (lang === 'ro') {
        var ro = {
            title: 'Taraclia-GAZ',
            emergency: 'Serviciul de urgență',
            subtitle: 'Alimentare sigură cu gaze naturale pentru locuitorii și întreprinderile raionului Taraclia',
            emergency904: 'Serviciul de urgență: 904',
            contacts: 'Contacte'
        };
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (ro[key]) el.textContent = ro[key];
        });
    }
    if (apiBase && !location.pathname.startsWith('/admin')) {
        window.__TG_BOOTSTRAP__ = {
            lang: lang,
            promise: fetch(apiBase + '/public/bootstrap?lang=' + lang).then(function (r) {
                return r.ok ? r.json() : null;
            }).catch(function () { return null; })
        };
    }
} catch (e) { /* приватный режим — остаётся русский */ }
