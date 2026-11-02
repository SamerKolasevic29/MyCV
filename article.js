/* =========================================================
   article.js — samostalna stranica članka (article.html?a=slug)
   Na telefonu se članci otvaraju ovdje, u novom tabu.
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
    let lang = localStorage.getItem('samer_lang') || 'en';

    const body    = document.getElementById('mdBody');
    const langBtn = document.getElementById('langToggle');
    const langTxt = document.getElementById('langText');
    const slug    = new URLSearchParams(location.search).get('a');

    const T = {
        en: { loading: 'Loading…', notFound: 'Article not found.', error: 'Could not load this article.' },
        bs: { loading: 'Učitavanje…', notFound: 'Članak nije pronađen.', error: 'Članak nije moguće učitati.' }
    };

    const applyUiLang = () => {
        document.documentElement.lang = lang;
        if (langTxt) langTxt.textContent = lang === 'en' ? 'BS' : 'EN';
        document.querySelectorAll('[data-en][data-bs]').forEach(el => {
            el.innerHTML = el.getAttribute('data-' + lang);
        });
    };

    let entry = null;

    const show = async () => {
        applyUiLang();
        if (!entry) { body.textContent = T[lang].notFound; return; }

        const item = ArticlesCore.pick(entry, lang);
        body.innerHTML = '<p class="md-loading">' + T[lang].loading + '</p>';
        try {
            await ArticlesCore.render(body, item);
            body.prepend(ArticlesCore.metaEl(item));
            document.title = item.title + ' | Samer Kolasević';
        } catch (err) {
            body.textContent = T[lang].error;
        }
    };

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            lang = lang === 'en' ? 'bs' : 'en';
            localStorage.setItem('samer_lang', lang);
            show();
        });
    }

    try {
        const entries = await ArticlesCore.loadIndex();
        entry = entries.find(e => e.slug === slug) || null;
    } catch (err) {
        entry = null;
    }
    show();
});
