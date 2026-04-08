document.addEventListener('DOMContentLoaded', () => {

    // 1. TYPEWRITER EFEKAT ZA HEADER

    const nameElement = document.getElementById('typewriter-name');
    const titleElement = document.getElementById('typewriter-title');
    
    const nameText = "Samer Kolasević";
    const titleText = "Softverski inženjer - student";
    
    let nameIndex = 0;
    let titleIndex = 0;
    let nameComplete = false;

    function typeWriterName() {
        if (nameIndex < nameText.length) {
            nameElement.textContent += nameText.charAt(nameIndex);
            nameIndex++;
            setTimeout(typeWriterName, 80);
        } else {
            nameComplete = true;
            setTimeout(typeWriterTitle, 300); // Pauza prije naslova
        }
    }

    function typeWriterTitle() {
        if (titleIndex < titleText.length) {
            titleElement.textContent += titleText.charAt(titleIndex);
            titleIndex++;
            setTimeout(typeWriterTitle, 50);
        }
    }

    // Pokreni typewriter
    if (nameElement && titleElement) {
        typeWriterName();
    }

    // 2. FADE-IN NA SCROLL (Intersection Observer)

    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Prestani pratiti nakon što se pojavi
            }
        });
    }, observerOptions);


    document.querySelectorAll('.appear').forEach(el => {
        observer.observe(el);
    });


    // 3. SLIDER ZA PROJEKTE

    
    const track = document.getElementById('sliderTrack');
    const slides = track ? Array.from(track.children) : [];
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    let currentIndex = 0;

    function updateSlider() {
        if (!track) return;
        

        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        if (prevBtn) {
            prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
        }
        

        if (nextBtn) {
            nextBtn.style.display = currentIndex === slides.length - 1 ? 'none' : 'flex';
        }
    }


    updateSlider();


    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateSlider();
            }
        });
    }


    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });
    }


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

        if (diff > swipeThreshold && currentIndex < slides.length - 1) {
            // Swipe lijevo - idi naprijed
            currentIndex++;
            updateSlider();
        } else if (diff < -swipeThreshold && currentIndex > 0) {
            // Swipe desno - idi nazad
            currentIndex--;
            updateSlider();
        }
    }

    // 4. NAVBAR FUNKCIONALNOST

    
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    // Toggle mobilni meni
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Zatvori meni kad klikneš na link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.textContent = '☰';
            });
        });
    }

    // 5. SMOOTH SCROLL ZA ANCHOR LINKOVE

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // 6. NAVBAR PROMJENA NA SCROLL

    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (navbar) {
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        lastScroll = currentScroll;
    });

    // 7. AKTIVNA SEKCIJA U NAVBARU

    const sections = document.querySelectorAll('section[id], footer[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    function setActiveNav() {
        let current = '';
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionHeight = section.offsetHeight;

            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveNav);
    setActiveNav(); 
});