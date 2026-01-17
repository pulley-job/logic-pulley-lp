/**
 * Logic Pulley - Main JavaScript
 * @description Handles scroll animations, header effects, and mobile navigation
 * @version 2.0.0
 */

'use strict';

/**
 * Configuration constants
 */
const CONFIG = {
    SCROLL_THRESHOLD: 50,
    OBSERVER_THRESHOLD: 0.1,
    ANIMATION_SELECTORS: [
        '.fade-in-up',
        '.fade-in',
        '.fade-in-left',
        '.fade-in-right',
        '.card',
        '.profile-card',
        '.timeline-content'
    ]
};

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initHeaderScrollEffect();
    initMobileNavigation();
    initTestimonialSlider();
});

/**
 * Initialize testimonial slider controls
 */
function initTestimonialSlider() {
    const track = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    // Scroll amount = container width (visible area)
    const scrollAmount = () => {
        const cardWidth = track.querySelector('.testimonial-card').offsetWidth;
        const gap = parseInt(getComputedStyle(track).gap) || 0;
        // Scroll 3 cards at a time (or less on mobile) based on visible width
        return track.clientWidth;
    };

    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    // Optional: Update button states
    const updateButtons = () => {
        prevBtn.disabled = track.scrollLeft <= 10; // Tolerance
        nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    };

    track.addEventListener('scroll', updateButtons, { passive: true });
    // Initial check
    setTimeout(updateButtons, 100);

    // 3D Effect: Add 'active' class to visible cards
    const observerOptions = {
        root: track,
        threshold: 0.6 // Card is considered active when 60% visible
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    const cards = track.querySelectorAll('.testimonial-card');
    cards.forEach(card => cardObserver.observe(card));
}

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: CONFIG.OBSERVER_THRESHOLD
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
        CONFIG.ANIMATION_SELECTORS.join(', ')
    );

    animateElements.forEach((element) => {
        if (!hasAnimationClass(element)) {
            element.classList.add('fade-in-up');
        }
        observer.observe(element);
    });
}

/**
 * Check if element already has an animation class
 * @param {Element} element - DOM element to check
 * @returns {boolean} - Whether element has animation class
 */
function hasAnimationClass(element) {
    const animationClasses = ['fade-in', 'fade-in-left', 'fade-in-right', 'fade-in-up'];
    return animationClasses.some((className) => element.classList.contains(className));
}

/**
 * Initialize header scroll effect
 * Uses CSS class toggle for better separation of concerns
 */
function initHeaderScrollEffect() {
    const header = document.querySelector('.header');

    if (!header) return;

    const handleScroll = () => {
        const isScrolled = window.scrollY > CONFIG.SCROLL_THRESHOLD;
        header.classList.toggle('header--scrolled', isScrolled);
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();
}

/**
 * Initialize mobile navigation toggle
 */
function initMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking navigation links
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}
