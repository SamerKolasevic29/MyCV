/* =========================================================
   Samer Kolasević – portfolio script (v3 Refactored)
   - Fast performance (throttled scroll handlers)
   - Multi-language switcher (ENG / BOS) with persistence
   - Project sliders & mini-sliders
   - Homelab & Stack responsive behavior
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------
       0. JEZIK / LANGUAGE SWITCHER
    ---------------------------------------- */
    let currentLang = localStorage.getItem('samer_lang') || 'en';

    const applyLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('samer_lang', lang);
        document.documentElement.lang = lang;

        const langText = document.getElementById('langText');
        if (langText) {
            langText.textContent = lang === 'en' ? 'BS' : 'EN';
        }

        const elements = document.querySelectorAll('[data-en][data-bs]');
        elements.forEach(el => {
            const translation = el.getAttribute(`data-${lang}`);
            if (translation !== null) {
                el.innerHTML = translation;
            }
        });

        document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    };

    applyLanguage(currentLang);

    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const nextLang = currentLang === 'en' ? 'bs' : 'en';
            applyLanguage(nextLang);
        });
    }


    /* ----------------------------------------
       1. FADE-IN NA SCROLL (IntersectionObserver)
    ---------------------------------------- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '-40px 0px -20px 0px' });

    document.querySelectorAll('.appear').forEach(el => observer.observe(el));


    /* ----------------------------------------
       2. NAVBAR — mobilni meni
    ---------------------------------------- */
    const navToggle = document.getElementById('navToggle');
    const navMenu   = document.querySelector('.nav-links');
    const navItems  = document.querySelectorAll('.nav-links a');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const open = navMenu.classList.contains('active');
            navToggle.textContent = open ? '✕' : '☰';
            navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });

        navItems.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.textContent = '☰';
            });
        });
    }


    /* ----------------------------------------
       3. OPTIMIZIRANI SCROLL & SMOOTH SCROLL
    ---------------------------------------- */
    const navbar   = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section[id], header[id], .headingContainer[id]');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') { e.preventDefault(); return; } // placeholder linkovi ne skaču na vrh
            if (!targetId) return;
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navH = navbar?.offsetHeight || 64;
            const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // Throttled scroll sa requestAnimationFrame za visoke performanse
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);

                let current = '';
                sections.forEach(section => {
                    if (window.scrollY >= section.offsetTop - 160) {
                        current = section.dataset.nav || section.getAttribute('id');
                    }
                });

                navItems.forEach(a => {
                    a.classList.remove('active');
                    if (current && a.getAttribute('href') === '#' + current) a.classList.add('active');
                });
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });


    /* ----------------------------------------
       4. PROJEKTI — GLAVNI SLIDERI (Featured + Other)
       Svaka [data-slider-group] ima svoj track i svoju dugmad.
    ---------------------------------------- */
    document.querySelectorAll('[data-slider-group]').forEach(group => {
        const track = group.querySelector('.slider-track');
        if (!track) return;

        const slides  = Array.from(track.children);
        const nextBtn = group.querySelector('.next-btn');
        const prevBtn = group.querySelector('.prev-btn');
        let currentIndex = 0;

        const updateSlider = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex === slides.length - 1;
        };

        updateSlider();

        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) { currentIndex++; updateSlider(); }
        });
        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) { currentIndex--; updateSlider(); }
        });

        // Touch swipe
        let touchStartX = 0;
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex < slides.length - 1) currentIndex++;
                else if (diff < 0 && currentIndex > 0) currentIndex--;
                updateSlider();
            }
        }, { passive: true });

        // Keyboard strelice — reaguje samo slider koji je na sredini ekrana
        document.addEventListener('keydown', (e) => {
            const rect = track.getBoundingClientRect();
            const mid  = window.innerHeight / 2;
            if (!(rect.top < mid && rect.bottom > mid)) return;
            if (e.key === 'ArrowRight' && currentIndex < slides.length - 1) {
                currentIndex++; updateSlider();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--; updateSlider();
            }
        });
    });


    /* ----------------------------------------
       4b. MOBILE — projekti kao redovi + overlay kartica
       Na telefonu (<=768px) CSS sakriva slider i prikazuje redove
       (ime + badgevi). Klik na red otvara istu karticu kao overlay.
    ---------------------------------------- */
    const isPhone = () => window.innerWidth <= 768;

    const backdrop = document.createElement('div');
    backdrop.className = 'sheet-backdrop';
    document.body.appendChild(backdrop);

    let openCard = null;

    const closeSheet = () => {
        if (!openCard) return;
        openCard.classList.remove('sheet-open');
        backdrop.classList.remove('show');
        document.body.classList.remove('sheet-lock');
        openCard = null;
    };

    const openSheet = (card) => {
        closeSheet();
        openCard = card;
        card.classList.add('sheet-open');
        card.scrollTop = 0;
        backdrop.classList.add('show');
        document.body.classList.add('sheet-lock');
    };

    backdrop.addEventListener('click', closeSheet);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

    document.querySelectorAll('[data-slider-group]').forEach(group => {
        const section = group.querySelector('section.projekti');
        if (!section) return;

        const rows = document.createElement('div');
        rows.className = 'project-rows';
        section.before(rows);

        group.querySelectorAll('.slider-track > .ProjectContainer').forEach(card => {
            // X dugme (vidljivo samo kad je kartica otvorena)
            const x = document.createElement('button');
            x.type = 'button';
            x.className = 'sheet-close';
            x.setAttribute('aria-label', 'Close');
            x.textContent = '✕';
            x.addEventListener('click', closeSheet);
            card.prepend(x);

            // red: naslov + badgevi
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'project-row';

            const title = document.createElement('div');
            title.className = 'project-row-title';
            const h3 = card.querySelector('h3');
            if (h3) title.innerHTML = h3.innerHTML;

            const badges = document.createElement('div');
            badges.className = 'project-row-badges';
            const src = card.querySelector('.badges');
            if (src) badges.innerHTML = src.innerHTML;

            row.append(title, badges);
            row.addEventListener('click', () => openSheet(card));
            rows.appendChild(row);
        });
    });

    // Badgevi u jednom redu; ono što ne stane se sakrije i dodaje se "…"
    const fitRowBadges = () => {
        if (!isPhone()) return;
        document.querySelectorAll('.project-row-badges').forEach(wrap => {
            wrap.querySelectorAll('.badge-more').forEach(m => m.remove());
            const items = Array.from(wrap.querySelectorAll('.tech-badge'));
            items.forEach(b => { b.style.display = ''; });
            if (!items.length) return;

            const gap   = parseFloat(getComputedStyle(wrap).columnGap) || 6;
            const avail = wrap.clientWidth;
            const total = items.reduce((s, b) => s + b.offsetWidth, 0) + gap * (items.length - 1);
            if (total <= avail) return;

            const more = document.createElement('span');
            more.className = 'badge-more';
            more.textContent = '…';
            wrap.appendChild(more);
            const moreW = more.offsetWidth + gap;

            let used = 0, keep = 0;
            for (const b of items) {
                const w = b.offsetWidth + (keep ? gap : 0);
                if (keep >= 1 && used + w + moreW > avail) break;
                used += w; keep++;
            }
            items.forEach((b, i) => { if (i >= keep) b.style.display = 'none'; });
        });
    };

    fitRowBadges();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitRowBadges);
    window.addEventListener('load', fitRowBadges);

    let rowResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(rowResizeTimer);
        rowResizeTimer = setTimeout(() => {
            if (!isPhone()) closeSheet();
            fitRowBadges();
        }, 150);
    });


    /* ----------------------------------------
       5. MINI SLIDERI (Za TiltControl, SeharaCloud, Grafiku)
       Slajd s dvije slike (.m-slide.double) se na telefonu (<=768px)
       razdvaja u dva zasebna slajda (lijevo/desno), a na desktopu
       ostaje originalni stack.
    ---------------------------------------- */
    const miniSyncers = [];

    document.querySelectorAll('.mini-slider-container').forEach(slider => {
        const mPrev = slider.querySelector('.m-prev');
        const mNext = slider.querySelector('.m-next');
        const mDots = slider.querySelector('.m-dots');
        let current = 0;

        if (!mPrev || !mNext) return;

        const visibleSlides = () =>
            Array.from(slider.querySelectorAll('.m-slide')).filter(s => !s.classList.contains('is-split-source'));

        const safePlay = (v) => { try { const p = v.play && v.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} };

        // --- razdvoji / spoji "double" slajdove (pomjera iste elemente, bez kloniranja) ---
        const splitDoubles = () => {
            slider.querySelectorAll('.m-slide.double:not(.is-split-source)').forEach(src => {
                const media = Array.from(src.children).filter(c => /^(IMG|VIDEO)$/.test(c.tagName));
                if (media.length < 2) return;
                const parts = media.map(m => {
                    const part = document.createElement('div');
                    part.className = 'm-slide split-part';
                    part.dataset.splitOf = '1';
                    part.appendChild(m);
                    return part;
                });
                src.after(...parts);
                src.classList.add('is-split-source');
                src.classList.remove('active');
                parts.forEach(p => p.querySelectorAll('video').forEach(safePlay));
            });
        };

        const mergeDoubles = () => {
            slider.querySelectorAll('.m-slide.is-split-source').forEach(src => {
                let next = src.nextElementSibling;
                while (next && next.classList.contains('split-part')) {
                    const part = next;
                    next = part.nextElementSibling;
                    Array.from(part.children).forEach(m => {
                        src.appendChild(m);
                        if (m.tagName === 'VIDEO') safePlay(m);
                    });
                    part.remove();
                }
                src.classList.remove('is-split-source');
            });
        };

        const buildDots = () => {
            if (!mDots) return;
            mDots.innerHTML = '';
            visibleSlides().forEach(() => {
                const d = document.createElement('span');
                d.className = 'dot';
                mDots.appendChild(d);
            });
        };

        const render = () => {
            const slides = visibleSlides();
            if (!slides.length) return;
            current = Math.min(Math.max(current, 0), slides.length - 1);
            slider.querySelectorAll('.m-slide').forEach(s => s.classList.remove('active'));
            slides[current].classList.add('active');
            if (mDots) Array.from(mDots.children).forEach((d, i) => d.classList.toggle('active', i === current));
        };

        const show = (idx) => {
            const n = visibleSlides().length;
            if (!n) return;
            current = (idx + n) % n;
            render();
        };

        const sync = () => {
            const wasSplit = !!slider.querySelector('.is-split-source');
            if (isPhone() && !wasSplit) { splitDoubles(); buildDots(); render(); }
            else if (!isPhone() && wasSplit) { mergeDoubles(); current = 0; buildDots(); render(); }
        };

        buildDots();
        sync();
        render();
        miniSyncers.push(sync);

        mNext.addEventListener('click', () => show(current + 1));
        mPrev.addEventListener('click', () => show(current - 1));

        let tStart = 0;
        slider.addEventListener('touchstart', (e) => {
            tStart = e.changedTouches[0].screenX;
        }, { passive: true });
        slider.addEventListener('touchend', (e) => {
            const diff = tStart - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) show(current + 1);
                else show(current - 1);
            }
        }, { passive: true });
    });

    let miniResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(miniResizeTimer);
        miniResizeTimer = setTimeout(() => miniSyncers.forEach(fn => fn()), 150);
    });


    /* ----------------------------------------
       6. ČLANCI — lista + canvas (PDF iframe ili Markdown)
       - PDF članci su statični u HTML-u (data-pdf)
       - Markdown članci se učitavaju iz assets/Articles/articles.json
         (generiše ga scripts/build-articles.sh iz front matter-a)
       Desktop: otvara se u canvasu desno. Telefon: novi tab.
    ---------------------------------------- */
    const articleList = document.querySelector('.article-list');
    const pdfViewer   = document.getElementById('pdfViewer');
    const mdViewer    = document.getElementById('mdViewer');
    const mdBody      = document.getElementById('mdBody');
    const viewerPath  = document.getElementById('viewerPath');
    const openExt     = document.getElementById('viewerOpenExt');

    const isMobileViewer = () => window.innerWidth <= 960;
    const LIST_LIMIT = 5;                     // koliko članaka vidiš prije "Show all" (telefon)

    let mdEntries = [];                       // grupisani .md članci (po slug-u)
    let currentMd = null;                     // slug trenutno otvorenog u canvasu
    let loadToken = 0;
    let listExpanded = false;

    const setActive = (link) => {
        articleList.querySelectorAll('.article-link').forEach(l => l.classList.remove('active-article'));
        if (link) link.classList.add('active-article');
    };

    const showPdf = (url) => {
        currentMd = null;
        if (mdViewer) mdViewer.hidden = true;
        if (pdfViewer) { pdfViewer.hidden = false; pdfViewer.src = url; }
        if (viewerPath) viewerPath.textContent = url;
        if (openExt)    openExt.setAttribute('href', url);
    };

    const showMd = async (entry) => {
        if (!window.ArticlesCore || !mdViewer || !mdBody) return;
        const item  = ArticlesCore.pick(entry, currentLang);
        const token = ++loadToken;
        currentMd = entry.slug;

        if (pdfViewer) pdfViewer.hidden = true;
        mdViewer.hidden = false;
        mdBody.innerHTML = '<p class="md-loading">…</p>';
        if (viewerPath) viewerPath.textContent = ArticlesCore.BASE + item.file;
        if (openExt)    openExt.setAttribute('href', 'article.html?a=' + encodeURIComponent(entry.slug));

        try {
            await ArticlesCore.render(mdBody, item);
            if (token !== loadToken) return;          // u međuvremenu kliknut drugi članak
            mdBody.prepend(ArticlesCore.metaEl(item));
            mdViewer.scrollTop = 0;
        } catch (err) {
            if (token !== loadToken) return;
            mdBody.textContent = currentLang === 'en' ? 'Could not load this article.' : 'Članak nije moguće učitati.';
        }
    };

    const updateListLimit = () => {
        if (!articleList) return;
        const links = Array.from(articleList.querySelectorAll('.article-link'));
        links.forEach((l, i) => l.classList.toggle('is-extra', i >= LIST_LIMIT));

        let btn = articleList.querySelector('.article-more');
        if (links.length <= LIST_LIMIT) { if (btn) btn.remove(); return; }
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'article-more';
            btn.addEventListener('click', () => { listExpanded = !listExpanded; updateListLimit(); });
        }
        articleList.appendChild(btn);                  // uvijek na kraju liste
        articleList.classList.toggle('is-collapsed', !listExpanded);
        btn.textContent = listExpanded
            ? (currentLang === 'en' ? 'Show less ▲' : 'Prikaži manje ▲')
            : (currentLang === 'en' ? `Show all (${links.length}) ▼` : `Prikaži sve (${links.length}) ▼`);
    };

    const buildMdLinks = () => {
        if (!articleList) return;
        articleList.querySelectorAll('[data-md]').forEach(l => l.remove());

        const frag = document.createDocumentFragment();
        mdEntries.forEach(entry => {
            const item = ArticlesCore.pick(entry, currentLang);
            const a = document.createElement('a');
            a.className = 'article-link' + (entry.slug === currentMd ? ' active-article' : '');
            a.href = 'article.html?a=' + encodeURIComponent(entry.slug);
            a.target = '_blank';                       // telefon: novi tab (desktop preuzima JS)
            a.rel = 'noopener';
            a.dataset.md = entry.slug;

            const meta = document.createElement('div');
            meta.className = 'article-meta';
            const tag = document.createElement('span');
            tag.className = 'article-tag';
            tag.textContent = item.tag || 'Article';
            meta.appendChild(tag);

            const h3 = document.createElement('h3');
            h3.className = 'article-title';
            h3.textContent = item.title;

            a.append(meta, h3);
            if (item.desc) {
                const p = document.createElement('p');
                p.className = 'article-desc';
                p.textContent = item.desc;
                a.appendChild(p);
            }
            frag.appendChild(a);
        });
        articleList.prepend(frag);
        updateListLimit();
    };

    if (articleList) {
        // klik: PDF i Markdown (event delegation, radi i za dinamički dodane)
        articleList.addEventListener('click', (e) => {
            const link = e.target.closest('.article-link');
            if (!link) return;

            const pdfUrl = link.getAttribute('data-pdf');
            const mdSlug = link.dataset.md;

            if (pdfUrl) {
                e.preventDefault();
                if (isMobileViewer()) { window.open(pdfUrl, '_blank', 'noopener'); return; }
                showPdf(pdfUrl);
                setActive(link);
            } else if (mdSlug) {
                if (isMobileViewer()) return;          // browser otvara href u novom tabu
                e.preventDefault();
                const entry = mdEntries.find(x => x.slug === mdSlug);
                if (entry) { showMd(entry); setActive(link); }
            }
        });

        // učitaj .md članke (ako articles.json postoji)
        if (window.ArticlesCore) {
            ArticlesCore.loadIndex()
                .then(entries => { mdEntries = entries; buildMdLinks(); })
                .catch(() => { updateListLimit(); });   // nema JSON-a: ostaju samo PDF-ovi
        } else {
            updateListLimit();
        }

        // promjena jezika: osvježi naslove u listi i otvoreni članak
        document.addEventListener('langchange', () => {
            if (mdEntries.length) buildMdLinks(); else updateListLimit();
            if (currentMd) {
                const entry = mdEntries.find(x => x.slug === currentMd);
                if (entry) showMd(entry);
            }
        });
    }


    /* ----------------------------------------
       7. COLLAPSIBLE STACK PANELI
    ---------------------------------------- */
    const collapsibles = document.querySelectorAll('.StackContainer.collapsible');
    const MOBILE_MAX = 768;

    const setExpanded = (panel, expanded) => {
        const body = panel.querySelector('.stack-body');
        const btn  = panel.querySelector('.expand-btn');
        if (!body || !btn) return;
        if (expanded) {
            panel.classList.remove('is-collapsed');
            btn.classList.add('open');
            body.style.maxHeight = body.scrollHeight + 'px';
        } else {
            panel.classList.add('is-collapsed');
            btn.classList.remove('open');
            body.style.maxHeight = '0px';
        }
    };

    const applyCollapseState = () => {
        const isMobile = window.innerWidth <= MOBILE_MAX;
        collapsibles.forEach(panel => {
            const alwaysCollapse = panel.classList.contains('always-collapse');
            const mobileOnly     = panel.classList.contains('mobile-only-collapse');

            if (alwaysCollapse) {
                if (!panel.dataset.userToggled) setExpanded(panel, false);
            } else if (mobileOnly) {
                if (isMobile) {
                    if (!panel.dataset.userToggled) setExpanded(panel, false);   // default: zatvoreno na telefonu
                } else {
                    panel.classList.remove('is-collapsed');
                    const body = panel.querySelector('.stack-body');
                    if (body) body.style.maxHeight = '';
                }
            }
        });
    };

    collapsibles.forEach(panel => {
        const header = panel.querySelector('.stack-header');
        const btn    = panel.querySelector('.expand-btn');
        if (!header) return;

        const toggle = (e) => {
            const isMobile = window.innerWidth <= MOBILE_MAX;
            const mobileOnly = panel.classList.contains('mobile-only-collapse');
            if (mobileOnly && !isMobile) return;

            e.preventDefault();
            const isCollapsed = panel.classList.contains('is-collapsed');
            setExpanded(panel, isCollapsed);
            panel.dataset.userToggled = '1';
        };

        header.addEventListener('click', toggle);
        if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(e); });
    });

    applyCollapseState();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            applyCollapseState();
            collapsibles.forEach(p => {
                if (!p.classList.contains('is-collapsed')) {
                    const b = p.querySelector('.stack-body');
                    if (b && b.style.maxHeight) b.style.maxHeight = b.scrollHeight + 'px';
                }
            });
        }, 150);
    });


    /* ----------------------------------------
       8. PROČITAJ VIŠE (mobile description)
    ---------------------------------------- */
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const description = this.previousElementSibling;
            if (description && description.classList.contains('project-description')) {
                description.classList.toggle('expanded');
                const isExpanded = description.classList.contains('expanded');
                this.textContent = isExpanded
                    ? (currentLang === 'en' ? 'Show less ▲' : 'Prikaži manje ▲')
                    : (currentLang === 'en' ? 'Read more ▼' : 'Pročitaj više ▼');
            }
        });
    });

});