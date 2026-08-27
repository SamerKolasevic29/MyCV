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
            if (!targetId || targetId === '#') return;
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
                        current = section.getAttribute('id');
                    }
                });

                navItems.forEach(a => {
                    a.classList.remove('active');
                    const href = a.getAttribute('href') || '';
                    if (current && href.includes(current)) a.classList.add('active');
                });
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });


    /* ----------------------------------------
       4. PROJEKTI — GLAVNI SLIDER
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

        // Keyboard strelice
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
       5. MINI SLIDERI (Za TiltControl, SeharaCloud, Grafiku)
    ---------------------------------------- */
    document.querySelectorAll('.mini-slider-container').forEach(slider => {
        const mSlides = slider.querySelectorAll('.m-slide');
        const mPrev   = slider.querySelector('.m-prev');
        const mNext   = slider.querySelector('.m-next');
        const mDots   = slider.querySelector('.m-dots');
        let current = 0;

        if (!mSlides.length || !mPrev || !mNext) return;

        if (mDots && mDots.children.length === 0) {
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
                    if (!panel.dataset.userToggled) setExpanded(panel, true);
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