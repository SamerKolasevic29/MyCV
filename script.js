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

    if (nameElement && titleElement) {
        typeWriterName();
    }

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

    // 3. SLIDER ZA PROJEKTE 
    const track = document.getElementById('sliderTrack');
    const slides = track ? Array.from(track.children) : [];
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    let currentIndex = 0;

    function updateSlider() {
        if (!track) return;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        const isMobile = window.innerWidth <= 768;

        if (prevBtn) {
            prevBtn.style.display = (isMobile || currentIndex === 0) ? 'none' : 'flex';
        }
        if (nextBtn) {
            nextBtn.style.display = (isMobile || currentIndex === slides.length - 1) ? 'none' : 'flex';
        }
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

    // SWIPE LOGIKA
    let touchStartX = 0;
    let touchEndX = 0;

    if (track) {
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentIndex < slides.length - 1) {
                currentIndex++; 
            } else if (diff < 0 && currentIndex > 0) {
                currentIndex--;
            }
            updateSlider();
        }
    }

    // 4. NAVBAR MOBILNI MENI
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
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
                window.scrollTo({
                    top: target.offsetTop - navbarHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. NAVBAR SCROLL EFEKAT & AKTIVNA SEKCIJA
    const navbar = document.querySelector('.navbar');
    const navItems = document.querySelectorAll('.nav-links a');

    // 1. Zadržavamo samo to da navbar mijenja boju pozadine kad se skrola
    window.addEventListener('scroll', () => {
        if (navbar) {
            window.pageYOffset > 50 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled');
        }
    });

    // 2. Dodajemo logiku da link svijetli SAMO kada se klikne na njega
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Prvo ukloni 'active' klasu sa svih linkova
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Zatim dodaj 'active' klasu samo na onaj link koji si upravo kliknuo
            this.classList.add('active');
        });
    });
    // 8. KARTICE "VIŠE O MENI" - LOGIKA ZA MOBITELE
    const viseCards = document.querySelectorAll('.vise-card');
    
    viseCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if(e.target.closest('.card-popup')) return;
            
            viseCards.forEach(c => {
                if(c !== card) c.classList.remove('active');
            });
            
            card.classList.toggle('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.vise-card')) {
            viseCards.forEach(card => card.classList.remove('active'));
        }
    });

    const readMoreBtns = document.querySelectorAll('.read-more-btn');

    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const description = btn.previousElementSibling; 
            description.classList.toggle('expanded');
            
            if (description.classList.contains('expanded')) {
                btn.textContent = 'Prikaži manje ▲';
            } else {
                btn.textContent = 'Pročitaj više ▼';
            }
        });
    });
});