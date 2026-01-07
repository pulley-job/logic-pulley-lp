// Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows immediately
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with slight delay
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

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

// Add extra CSS for the cursor dynamically or ensure it is in CSS
// Adding it here to be safe if I missed it in style.css, but I should have put it there.
// I will check style.css content. I didn't add cursor styles in style.css.
// I can add them via JS injection or update style.css. Updating style.css is cleaner but I can't look back easily.
// I'll append the cursor styles to the head.
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .cursor-dot {
        width: 5px;
        height: 5px;
        background-color: var(--primary-color);
        position: fixed;
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
    }
    .cursor-outline {
        width: 30px;
        height: 30px;
        border: 2px solid var(--primary-color);
        position: fixed;
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        z-index: 9998;
        pointer-events: none;
        transition: width 0.2s, height 0.2s, background-color 0.2s;
    }
    /* Hover effects for cursor */
    a:hover ~ .cursor-outline, button:hover ~ .cursor-outline {
        transform: translate(-50%, -50%) scale(1.5);
        background-color: rgba(66, 133, 244, 0.1);
        border-color: transparent;
    }
`;
document.head.appendChild(styleSheet);

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
