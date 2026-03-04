document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Hero Slider Logic
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    const slideInterval = 5000;
    let slideTimer;

    function goToSlide(n) {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function resetTimer() {
        if (slideTimer) clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, slideInterval);
    }

    // Hero Slider Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;
    const heroSlider = document.querySelector('.hero-slider');

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            goToSlide(currentSlide + 1); // Swipe Left -> Next
            resetTimer();
        } else if (touchEndX > touchStartX + 50) {
            goToSlide(currentSlide - 1); // Swipe Right -> Prev
            resetTimer();
        }
    }

    if (heroSlider) {
        heroSlider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        heroSlider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    if (slides.length > 0) {
        slideTimer = setInterval(nextSlide, slideInterval);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                slides[currentSlide].classList.remove('active');
                dots[currentSlide].classList.remove('active');
                currentSlide = index;
                slides[currentSlide].classList.add('active');
                dots[currentSlide].classList.add('active');
                resetTimer();
            });
        });

        // Pause on hover
        const sliderContainer = document.querySelector('.hero-slider');
        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideTimer));
        sliderContainer.addEventListener('mouseleave', () => {
            slideTimer = setInterval(nextSlide, slideInterval);
        });
    }

    // Pricing Toggle Logic
    const billingToggle = document.getElementById('billing-toggle');
    const priceVals = document.querySelectorAll('.price-val');

    if (billingToggle) {
        billingToggle.addEventListener('change', () => {
            priceVals.forEach(price => {
                const monthly = price.getAttribute('data-monthly');
                const yearly = price.getAttribute('data-yearly');

                price.style.opacity = '0';
                setTimeout(() => {
                    price.textContent = billingToggle.checked ? yearly : monthly;
                    price.style.opacity = '1';
                }, 200);
            });
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => otherItem.classList.remove('active'));

            // Toggle current item
            if (!isActive) item.classList.add('active');
        });
    });

    // ROI Calculator
    const subRange = document.getElementById('subscriber-range');
    const subCount = document.getElementById('sub-count');
    const savingsVal = document.getElementById('savings-val');

    const updateROI = () => {
        if (!subRange) return;
        const subscribers = parseInt(subRange.value);
        const savings = subscribers * 5000; // Example: Rp 5.000 saved per sub

        subCount.textContent = subscribers.toLocaleString();
        savingsVal.textContent = 'Rp ' + savings.toLocaleString();
    };

    if (subRange) {
        subRange.addEventListener('input', updateROI);
        updateROI(); // Initial calc
    }

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    };

    revealOnScroll(); // Initial check
    window.addEventListener('scroll', revealOnScroll);

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                // If mobile menu is open, close it
                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');

                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Live Ticker Logic
    const tickerText = document.getElementById('ticker-text');
    const messages = [
        'Sistem Aktif: 1,284 Pelanggan Terkoneksi Real-time',
        'Notifikasi WA: 15 Invoice dikirim otomatis hari ini',
        'Auto Isolir: 3 Layanan dinonaktifkan sementara',
        'Network Status: Up-time Router Pusat 99.98%',
        'Pembayaran: Rp 12.5M diproses bulan ini'
    ];
    let msgIndex = 0;

    function rotateTicker() {
        if (!tickerText) return;
        tickerText.style.opacity = '0';
        tickerText.style.transform = 'translateY(10px)';

        setTimeout(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            tickerText.textContent = messages[msgIndex];
            tickerText.style.opacity = '1';
            tickerText.style.transform = 'translateY(0)';
        }, 500);
    }

    if (tickerText) {
        tickerText.style.transition = 'all 0.5s ease';
        setInterval(rotateTicker, 4000);
    }

    // Mini Chart Animation (Simulated)
    const bars = document.querySelectorAll('.mini-chart .bar');
    if (bars.length > 0) {
        setInterval(() => {
            bars.forEach(bar => {
                const newHeight = Math.floor(Math.random() * 60) + 30;
                bar.style.height = newHeight + '%';
            });
        }, 2000);
    }
});
