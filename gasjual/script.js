// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.style.background = 'rgba(255, 255, 255, 0.9)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('menu-active');
        });
    }

    // Auth Modal Logic
    const authModal = document.getElementById('auth-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeModalBtn = document.querySelector('.close-modal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    // Auth Trigger Buttons
    const loginBtns = document.querySelectorAll('.login-trigger');
    const registerBtns = document.querySelectorAll('.register-trigger');

    function openModal(tab = 'login') {
        if(authModal) {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            switchTab(tab);
        }
    }

    function closeModal() {
        if(authModal) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function switchTab(target) {
        authTabs.forEach(tab => {
            if (tab.dataset.target === target) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        authForms.forEach(form => {
            if (form.id === `${target}-form`) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    }

    // Event Listeners for Opening Modal
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('login');
        });
    });

    registerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('register');
        });
    });

    // Event Listeners for Closing Modal
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modalOverlay) modalOverlay.addEventListener('click', closeModal);
    
    // Tab Switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.target);
        });
    });

    // Profit Calculator
    const salesSlider = document.getElementById('sales-slider');
    const salesVal = document.getElementById('sales-val');
    const profitResult = document.getElementById('profit-result');
    
    if(salesSlider && salesVal && profitResult) {
        const avgMargin = 50000;
        const daysInMonth = 30;

        salesSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            salesVal.textContent = `${val} Produk`;
            
            const total = val * avgMargin * daysInMonth;
            profitResult.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        });
    }

    // Password Visibility Toggle
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Toggle current FAQ
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                navbar.classList.remove('menu-active');
            }
        });
    });
});
