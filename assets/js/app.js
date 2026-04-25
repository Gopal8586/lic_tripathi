/**
 * app.js – Global Application Utilities
 * Team Shivam Tripathi | LIC_Local
 * ───────────────────────────────────────
 * Shared utilities used across all pages.
 * Imported by pages that need specific features.
 */

/**
 * Track WhatsApp click event
 */
export function trackWhatsAppClick(source = 'unknown') {
  console.info(`[Analytics] WhatsApp clicked from: ${source}`);
  // Replace with actual analytics if needed
}

/**
 * Smooth scroll to element by selector
 */
export function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Simple animation on scroll observer
 * Add class 'animate-on-scroll' to elements you want animated.
 */
export function initScrollAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));
}

/**
 * Format phone number for display
 */
export function formatPhone(raw) {
  return raw.replace(/(\d{5})(\d{5})/, '$1 $2');
}

/**
 * WhatsApp redirect with message
 */
export function openWhatsApp(message = 'Hello Shivam') {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/919336312716?text=${encoded}`, '_blank');
}

/**
 * Add active nav link based on current URL path automatically
 */
export function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('.')[0];
    const currentPage = path.split('/').pop().split('.')[0] || 'index';
    if (linkPage === currentPage || (currentPage === 'index' && linkPage === 'index')) {
      link.classList.add('active');
    }
  });
}

// Expose globally for non-module contexts if needed
window.LICLocal = { trackWhatsAppClick, scrollTo, openWhatsApp };
