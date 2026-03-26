/* ═══════════════════════════════════════════
   SVOYA Nail Studio — Vanilla JS (XSS-safe)
   No innerHTML. All DOM via safe methods.
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── DOM references ── */
    const header     = document.getElementById('site-header');
    const hamburger  = document.getElementById('hamburger');
    const nav        = document.getElementById('main-nav');
    const navLinks   = nav.querySelectorAll('.nav-link');
    const galleryEl  = document.getElementById('gallery-grid');
    const lightbox   = document.getElementById('lightbox');
    const lbImg      = document.getElementById('lightbox-img');
    const lbClose    = document.getElementById('lightbox-close');

    /* ═══════════════════════════════════
       1. STICKY HEADER — glass blur after scroll
       ═══════════════════════════════════ */
    let lastScroll = 0;
    function onScroll() {
        const y = window.scrollY;
        if (y > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check

    /* ═══════════════════════════════════
       2. MOBILE NAV TOGGLE
       ═══════════════════════════════════ */
    function toggleNav() {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('no-scroll', isOpen);
    }

    function closeNav() {
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    }

    hamburger.addEventListener('click', toggleNav);

    navLinks.forEach(function (link) {
        link.addEventListener('click', closeNav);
    });

    /* ═══════════════════════════════════
       3. SMOOTH SCROLL (anchor links)
       ═══════════════════════════════════ */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var headerH = header.offsetHeight;
            var top = target.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    /* ═══════════════════════════════════
       4. SCROLL ANIMATIONS (IntersectionObserver)
       ═══════════════════════════════════ */
    var animatedEls = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
        var animObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        animatedEls.forEach(function (el) {
            animObserver.observe(el);
        });
    } else {
        // Fallback: show everything
        animatedEls.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    /* ═══════════════════════════════════
       5. GALLERY LIGHTBOX (no innerHTML, safe DOM)
       ═══════════════════════════════════ */
    function openLightbox(src, alt) {
        lbImg.setAttribute('src', src);
        lbImg.setAttribute('alt', alt || '');
        lightbox.removeAttribute('hidden');
        // Force reflow before adding class for transition
        void lightbox.offsetWidth;
        lightbox.classList.add('is-open');
        document.body.classList.add('no-scroll');
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('no-scroll');
        setTimeout(function () {
            lightbox.setAttribute('hidden', '');
            lbImg.setAttribute('src', '');
            lbImg.setAttribute('alt', '');
        }, 300);
    }

    // Delegate clicks on gallery images
    if (galleryEl) {
        galleryEl.addEventListener('click', function (e) {
            var item = e.target.closest('.gallery-item');
            if (!item) return;
            var img = item.querySelector('img');
            if (!img) return;
            openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
        });
    }

    lbClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });

    /* ═══════════════════════════════════
       6. HERO VIDEO LAZY-LOAD
       ═══════════════════════════════════ */
    var heroVideo = document.querySelector('.hero-video');
    if (heroVideo && 'IntersectionObserver' in window) {
        var videoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    heroVideo.play().catch(function () { /* autoplay blocked */ });
                    videoObserver.unobserve(heroVideo);
                }
            });
        }, { threshold: 0.25 });
        videoObserver.observe(heroVideo);
    }

    /* ═══════════════════════════════════
       7. MODULAR BOOKING CTA
       All buttons with [data-booking-url] are
       wired here. Swap the URL or replace this
       block with an API widget initializer later.
       ═══════════════════════════════════ */
    // Currently the hrefs are set in HTML directly.
    // This hook exists so you can programmatically
    // update all booking buttons at once:
    //
    //   updateBookingUrl('https://new-booking-system.com/book');
    //
    function updateBookingUrl(newUrl) {
        document.querySelectorAll('[data-booking-url]').forEach(function (btn) {
            btn.setAttribute('href', newUrl);
            btn.setAttribute('data-booking-url', newUrl);
        });
    }

    // Expose to global scope for future widget integration
    window.SvoyaBooking = {
        updateUrl: updateBookingUrl
    };

})();
