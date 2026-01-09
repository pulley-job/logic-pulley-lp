// Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

const animateElements = document.querySelectorAll('.fade-in-up, .fade-in, .fade-in-left, .fade-in-right, .card, .profile-card, .timeline-content');
animateElements.forEach(el => {
    // Only add default animation if no specific one exists
    if (!el.classList.contains('fade-in') &&
        !el.classList.contains('fade-in-left') &&
        !el.classList.contains('fade-in-right') &&
        !el.classList.contains('fade-in-up')) {
        el.classList.add('fade-in-up');
    }
    observer.observe(el);
});

// Header styling on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        header.style.padding = '1rem 5%';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.8)';
        header.style.boxShadow = 'none';
        header.style.padding = '1.5rem 5%';
    }
});

// Hamburger Menu Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}
