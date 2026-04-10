document.addEventListener('DOMContentLoaded', () => {

    // 1. TYPEWRITER EFEKAT ZA HEADER
    const nameElement = document.getElementById('typewriter-name');
    const titleElement = document.getElementById('typewriter-title');
    const nameText = "Samer Kolasević";
    const titleText = "Softverski inženjer - student";
    
    let nameIndex = 0;
    let titleIndex = 0;

    function typeWriterName() {
        if (nameIndex < nameText.length) {
            nameElement.textContent += nameText.charAt(nameIndex);
            nameIndex++;
            setTimeout(typeWriterName, 80);
        } else {
            setTimeout(typeWriterTitle, 300);
        }
    }

    function typeWriterTitle() {
        if (titleIndex < titleText.length) {
            titleElement.textContent += titleText.charAt(titleIndex);
            titleIndex++;
            setTimeout(typeWriterTitle, 50);
        }
    }

    if (nameElement && titleElement) typeWriterName();

    // 2. FADE-IN NA SCROLL
    const observerOptions = { threshold: 0.1, rootMargin: '-80px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.appear').forEach(el => observer.observe(el));

    // 3. SLIDER ZA PROJEKTE (GLAVNI)
    const track = document.getElementById('sliderTrack');
    const slides = track ? Array.from(track.children) : [];
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    let currentIndex = 0;

    function updateSlider() {
        if (!track) return;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        const isMobile = window.innerWidth <= 768;
        if (prevBtn) prevBtn.style.display = (isMobile || currentIndex === 0) ? 'none' : 'flex';
        if (nextBtn) nextBtn.style.display = (isMobile || currentIndex === slides.length - 1) ? 'none' : 'flex';
    }

    updateSlider();
    window.addEventListener('resize', updateSlider); 

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) { currentIndex++; updateSlider(); }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) { currentIndex--; updateSlider(); }
        });
    }

    let touchStartX = 0;
    let touchEndX = 0;

    if (track) {
        track.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX, { passive: true });
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0 && currentIndex < slides.length - 1) currentIndex++; 
                else if (diff < 0 && currentIndex > 0) currentIndex--;
                updateSlider();
            }
        }, { passive: true });
    }

    // 4. NAVBAR MOBILNI MENI
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-links'); // Preimenovano u navMenu
    const navItems = document.querySelectorAll('.nav-links a'); // Preimenovano u navItems

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        navItems.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.textContent = '☰';
            });
        });
    }

    // 5. SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // 6. NAVBAR SCROLL EFEKAT & AUTOMATSKA AKTIVNA SEKCIJA
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section, div.headingContainer[id]');

    window.addEventListener('scroll', () => {
        if (navbar) {
            window.pageYOffset > 50 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            if (pageYOffset >= section.offsetTop - 150) { 
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(a => {
            a.classList.remove('active');
            if (current && a.getAttribute('href').includes(current)) {
                a.classList.add('active');
            }
        });
    });

    // 7. PROČITAJ VIŠE EFEKAT
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Tražimo paragraf sa klasom project-description koji se nalazi iznad dugmeta
            const description = this.previousElementSibling;
            if(description && description.classList.contains('project-description')) {
                description.classList.toggle('expanded');
                this.textContent = description.classList.contains('expanded') ? 'Prikaži manje ▲' : 'Pročitaj više ▼';
            }
        });
    });

    // 8. UNIVERZALNI MINI SLIDERI (Za TiltControl, Grafiku itd.)
    const miniSliders = document.querySelectorAll('.mini-slider-container');
    
    miniSliders.forEach(slider => {
        const mSlides = slider.querySelectorAll('.m-slide');
        const mPrevBtn = slider.querySelector('.m-prev');
        const mNextBtn = slider.querySelector('.m-next');
        let currentMSlide = 0;

        if (mSlides.length > 0 && mNextBtn && mPrevBtn) {
            mNextBtn.addEventListener('click', () => {
                mSlides[currentMSlide].classList.remove('active');
                currentMSlide = (currentMSlide + 1) % mSlides.length;
                mSlides[currentMSlide].classList.add('active');
            });

            mPrevBtn.addEventListener('click', () => {
                mSlides[currentMSlide].classList.remove('active');
                currentMSlide = (currentMSlide - 1 + mSlides.length) % mSlides.length;
                mSlides[currentMSlide].classList.add('active');
            });
        }
    });

    // 9. EXPAND ZA TEORETSKI STACK
    const theoryHeader = document.querySelector('.stack-header');
    const theoryToggleBtn = document.getElementById('theoryToggleBtn');
    const theoryContent = document.getElementById('theoryContent');

    if (theoryHeader && theoryToggleBtn && theoryContent) {
        theoryHeader.addEventListener('click', () => {
            theoryContent.classList.toggle('open');
            theoryToggleBtn.classList.toggle('rotated');
        });
    }
});