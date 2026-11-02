/* =========================================================
   articles-core.js — zajednički Markdown helperi
   Koriste ga index.html (canvas) i article.html (samostalna stranica)
   Zahtijeva: assets/js/marked.min.js (globalni `marked`)
   ========================================================= */
(function (global) {
    'use strict';

    const BASE = 'assets/Articles/';          // putanje slika u .md fajlu su relativne na ovaj folder

    /* --- front matter: --- title: ... --- --- */
    const parseFrontMatter = (raw) => {
        const text = raw.replace(/^\uFEFF/, '');
        const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
        const meta = {};
        if (!m) return { meta, body: text };
        m[1].split(/\r?\n/).forEach(line => {
            const i = line.indexOf(':');
            if (i < 1) return;
            meta[line.slice(0, i).trim().toLowerCase()] =
                line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
        });
        return { meta, body: text.slice(m[0].length) };
    };

    /* --- articles.json (flat lista iz build-articles.sh) → grupisano po slug-u --- */
    let cache = null;
    const loadIndex = async () => {
        if (cache) return cache;
        const res = await fetch(BASE + 'articles.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('articles.json: ' + res.status);
        const flat = await res.json();

        const map = new Map();
        flat.forEach(it => {
            if (!map.has(it.slug)) map.set(it.slug, { slug: it.slug, date: '', langs: {} });
            const e = map.get(it.slug);
            e.langs[it.lang] = it;
            if ((it.date || '') > e.date) e.date = it.date || '';
        });
        cache = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));  // najnoviji prvi
        return cache;
    };

    /* jezik: traženi → engleski → bilo koji koji postoji */
    const pick = (entry, lang) => entry.langs[lang] || entry.langs.en || Object.values(entry.langs)[0];

    const isRelative = (u) => !!u && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(u);

    /* --- učitaj .md, pretvori u HTML, popravi relativne putanje --- */
    const render = async (target, item) => {
        if (!global.marked) throw new Error('marked is not loaded');
        const res = await fetch(BASE + item.file, { cache: 'no-cache' });
        if (!res.ok) throw new Error(item.file + ': ' + res.status);
        const { meta, body } = parseFrontMatter(await res.text());

        target.innerHTML = global.marked.parse(body);

        target.querySelectorAll('img, video, source').forEach(el => {
            const src = el.getAttribute('src');
            if (isRelative(src)) el.setAttribute('src', BASE + src);
            if (el.tagName === 'IMG') el.loading = 'lazy';
        });
        target.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (isRelative(href)) a.setAttribute('href', BASE + href);
            if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
        });
        return meta;
    };

    /* tag + datum iznad članka */
    const metaEl = (item) => {
        const wrap = document.createElement('div');
        wrap.className = 'md-meta';
        if (item.tag) {
            const t = document.createElement('span');
            t.className = 'article-tag';
            t.textContent = item.tag;
            wrap.appendChild(t);
        }
        if (item.date) {
            const d = document.createElement('span');
            d.textContent = item.date;
            wrap.appendChild(d);
        }
        return wrap;
    };

    global.ArticlesCore = { BASE, parseFrontMatter, loadIndex, pick, render, metaEl };
})(window);
