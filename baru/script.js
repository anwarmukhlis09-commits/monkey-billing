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

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Subtle parallax effect for Hero Background
    const heroBg = document.querySelector('.hero-bg img');
    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        if (heroBg) {
            heroBg.style.transform = `scale(${1 + scroll * 0.0002}) translateY(${scroll * 0.1}px)`;
        }
    });

    // Scene Card Interaction Log (Optional enhancement)
    const sceneCards = document.querySelectorAll('.scene-card');
    sceneCards.forEach(card => {
        card.addEventListener('click', () => {
            console.log(`Entering scene: ${card.querySelector('h3').textContent}`);
            // Here you could trigger a modal or redirect to a simulator page
        });
    });
});
