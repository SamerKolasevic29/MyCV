/* =========================================================
   Samer Kolasević – portfolio script (v2)
   - Statički hero (bez typewritera)
   - Slider za projekte (desktop strelice, mobile swipe)
   - Mini slideri sa dot indikatorima (TiltControl, grafika)
   - Article PDF viewer (split-pane) + mobile fallback
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------
       1. FADE-IN NA SCROLL
    ---------------------------------------- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '-60px 0px -40px 0px' });

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
            navToggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
        });

        navItems.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.textContent = '☰';
            });
        });
    }


    /* ----------------------------------------
       3. SMOOTH SCROLL + aktivna sekcija
    ---------------------------------------- */
    const navbar   = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section[id], header[id], .headingContainer[id]');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navH = navbar?.offsetHeight || 0;
            const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);

        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 140) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(a => {
            a.classList.remove('active');
            const href = a.getAttribute('href') || '';
            if (current && href.includes(current)) a.classList.add('active');
        });
    });


    /* ----------------------------------------
       4. PROJEKTI — GLAVNI SLIDER
       Desktop: strelice. Mobile: swipe.
    ---------------------------------------- */
    const track = document.getElementById('sliderTrack');
    if (track) {
        const slides    = Array.from(track.children);
        const nextBtn   = document.getElementById('nextBtn');
        const prevBtn   = document.getElementById('prevBtn');
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

        // Keyboard (← / →) kad je sekcija u fokusu
        document.addEventListener('keydown', (e) => {
            const rect = track.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;
            if (e.key === 'ArrowRight' && currentIndex < slides.length - 1) {
                currentIndex++; updateSlider();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--; updateSlider();
            }
        });
    }


    /* ----------------------------------------
       5. MINI SLIDERI (vertikalne slike u kartici)
       + dot indikatori
    ---------------------------------------- */
    document.querySelectorAll('.mini-slider-container').forEach(slider => {
        const mSlides = slider.querySelectorAll('.m-slide');
        const mPrev   = slider.querySelector('.m-prev');
        const mNext   = slider.querySelector('.m-next');
        const mDots   = slider.querySelector('.m-dots');
        let current = 0;

        if (!mSlides.length || !mPrev || !mNext) return;

        // Generisi dots
        if (mDots) {
            mSlides.forEach((_, i) => {
                const d = document.createElement('span');
                d.className = 'dot' + (i === 0 ? ' active' : '');
                mDots.appendChild(d);
            });
        }
        const dots = mDots ? mDots.querySelectorAll('.dot') : [];

        const show = (idx) => {
            mSlides[current].classList.remove('active');
            current = (idx + mSlides.length) % mSlides.length;
            mSlides[current].classList.add('active');
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        };

        mNext.addEventListener('click', () => show(current + 1));
        mPrev.addEventListener('click', () => show(current - 1));

        // Touch swipe na mini slideru
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


    /* ----------------------------------------
       6. ČLANCI — PDF preglednik (split-pane)
    ---------------------------------------- */
    const articleLinks = document.querySelectorAll('.article-link');
    const pdfViewer    = document.getElementById('pdfViewer');
    const viewerPath   = document.getElementById('viewerPath');
    const openExt      = document.getElementById('viewerOpenExt');

    const isMobileViewer = () => window.innerWidth <= 960;

    articleLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const pdfUrl = this.getAttribute('data-pdf');
            if (!pdfUrl) return;
            e.preventDefault();

            if (isMobileViewer()) {
                window.open(pdfUrl, '_blank', 'noopener');
                return;
            }

            if (pdfViewer)  pdfViewer.src = pdfUrl;
            if (viewerPath) viewerPath.textContent = pdfUrl;
            if (openExt)    openExt.setAttribute('href', pdfUrl);

            articleLinks.forEach(l => l.classList.remove('active-article'));
            this.classList.add('active-article');
        });
    });


    /* ----------------------------------------
       6.5 COLLAPSIBLE STACK PANELI
       - .always-collapse (Teoretski)
            -> collapsible svuda, pocetno SKLOPLJEN
       - .mobile-only-collapse (Primarni / Sekundarni)
            -> collapsible samo na mobilnom (<=768px),
               pocetno otvoren, korisnik moze sklopiti
            -> na desktopu uvijek otvoren (CSS sakriva dugme)
    ---------------------------------------- */
    const collapsibles = document.querySelectorAll('.StackContainer.collapsible');
    const MOBILE_MAX = 768;

    const setExpanded = (panel, expanded) => {
    const body = panel.querySelector('.stack-body');
    const btn  = panel.querySelector('.expand-btn');
    if (!body || !btn) return;
    if (expanded) {
        panel.classList.remove('is-collapsed');
        btn.classList.add('open');           // ← bilo: remove('open')
        body.style.maxHeight = body.scrollHeight + 'px';
    } else {
        panel.classList.add('is-collapsed');
        btn.classList.remove('open');        // ← bilo: add('open')
        body.style.maxHeight = '0px';
    }
};

    const applyCollapseState = () => {
        const isMobile = window.innerWidth <= MOBILE_MAX;
        collapsibles.forEach(panel => {
            const alwaysCollapse = panel.classList.contains('always-collapse');
            const mobileOnly     = panel.classList.contains('mobile-only-collapse');

            if (alwaysCollapse) {
                // Teoretski — pocetno SKLOPLJEN (osim ako korisnik toggla)
                if (!panel.dataset.userToggled) setExpanded(panel, false);
            } else if (mobileOnly) {
                if (isMobile) {
                    // Mobile: pocetno OTVOREN, tipka radi
                    if (!panel.dataset.userToggled) setExpanded(panel, true);
                } else {
                    // Desktop: uvijek otvoren — resetuj sve
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
            // Na mobile-only panelu klik radi samo ako je dugme vidljivo (mobile)
            const isMobile = window.innerWidth <= MOBILE_MAX;
            const mobileOnly = panel.classList.contains('mobile-only-collapse');
            if (mobileOnly && !isMobile) return;

            e.preventDefault();
            const isCollapsed = panel.classList.contains('is-collapsed');
            setExpanded(panel, isCollapsed);   // toggle
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
            // Refresh max-height za otvorene panele (zbog reflowa)
            collapsibles.forEach(p => {
                if (!p.classList.contains('is-collapsed')) {
                    const b = p.querySelector('.stack-body');
                    if (b && b.style.maxHeight) b.style.maxHeight = b.scrollHeight + 'px';
                }
            });
        }, 150);
    });


    /* ----------------------------------------
       7. PROČITAJ VIŠE (mobile collapse)
    ---------------------------------------- */
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const description = this.previousElementSibling;
            if (description && description.classList.contains('project-description')) {
                description.classList.toggle('expanded');
                this.textContent = description.classList.contains('expanded')
                    ? 'Prikaži manje ▲'
                    : 'Pročitaj više ▼';
            }
        });
    });

});
