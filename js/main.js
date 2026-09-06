/**
 * © Copyright 2026 by Mr. Pongsakorn Yimsuk-anan in Thailand.
 * All rights reserved. Designed and developed for The Heritage House (Demo Showcase).
 * 
 * THE HERITAGE HOUSE BANGKOK — Main JavaScript
 * เรือนศิลป์ริมน้ำ (Interactive Demo Showcase)
 * Handles: Parallax, Scroll Animations, Nav, Gallery Lightbox, Counter, Leaflet Map
 */

'use strict';

/* ===========================================
   CONSTANTS & STATE
   =========================================== */
const NAV   = document.getElementById('navbar');
const HAMBURGER = document.getElementById('hamburger');
const MOBILE_NAV = document.getElementById('mobile-nav');
let   lastScrollY = 0;

/* ===========================================
   NAVBAR — Scroll-aware sticky glass
   =========================================== */
function handleNavbarScroll() {
  const scrollY = window.scrollY;

  if (scrollY > 60) {
    NAV.classList.add('scrolled');
  } else {
    NAV.classList.remove('scrolled');
  }

  lastScrollY = scrollY;
}

/* ===========================================
   HAMBURGER MENU (MOBILE)
   =========================================== */
if (HAMBURGER) {
  HAMBURGER.addEventListener('click', () => {
    const isOpen = MOBILE_NAV.classList.toggle('open');
    HAMBURGER.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

// Close mobile nav on link click
document.querySelectorAll('#mobile-nav a').forEach(link => {
  link.addEventListener('click', () => {
    MOBILE_NAV.classList.remove('open');
    HAMBURGER.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ===========================================
   PARALLAX HERO BACKGROUND
   =========================================== */
const heroBg = document.querySelector('.hero-bg');

function handleParallax() {
  if (!heroBg) return;
  const scrolled = window.scrollY;
  // Move bg slightly slower than scroll for depth
  const yPos = scrolled * 0.4;
  heroBg.style.transform = `scale(1.08) translateY(${yPos}px)`;
}

/* ===========================================
   SCROLL REVEAL (IntersectionObserver)
   =========================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target); // Only reveal once
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

function initRevealObserver() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
}

/* ===========================================
   ANIMATED COUNTER (ABOUT SECTION)
   =========================================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = duration / target;
  let current = 0;

  const timer = setInterval(() => {
    current++;
    el.textContent = current + (el.dataset.suffix || '');
    if (current >= target) clearInterval(timer);
  }, step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

function initCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    counterObserver.observe(el);
  });
}

/* ===========================================
   GALLERY LIGHTBOX
   =========================================== */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src  = src;
  lightboxImg.alt  = alt || '';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function initGallery() {
  document.querySelectorAll('.gallery-item[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ===========================================
   SMOOTH SCROLL for Anchor Links
   =========================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = NAV ? NAV.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });
}

/* ===========================================
   EXPERIENCE CARDS — Subtle 3D tilt on mouse
   =========================================== */
function initCardTilt() {
  document.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ===========================================
   SCROLL INDICATOR DOTS
   =========================================== */
const indicatorNav  = document.querySelector('.scroll-indicator-nav');
const indicatorDots = document.querySelectorAll('.indicator-dot');
const indicatorSectionIds = ['hero','about','experiences','gallery','cafe','getting-there','contact'];
let scrollingTimer = null;

function updateIndicatorDots() {
  if (!indicatorNav) return;

  // Determine which section is most visible in viewport
  let activeId = indicatorSectionIds[0];
  let minDist = Infinity;

  indicatorSectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dist = Math.abs(rect.top);
    if (dist < minDist) {
      minDist = dist;
      activeId = id;
    }
  });

  // Update active class
  indicatorDots.forEach((dot, i) => {
    dot.classList.toggle('active', indicatorSectionIds[i] === activeId);
  });

  // Show indicator panel briefly while scrolling
  indicatorNav.classList.add('scrolling');
  clearTimeout(scrollingTimer);
  scrollingTimer = setTimeout(() => {
    indicatorNav.classList.remove('scrolling');
  }, 1200);
}

/* ===========================================
   SCROLL PROGRESS BAR
   =========================================== */
function updateScrollProgress() {
  const progress = document.getElementById('scroll-progress');
  if (!progress) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled  = (window.scrollY / docHeight) * 100;
  progress.style.width = `${scrolled}%`;
}

/* ===========================================
   SCROLL EVENT (Batched RAF)
   =========================================== */
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleNavbarScroll();
      handleParallax();
      updateScrollProgress();
      updateIndicatorDots();
      ticking = false;
    });
    ticking = true;
  }
}

/* ===========================================
   LEAFLET MAP INITIALIZATION & CUSTOM MARKER
   =========================================== */
function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  const lat = 13.728200;
  const lng = 100.511500;

  // Initialize Leaflet map with scrollWheelZoom enabled (Demo scenic location)
  const map = L.map('map', {
    scrollWheelZoom: true
  }).setView([lat, lng], 16);

  // Load OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Create custom CSS marker pin (anchor fixed at [25, 44] to prevent drifting on zoom)
  const customMarkerIcon = L.divIcon({
    className: 'custom-pin-container',
    html: `
      <div class="custom-pin">
        <div class="pin-logo">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-light);">
            <path d="M3 10.5L12 3l9 7.5"/>
            <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/>
            <path d="M9 21V12h6v9"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 44],
    popupAnchor: [0, -44]
  });

  // Add marker with custom icon to the map
  const marker = L.marker([lat, lng], { icon: customMarkerIcon }).addTo(map);

  // Bind popup info
  marker.bindPopup(`
    <div style="text-align: center; padding: 4px;">
      <strong style="color: var(--gold-light); font-size: 0.95rem;">The Heritage House</strong><br>
      <span style="font-size: 0.8rem; opacity: 0.85;">เรือนศิลป์ริมน้ำ (Demo Showcase)</span><br>
      <span style="font-size: 0.75rem; color: rgba(255,255,255,0.7); display: block; margin-top: 4px;">
        ริมสายน้ำฝั่งธนบุรี (พิกัดจำลองนำเสนอผลงาน)
      </span>
      <a href="https://www.google.com/maps?q=13.728200,100.511500" 
         target="_blank" rel="noopener noreferrer" 
         style="color: var(--gold); text-decoration: underline; font-size: 0.8rem; margin-top: 6px; display: inline-block;">
        เปิดดูใน Google Maps
      </a>
    </div>
  `).openPopup();
}

/* ===========================================
   SECURITY HARDENING — ANTI-THEFT / ANTI-COPY
   =========================================== */
function initSecurityHardening() {
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname === '' || 
                  window.location.protocol === 'file:';

  // NOTE: FOR TESTING PURPOSES locally, we allow copy protection to run
  // but if you want to bypass it during development, change to (isLocal && false)
  if (isLocal) {
    console.log('%c🛡️ Developer Mode (Testing): Copy protection is FORCED active for local verification.', 'color: #C9A84C; font-weight: bold;');
  } else {
    console.log('%c🛡️ Production Mode: Security protection active.', 'color: #7A1C2E; font-weight: bold;');
  }

  // 1. Add class to disable text selection and image dragging
  document.body.classList.add('no-copy-protection');

  // 2. Disable context menu (right click)
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
  }, false);

  // 3. Disable F12 and standard inspection shortcuts
  document.addEventListener('keydown', e => {
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect elements)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }
  }, false);
}

/* ===========================================
   ZOOM GUARD — Cap zoom-out at 1920×1080
   =========================================== */
function initZoomGuard() {
  const MAX_WIDTH = 1920; // px — cap zoom-out at this effective viewport width

  // Block Ctrl + scroll-down (zoom out)
  window.addEventListener('wheel', function(e) {
    if (e.ctrlKey && e.deltaY > 0) {
      // deltaY > 0 means scroll down = zooming out
      if (window.innerWidth >= MAX_WIDTH) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  // Block Ctrl + Minus  (keyboard zoom out)
  window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === '-' || e.key === '_')) {
      if (window.innerWidth >= MAX_WIDTH) {
        e.preventDefault();
      }
    }
    // Also block Ctrl + 0 (reset zoom) when it would result in too zoomed-out view
    // (allow Ctrl+0 if screen is <= 1920px — it's a reset to 100%)
  }, false);
}

/* ===========================================
   INIT ON DOM READY
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Scroll events
  window.addEventListener('scroll', onScroll, { passive: true });
  handleNavbarScroll(); // Initial check

  // Init modules
  initRevealObserver();
  initCounters();
  initGallery();
  initSmoothScroll();
  initCardTilt();
  initMap();
  initSecurityHardening();
  initZoomGuard();

  console.log('%c🎨 The Heritage House Bangkok', 'color: #C9A84C; font-size: 1.2rem; font-weight: bold;');
  console.log('%cเรือนศิลป์ริมน้ำ — Interactive Demo Showcase', 'color: #7A1C2E; font-size: 0.9rem;');
});


