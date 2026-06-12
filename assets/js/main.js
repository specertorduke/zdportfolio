// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 1. Custom Cursor setup
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button');

    // Only apply custom cursor on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Move inner cursor instantly (0 latency)
            gsap.set(cursor, {
                x: mouseX,
                y: mouseY
            });
        });

        // Snappy follow for outer ring
        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.35;
            followerY += (mouseY - followerY) * 0.35;

            gsap.set(cursorFollower, {
                x: followerX,
                y: followerY
            });
        });

        // Hover states
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                cursor.classList.add('hovered');
                cursorFollower.classList.add('hovered');
            });
            target.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovered');
                cursorFollower.classList.remove('hovered');
            });
        });
    }

    // 2. Magnetic effect for specific elements
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach((elem) => {
        elem.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const strength = this.getAttribute('data-strength') || 20;

            // Get mouse position relative to element center
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);

            gsap.to(this, {
                x: x / rect.width * strength,
                y: y / rect.height * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        elem.addEventListener('mouseleave', function () {
            gsap.to(this, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // Helper function to split text into inline-block spans for individual animations
    function splitTextIntoSpans(element) {
        const text = element.textContent.trim();
        element.innerHTML = "";
        [...text].forEach(char => {
            const span = document.createElement("span");
            span.className = "char-trigger";
            if (char === " ") {
                span.innerHTML = "&nbsp;";
            } else {
                span.textContent = char;
            }
            element.appendChild(span);
        });
    }

    // Prepare intro title characters for animation
    const introTitle = document.querySelector(".intro-title");
    if (introTitle) splitTextIntoSpans(introTitle);

    // Set initial states for main page elements to prevent flashing
    gsap.set(".navbar", { y: -30, opacity: 0 });
    gsap.set(".hero .reveal-text > *", { y: 80, opacity: 0 });
    gsap.set(".scroll-indicator", { opacity: 0 });

    // 3. Intro Sequence Animations
    const introTl = gsap.timeline();

    // First, show the particle
    gsap.fromTo(".intro-particle",
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }
    );

    // Continuous pulse on particle
    const pulseTween = gsap.to(".intro-particle", {
        scale: 1.4,
        opacity: 0.8,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Morph particle to rotating cyber core
    introTl.to(".intro-particle", {
        scale: 4,
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
            pulseTween.kill();
            const particle = document.querySelector(".intro-particle");
            if (particle) particle.style.display = "none";
        }
    }, "+=0.2");

    introTl.to(".intro-core", {
        scale: 1,
        opacity: 1,
        duration: 1.0,
        ease: "elastic.out(1, 0.75)"
    }, "-=0.8");

    // Swing-down 3D reveal for "hello !" characters
    introTl.fromTo(".intro-title .char-trigger",
        {
            opacity: 0,
            y: 40,
            rotationX: -90,
            transformPerspective: 600,
            transformOrigin: "50% 0%"
        },
        {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "back.out(2.5)"
        },
        "-=0.6"
    );

    // Reveal divider line
    introTl.to(".intro-divider", {
        width: "140px",
        duration: 0.8,
        ease: "power2.inOut"
    }, "-=0.5");

    // Reveal subtitles with snappy elastic pop
    introTl.fromTo(".intro-sub-item",
        {
            opacity: 0,
            y: 35,
            scale: 0.95
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(2)"
        },
        "-=0.4"
    );

    // Reveal Initialize button
    introTl.to(".intro-trigger-container", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.3");

    // Click trigger to Enter the portfolio
    const enterBtn = document.getElementById("enter-btn");
    if (enterBtn) {
        enterBtn.addEventListener("click", () => {
            enterBtn.style.pointerEvents = "none";

            const exitTl = gsap.timeline({
                onComplete: () => {
                    document.body.classList.remove("loading");
                    const overlay = document.querySelector(".intro-overlay");
                    if (overlay) overlay.remove();

                    // Run page entry timeline
                    runMainReveal();
                }
            });

            // Pulse effect feedback
            exitTl.to(enterBtn, {
                scale: 0.95,
                opacity: 0,
                duration: 0.2,
                ease: "power2.out"
            });

            // Expand core (zoom portal transition)
            exitTl.to(".intro-core", {
                scale: 12,
                opacity: 0,
                duration: 1.4,
                ease: "power4.inOut"
            }, "-=0.1");

            exitTl.to(".intro-text", {
                y: -60,
                opacity: 0,
                duration: 0.8,
                ease: "power3.in"
            }, "-=1.2");

            exitTl.to(".intro-overlay", {
                opacity: 0,
                duration: 0.9,
                ease: "power2.out"
            }, "-=0.7");
        });
    }

    // Page Reveal Timeline
    function runMainReveal() {
        const mainTl = gsap.timeline();

        mainTl.fromTo(".navbar",
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        ).fromTo(".hero .reveal-text > *",
            { y: 80, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1.0, 
                stagger: 0.15, 
                ease: "power4.out",
                onComplete: () => {
                    gsap.set(".hero-cta", { overflow: "visible" });
                }
            },
            "-=0.5"
        ).fromTo(".scroll-indicator",
            { opacity: 0 },
            { opacity: 0.5, duration: 1 },
            "-=0.5"
        );
    }

    // 4. Smart/Hide Navbar on Scroll Down
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // If scrolling down and past the initial 100px
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            navbar.classList.add('nav-hidden');
        } else {
            // Scrolling up or at the very top
            navbar.classList.remove('nav-hidden');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Avoid negative values on bounce back
    }, { passive: true });

    // 5. Scroll Animations (GSAP ScrollTrigger)

    // Reveal text elements (fade and translate up)
    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach((elem) => {
        gsap.fromTo(elem,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%", // animation starts when top of element hits 85% of viewport height
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // Line animations
    const lines = document.querySelectorAll('.line');
    lines.forEach((line) => {
        gsap.fromTo(line,
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: 1,
                ease: "power3.inOut",
                scrollTrigger: {
                    trigger: line,
                    start: "top 90%"
                }
            }
        );
    });

    // Certifications Staggered Reveal
    gsap.fromTo(".cert-item",
        { x: -50, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".cert-list",
                start: "top 80%"
            }
        }
    );

    // Tags Staggered Reveal
    gsap.fromTo(".tag",
        { scale: 0.8, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: ".tags",
                start: "top 85%"
            }
        }
    );

    // ==========================================
    // 6. 3D PERSPECTIVE CAROUSEL & PORTAL SHOWCASE
    // ==========================================

    // Dynamic Blueprint SVG Generator
    function getBlueprintSVG(projectId, slideIndex) {
        if (projectId === 'furrytails') {
            if (slideIndex === 0) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <path d="M 10 30 L 100 30" stroke="var(--accent-color)" stroke-width="2" />
                    <path d="M 590 350 L 500 350" stroke="var(--accent-color)" stroke-width="2" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">CLIENT_BOOKING_PORTAL // UI_FLOW</text>
                    <g transform="translate(30, 80)">
                        <rect x="0" y="0" width="220" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1" fill="none" />
                        <text x="10" y="25" font-family="Courier, monospace" font-size="11" fill="#fff">SELECT APPOINTMENT</text>
                        <line x1="10" y1="35" x2="210" y2="35" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                        <g transform="translate(15, 50)" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1" fill="none">
                            <text x="5" y="-5" font-family="Courier, monospace" font-size="9" fill="var(--accent-secondary)" stroke="none">M T W T F S S</text>
                            <rect x="0" y="5" width="22" height="20" />
                            <rect x="27" y="5" width="22" height="20" />
                            <rect x="54" y="5" width="22" height="20" />
                            <rect x="81" y="5" width="22" height="20" />
                            <rect x="108" y="5" width="22" height="20" />
                            <rect x="135" y="5" width="22" height="20" stroke="var(--accent-color)" fill="rgba(0, 240, 255, 0.15)" stroke-width="1.5" class="bp-pulse" />
                            <rect x="162" y="5" width="22" height="20" />
                            <rect x="0" y="30" width="22" height="20" />
                            <rect x="27" y="30" width="22" height="20" />
                            <rect x="54" y="30" width="22" height="20" />
                            <rect x="81" y="30" width="22" height="20" />
                            <rect x="108" y="30" width="22" height="20" />
                            <rect x="135" y="30" width="22" height="20" />
                            <rect x="162" y="30" width="22" height="20" />
                            <rect x="0" y="55" width="22" height="20" />
                            <rect x="27" y="55" width="22" height="20" />
                            <rect x="54" y="55" width="22" height="20" />
                            <rect x="81" y="55" width="22" height="20" />
                            <rect x="108" y="55" width="22" height="20" />
                            <rect x="135" y="55" width="22" height="20" />
                            <rect x="162" y="55" width="22" height="20" />
                        </g>
                        <text x="15" y="180" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" opacity="0.8">SELECTED: JUNE 14, 2025</text>
                    </g>
                    <g transform="translate(280, 80)">
                        <rect x="0" y="0" width="290" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#fff">BOOKING PARAMS & PRICING</text>
                        <line x1="15" y1="35" x2="275" y2="35" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                        <rect x="15" y="50" width="260" height="25" rx="3" stroke="rgba(0, 240, 255, 0.2)" fill="rgba(0,240,255,0.03)" />
                        <text x="25" y="66" font-family="Courier, monospace" font-size="9" fill="#bbb">BREED: Poodle (Large)</text>
                        <path d="M 260 60 L 265 65 L 270 60" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                        <rect x="15" y="85" width="260" height="25" rx="3" stroke="rgba(0, 240, 255, 0.2)" fill="rgba(0,240,255,0.03)" />
                        <text x="25" y="101" font-family="Courier, monospace" font-size="9" fill="#bbb">SERVICE: Full Groom & Spa</text>
                        <path d="M 260 95 L 265 100 L 270 95" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                        <g transform="translate(15, 122)">
                            <text x="0" y="12" font-family="Courier, monospace" font-size="9" fill="#888">BASE GROOMING FEE ............ $45.00</text>
                            <text x="0" y="27" font-family="Courier, monospace" font-size="9" fill="#888">LARGE BREED TARIFF ........... $10.00</text>
                            <line x1="0" y1="35" x2="260" y2="35" stroke="rgba(0,240,255,0.15)" stroke-width="1" stroke-dasharray="3 3" />
                            <text x="0" y="52" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">TOTAL CALCULATED: $55.00</text>
                        </g>
                    </g>
                    <path d="M 30 310 L 570 310" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                    <circle cx="45" cy="330" r="4" fill="var(--accent-color)" class="bp-pulse" />
                    <text x="60" y="334" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" opacity="0.8">PRICING_ENGINE: ONLINE</text>
                    <rect x="460" y="320" width="110" height="22" rx="3" stroke="var(--accent-color)" fill="rgba(0,240,255,0.05)" />
                    <text x="475" y="335" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">SUBMIT_FLOW</text>
                </svg>
                `;
            } else if (slideIndex === 1) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">ADMIN_SCHEDULER // ALLOC_BOARD</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="540" height="210" rx="4" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1" fill="none" />
                        <line x1="0" y1="35" x2="540" y2="35" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1.5" />
                        <line x1="100" y1="0" x2="100" y2="210" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                        <line x1="320" y1="0" x2="320" y2="210" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="var(--accent-secondary)" font-weight="bold">TIME</text>
                        <text x="115" y="22" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">STATION A (GROOMING)</text>
                        <text x="335" y="22" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">STATION B (BOARDING)</text>
                        <line x1="0" y1="75" x2="540" y2="75" stroke="rgba(0, 240, 255, 0.15)" stroke-width="1" />
                        <line x1="0" y1="115" x2="540" y2="115" stroke="rgba(0, 240, 255, 0.15)" stroke-width="1" />
                        <line x1="0" y1="155" x2="540" y2="155" stroke="rgba(0, 240, 255, 0.15)" stroke-width="1" />
                        <text x="15" y="58" font-family="Courier, monospace" font-size="10" fill="#fff">08:00 AM</text>
                        <rect x="110" y="42" width="195" height="26" rx="3" stroke="var(--accent-color)" fill="rgba(0, 240, 255, 0.12)" stroke-width="1.2" />
                        <text x="120" y="58" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" font-weight="bold">MAX (POODLE) - COMPLETE GROOM</text>
                        <text x="335" y="58" font-family="Courier, monospace" font-size="9" fill="#555" font-style="italic">-- IDLE --</text>
                        <text x="15" y="98" font-family="Courier, monospace" font-size="10" fill="#fff">10:00 AM</text>
                        <text x="115" y="98" font-family="Courier, monospace" font-size="9" fill="#555" font-style="italic">-- IDLE --</text>
                        <rect x="330" y="82" width="195" height="26" rx="3" stroke="var(--accent-secondary)" fill="rgba(157, 78, 221, 0.12)" stroke-width="1.2" />
                        <text x="340" y="98" font-family="Courier, monospace" font-size="9" fill="var(--accent-secondary)" font-weight="bold">ROCKY (G. SHEPHERD) - CABIN 04</text>
                        <text x="15" y="138" font-family="Courier, monospace" font-size="10" fill="#fff">12:00 PM</text>
                        <rect x="110" y="122" width="195" height="26" rx="3" stroke="var(--accent-color)" fill="rgba(0, 240, 255, 0.12)" stroke-width="1.2" />
                        <text x="120" y="138" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" font-weight="bold">LUNA (PERSIAN CAT) - BATH & BRUSH</text>
                        <text x="335" y="138" font-family="Courier, monospace" font-size="9" fill="#555" font-style="italic">-- IDLE --</text>
                        <text x="15" y="185" font-family="Courier, monospace" font-size="10" fill="#fff">02:00 PM</text>
                        <text x="115" y="185" font-family="Courier, monospace" font-size="9" fill="#bbb">SYSTEM CHECK IN: BELLA (RETRIEVER)</text>
                    </g>
                    <g transform="translate(30, 310)">
                        <text x="0" y="15" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">OCCUPANCY RATE:</text>
                        <rect x="150" y="3" width="200" height="15" rx="3" stroke="rgba(0,240,255,0.3)" fill="none" />
                        <rect x="153" y="6" width="150" height="9" rx="2" fill="var(--accent-color)" />
                        <text x="365" y="15" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)">75% ACTIVE</text>
                    </g>
                </svg>
                `;
            } else if (slideIndex === 2) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">PATIENT_DATA // HEALTH_PROFILER</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="240" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <circle cx="120" cy="55" r="30" stroke="var(--accent-color)" fill="none" stroke-width="1.5" />
                        <path d="M 95 45 L 85 25 L 105 35" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                        <path d="M 145 45 L 155 25 L 135 35" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                        <text x="120" y="105" font-family="Courier, monospace" font-size="12" fill="#fff" font-weight="bold" text-anchor="middle">ROCKY</text>
                        <text x="120" y="120" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" text-anchor="middle">ID: FT-2025-0982</text>
                        <line x1="20" y1="135" x2="220" y2="135" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="155" font-family="Courier, monospace" font-size="9" fill="#888">BREED: ..... GERMAN SHEPHERD</text>
                        <text x="20" y="172" font-family="Courier, monospace" font-size="9" fill="#888">AGE: ....... 2 YEARS</text>
                        <text x="20" y="189" font-family="Courier, monospace" font-size="9" fill="#888">GENDER: .... MALE (NEUTERED)</text>
                        <text x="20" y="206" font-family="Courier, monospace" font-size="9" fill="#888">WEIGHT: .... 32.5 KG</text>
                    </g>
                    <g transform="translate(290, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">HEALTH & IMMUNOLOGY</text>
                        <line x1="15" y1="32" x2="265" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <text x="15" y="48" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">WEIGHT REGULATION MATRIX</text>
                        <g transform="translate(15, 60)" stroke="rgba(0,240,255,0.2)" stroke-width="1">
                            <line x1="0" y1="0" x2="0" y2="50" />
                            <line x1="0" y1="50" x2="240" y2="50" />
                            <path d="M 10 45 L 60 40 L 110 30 L 160 35 L 210 20 L 230 18" stroke="var(--accent-color)" stroke-width="2" fill="none" class="bp-dash-draw" />
                            <circle cx="10" cy="45" r="3" fill="var(--accent-color)" />
                            <circle cx="60" cy="40" r="3" fill="var(--accent-color)" />
                            <circle cx="110" cy="30" r="3" fill="var(--accent-color)" />
                            <circle cx="160" cy="35" r="3" fill="var(--accent-color)" />
                            <circle cx="210" cy="20" r="3" fill="var(--accent-color)" />
                            <circle cx="230" cy="18" r="3" fill="var(--accent-color)" />
                        </g>
                        <g transform="translate(15, 130)">
                            <text x="0" y="12" font-family="Courier, monospace" font-size="9" fill="#fff">IMMUNIZATION RECORD:</text>
                            <rect x="0" y="22" width="10" height="10" stroke="var(--accent-color)" fill="rgba(0,240,255,0.2)" />
                            <path d="M 2 27 L 4 29 L 8 23" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                            <text x="18" y="31" font-family="Courier, monospace" font-size="9" fill="#ccc">RABIES VACCINE</text>
                            <rect x="130" y="22" width="10" height="10" stroke="var(--accent-color)" fill="rgba(0,240,255,0.2)" />
                            <path d="M 2 27 L 4 29 L 8 23" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                            <text x="148" y="31" font-family="Courier, monospace" font-size="9" fill="#ccc">BORDETELLA</text>
                            <rect x="0" y="42" width="10" height="10" stroke="var(--accent-color)" fill="rgba(0,240,255,0.2)" />
                            <path d="M 2 27 L 4 29 L 8 23" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                            <text x="18" y="51" font-family="Courier, monospace" font-size="9" fill="#ccc">DHPP CORE STACK</text>
                        </g>
                    </g>
                    <g transform="translate(30, 310)">
                        <rect x="0" y="0" width="540" height="30" rx="3" stroke="rgba(255, 0, 0, 0.4)" fill="rgba(255, 0, 0, 0.08)" stroke-width="1" />
                        <path d="M 20 8 L 28 22 L 12 22 Z" fill="none" stroke="red" stroke-width="1.5" />
                        <text x="20" y="19" font-family="Courier, monospace" font-size="9" fill="red" text-anchor="middle" font-weight="bold">!</text>
                        <text x="40" y="19" font-family="Courier, monospace" font-size="10" fill="red" font-weight="bold">CRITICAL_ALLERGIES_REPORTED: PENICILLIN, PEANUT BUTTER</text>
                    </g>
                </svg>
                `;
            }
        } else if (projectId === 'insightful') {
            if (slideIndex === 0) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <rect x="25" y="45" width="370" height="280" rx="4" stroke="rgba(0, 240, 255, 0.5)" stroke-width="1.5" fill="none" />
                    <path d="M 35 55 L 35 70 M 35 55 L 50 55" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <path d="M 385 55 L 385 70 M 385 55 L 370 55" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <path d="M 35 305 L 35 290 M 35 305 L 50 305" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <path d="M 385 305 L 385 290 M 385 305 L 370 305" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <circle cx="210" cy="185" r="45" stroke="var(--accent-color)" stroke-width="1.2" stroke-dasharray="4 4" fill="none" class="bp-rotate" />
                    <circle cx="210" cy="185" r="15" stroke="var(--accent-color)" stroke-width="1" fill="none" />
                    <line x1="210" y1="130" x2="210" y2="240" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1" />
                    <line x1="155" y1="185" x2="265" y2="185" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1" />
                    <g transform="translate(60, 150)">
                        <rect x="0" y="0" width="80" height="100" rx="2" stroke="var(--accent-color)" stroke-width="1.5" fill="none" stroke-dasharray="4 2" />
                        <rect x="0" y="-18" width="65" height="18" fill="var(--accent-color)" />
                        <text x="5" y="-5" font-family="Courier, monospace" font-size="9" fill="#000" font-weight="bold">CUP 98%</text>
                    </g>
                    <g transform="translate(190, 210)">
                        <rect x="0" y="0" width="180" height="70" rx="2" stroke="var(--accent-secondary)" stroke-width="1.5" fill="none" stroke-dasharray="4 2" />
                        <rect x="0" y="-18" width="90" height="18" fill="var(--accent-secondary)" />
                        <text x="5" y="-5" font-family="Courier, monospace" font-size="9" fill="#000" font-weight="bold">KEYBOARD 91%</text>
                    </g>
                    <g transform="translate(415, 45)">
                        <rect x="0" y="0" width="160" height="280" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="12" y="25" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">VISION SYSTEM</text>
                        <line x1="12" y1="35" x2="148" y2="35" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="55" font-family="Courier, monospace" font-size="9" fill="#888" class="bp-pulse">STATUS: CAPTURING</text>
                        <text x="12" y="75" font-family="Courier, monospace" font-size="9" fill="#888">FPS: 30.0</text>
                        <text x="12" y="95" font-family="Courier, monospace" font-size="9" fill="#888">LATENCY: 12MS</text>
                        <line x1="12" y1="110" x2="148" y2="110" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="130" font-family="Courier, monospace" font-size="8" fill="var(--accent-color)">> OBJ_01: CUP</text>
                        <text x="12" y="145" font-family="Courier, monospace" font-size="8" fill="var(--accent-color)">  CONF: 0.9841</text>
                        <text x="12" y="165" font-family="Courier, monospace" font-size="8" fill="var(--accent-secondary)">> OBJ_02: KEYBD</text>
                        <text x="12" y="180" font-family="Courier, monospace" font-size="8" fill="var(--accent-secondary)">  CONF: 0.9125</text>
                        <line x1="12" y1="200" x2="148" y2="200" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="225" font-family="Courier, monospace" font-size="8" fill="#555">> RENDER OK</text>
                        <text x="12" y="240" font-family="Courier, monospace" font-size="8" fill="#555">> AUDIO_SYNCED</text>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">OPENCV_CORE_MODULE: ENABLED // CLASS_COUNT: 80</text>
                </svg>
                `;
            } else if (slideIndex === 1) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">OCR_MATRIX // TEXT_EXTRACTOR</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <rect x="20" y="20" width="200" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="35" width="240" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="50" width="160" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="15" y="70" width="250" height="35" stroke="var(--accent-color)" stroke-width="1.5" fill="rgba(0,240,255,0.08)" />
                        <text x="25" y="91" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="2">STEEP ELEVATION AHEAD</text>
                        <rect x="20" y="125" width="220" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="140" width="180" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="155" width="240" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="170" width="120" height="6" fill="rgba(255,255,255,0.15)" />
                        <line x1="5" y1="100" x2="275" y2="100" stroke="red" stroke-width="1" stroke-dasharray="2 2" opacity="0.7" />
                    </g>
                    <g transform="translate(330, 75)">
                        <rect x="0" y="0" width="240" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">EXTRACTED STRING</text>
                        <line x1="15" y1="32" x2="225" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <rect x="15" y="45" width="210" height="60" rx="3" stroke="rgba(0,240,255,0.15)" fill="rgba(0,240,255,0.02)" />
                        <text x="25" y="70" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" font-weight="bold">"WARNING: STEEP ELEVATION</text>
                        <text x="25" y="88" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" font-weight="bold"> AHEAD - PROCEED SLOWLY"</text>
                        <text x="15" y="135" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold">TTS AUDIO SYNTHESIZER</text>
                        <line x1="15" y1="142" x2="225" y2="142" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(20, 160)" fill="var(--accent-color)">
                            <rect x="0" y="10" width="6" height="25" rx="2" />
                            <rect x="12" y="5" width="6" height="35" rx="2" class="bp-pulse" />
                            <rect x="24" y="15" width="6" height="15" rx="2" />
                            <rect x="36" y="2" width="6" height="42" rx="2" />
                            <rect x="48" y="18" width="6" height="12" rx="2" />
                            <rect x="60" y="8" width="6" height="30" rx="2" class="bp-pulse" />
                            <rect x="72" y="2" width="6" height="40" rx="2" />
                            <rect x="84" y="14" width="6" height="18" rx="2" />
                            <rect x="96" y="20" width="6" height="8" rx="2" />
                            <rect x="108" y="5" width="6" height="35" rx="2" />
                            <rect x="120" y="10" width="6" height="25" rx="2" class="bp-pulse" />
                        </g>
                    </g>
                    <circle cx="345" cy="340" r="4" fill="var(--accent-color)" />
                    <text x="360" y="344" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">TTS_ENGINE: SYNTHESIZED_SUCCESS</text>
                </svg>
                `;
            } else if (slideIndex === 2) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">COLOR_MAPPER // RGB_HSL_ANALYSIS</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="240" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <circle cx="120" cy="107" r="75" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1" fill="none" />
                        <circle cx="120" cy="107" r="50" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" fill="none" />
                        <line x1="45" y1="107" x2="195" y2="107" stroke="rgba(0, 240, 255, 0.15)" />
                        <line x1="120" y1="32" x2="120" y2="182" stroke="rgba(0, 240, 255, 0.15)" />
                        <line x1="120" y1="107" x2="85" y2="72" stroke="var(--accent-color)" stroke-width="2" />
                        <circle cx="85" cy="72" r="5" fill="none" stroke="var(--accent-color)" stroke-width="1.5" class="bp-pulse" />
                        <path d="M 175 107 A 55 55 0 0 1 120 162" stroke="var(--accent-secondary)" stroke-width="1.5" stroke-dasharray="4 4" fill="none" class="bp-rotate-reverse" />
                    </g>
                    <g transform="translate(290, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">HSL DETECT DETAILS</text>
                        <line x1="15" y1="32" x2="265" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <rect x="15" y="45" width="45" height="45" rx="4" fill="var(--accent-color)" stroke="#fff" stroke-width="1" class="bp-pulse" />
                        <g transform="translate(75, 45)" fill="#bbb" font-family="Courier, monospace" font-size="9">
                            <text x="0" y="10" font-weight="bold" fill="#fff">HEX CODE: #00F0FF (CYAN)</text>
                            <text x="0" y="24">HUE: ..... 180 DEG (CYAN)</text>
                            <text x="0" y="38">SAT: ..... 100%</text>
                            <text x="0" y="52">LIGHT: ... 50%</text>
                        </g>
                        <text x="15" y="125" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold">RGB DISTRIBUTION GAUGE</text>
                        <line x1="15" y1="132" x2="265" y2="132" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(15, 145)" font-family="Courier, monospace" font-size="8" fill="#999">
                            <text x="0" y="10">R: 0</text>
                            <rect x="40" y="2" width="200" height="8" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                            <rect x="40" y="2" width="5" height="8" rx="2" fill="red" />
                            <text x="0" y="25">G: 240</text>
                            <rect x="40" y="17" width="200" height="8" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                            <rect x="40" y="17" width="188" height="8" rx="2" fill="green" />
                            <text x="0" y="40">B: 255</text>
                            <rect x="40" y="32" width="200" height="8" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                            <rect x="40" y="32" width="200" height="8" rx="2" fill="blue" />
                        </g>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">COLOR_MAPPER_VERSION: 1.0.4 // MATCH_CONF: 99.42%</text>
                </svg>
                `;
            }
        } else if (projectId === 'spaswab') {
            if (slideIndex === 0) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">TELEMETRY_DASH // BIN_STATE_MONITOR</text>
                    <g transform="translate(30, 80)">
                        <rect x="0" y="0" width="250" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <g transform="translate(65, 80)">
                            <circle cx="0" cy="0" r="45" stroke="rgba(0,240,255,0.15)" stroke-width="6" fill="none" />
                            <path d="M -31.8 31.8 A 45 45 0 1 1 31.8 31.8" stroke="var(--accent-color)" stroke-width="6" fill="none" stroke-dasharray="200" stroke-dashoffset="35" />
                            <line x1="0" y1="0" x2="-10" y2="-32" stroke="var(--accent-color)" stroke-width="3.5" stroke-linecap="round" />
                            <circle cx="0" cy="0" r="5" fill="#fff" />
                            <text x="0" y="62" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold" text-anchor="middle">BATTERY 84%</text>
                        </g>
                        <g transform="translate(185, 80)">
                            <circle cx="0" cy="0" r="45" stroke="rgba(0,240,255,0.15)" stroke-width="6" fill="none" />
                            <path d="M -31.8 31.8 A 45 45 0 1 1 31.8 31.8" stroke="var(--accent-secondary)" stroke-width="6" fill="none" stroke-dasharray="200" stroke-dashoffset="65" />
                            <line x1="0" y1="0" x2="25" y2="-20" stroke="var(--accent-secondary)" stroke-width="3.5" stroke-linecap="round" />
                            <circle cx="0" cy="0" r="5" fill="#fff" />
                            <text x="0" y="62" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold" text-anchor="middle">SOLAR 18.2V</text>
                        </g>
                        <line x1="20" y1="160" x2="230" y2="160" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="182" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">SOLAR_CELL_STATUS: GENERATING</text>
                    </g>
                    <g transform="translate(300, 80)">
                        <rect x="0" y="0" width="270" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">WASTE VOL FILL MATRIX</text>
                        <line x1="15" y1="32" x2="255" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(25, 50)">
                            <rect x="0" y="0" width="35" height="120" rx="3" stroke="rgba(0,240,255,0.3)" fill="none" />
                            <rect x="3" y="66" width="29" height="51" rx="2" fill="var(--accent-color)" class="bp-pulse" />
                            <line x1="-5" y1="0" x2="0" y2="0" stroke="rgba(0,240,255,0.5)" />
                            <line x1="-5" y1="30" x2="0" y2="30" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="60" x2="0" y2="60" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="90" x2="0" y2="90" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="120" x2="0" y2="120" stroke="rgba(0,240,255,0.5)" />
                            <text x="-12" y="5" font-family="Courier, monospace" font-size="8" fill="#888">F</text>
                            <text x="-12" y="123" font-family="Courier, monospace" font-size="8" fill="#888">E</text>
                        </g>
                        <g transform="translate(85, 50)" font-family="Courier, monospace" font-size="9" fill="#bbb">
                            <text x="0" y="15" font-weight="bold" fill="var(--accent-color)">FILL STATUS: 45.4%</text>
                            <text x="0" y="32">DEPTH RADAR: OK</text>
                            <circle cx="5" cy="55" r="4" fill="green" />
                            <text x="18" y="59">WIFI: CONNECTED</text>
                            <circle cx="5" cy="75" r="4" fill="green" />
                            <text x="18" y="79">LID STATE: LOCKED</text>
                            <circle cx="5" cy="95" r="4" fill="green" />
                            <text x="18" y="99">GPS STACK: SYNC</text>
                            <circle cx="5" cy="115" r="4" fill="green" />
                            <text x="18" y="119">ARDUINO CORE: OK</text>
                        </g>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">SYSTEM_UPTIME: 142.4 HRS // GPS_COORDS: 7.0736 N, 125.5683 E</text>
                </svg>
                `;
            } else if (slideIndex === 1) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">SERVO_PROXIMITY_DYNAMICS // REAL_TIME_LOG</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="310" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">TRIGGER EVENT OSCILLOSCOPE</text>
                        <line x1="15" y1="32" x2="295" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(20, 50)" stroke="rgba(0,240,255,0.15)" stroke-width="1">
                            <line x1="0" y1="20" x2="260" y2="20" />
                            <line x1="0" y1="50" x2="260" y2="50" />
                            <line x1="0" y1="80" x2="260" y2="80" />
                            <line x1="0" y1="110" x2="260" y2="110" />
                            <line x1="0" y1="0" x2="0" y2="120" stroke="rgba(0,240,255,0.3)" stroke-width="1" />
                            <line x1="0" y1="120" x2="260" y2="120" stroke="rgba(0,240,255,0.3)" stroke-width="1" />
                            <path d="M 0 10 L 40 10 L 60 110 L 120 110 L 140 10 L 260 10" stroke="var(--accent-color)" stroke-width="2" fill="none" class="bp-dash-draw" />
                            <path d="M 0 110 L 50 110 L 55 10 L 125 10 L 130 110 L 260 110" stroke="var(--accent-secondary)" stroke-width="1.8" fill="none" />
                            <text x="10" y="-8" font-family="Courier, monospace" font-size="7" fill="var(--accent-color)" stroke="none">PROXIMITY_RADAR</text>
                            <text x="130" y="-8" font-family="Courier, monospace" font-size="7" fill="var(--accent-secondary)" stroke="none">SERVO_ANGLE_TRIP</text>
                        </g>
                    </g>
                    <g transform="translate(360, 75)">
                        <rect x="0" y="0" width="210" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">TRIGGER LOGS</text>
                        <line x1="15" y1="32" x2="195" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(15, 45)" font-family="Courier, monospace" font-size="8" fill="#888">
                            <text x="0" y="10" fill="var(--accent-color)">> 08:14:02.103</text>
                            <text x="0" y="21">  RADAR: 10CM APPROACH</text>
                            <text x="0" y="38" fill="var(--accent-color)">> 08:14:02.245</text>
                            <text x="0" y="49" fill="var(--accent-secondary)">  SERVO_TRIP: OPEN (90D)</text>
                            <text x="0" y="66" fill="var(--accent-color)">> 08:14:02.260</text>
                            <text x="0" y="77">  LED_INDICATOR: PULSING</text>
                            <text x="0" y="94" fill="var(--accent-color)">> 08:14:07.412</text>
                            <text x="0" y="105">  RADAR: CLEAR (60CM)</text>
                            <text x="0" y="122" fill="var(--accent-color)">> 08:14:08.500</text>
                            <text x="0" y="133" fill="var(--accent-secondary)">  SERVO_TRIP: CLOSE (0D)</text>
                            <text x="0" y="150" fill="var(--accent-color)">> 08:14:08.610</text>
                            <text x="0" y="161">  SYSTEM: STANDBY_ON</text>
                        </g>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">HC-SR04_MODULE: ONLINE // SG90_SERVO: CALIBRATED</text>
                </svg>
                `;
            }
        }
        return '';
    }

    // Projects Database
    const projectData = {
        phishvote: {
            title: "PhishVote",
            role: "Lead Researcher",
            year: "2026",
            desc: "An Adaptive Soft-Voting Ensemble of Tree-Based Classifiers for Phishing Website Detection. This research paper proposes an ensemble model combining multiple optimized tree-based machine learning classifiers (Random Forest, XGBoost, LightGBM) to detect phishing URLs with high accuracy based on lexical and structural features.",
            tags: ["Machine Learning", "Python", "Scikit-Learn", "Ensemble Methods", "Research"],
            paperLink: "https://drive.google.com/file/d/1_wBtc5cBbFXaeuClkTXrShdQQcsFwYkr/view?usp=sharing",
            codeLink: "https://github.com/specertorduke/PhishVote/tree/main",
            slides: [
                {
                    imgSrc: "assets/img/PhishVote images/PV1.jpg",
                    caption: "Serving as a real-time testing environment for the proposed model, the extension instantly parses website features to validate the legitimacy of benign URLs with high confidence.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/PhishVote images/PV2.jpg",
                    caption: "Highlighting the advantage of soft-voting over binary classification, the extension alerts users to borderline threats where the ensemble detects suspicious features just below the definitive phishing threshold.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/PhishVote images/PV3.jpg",
                    caption: "Demonstrating the practical application of the research, the extension proactively warns users when the adaptive soft-voting ensemble confidently classifies a URL as a phishing threat.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/PhishVote images/PV4.jpg",
                    caption: "",
                    overlayText: ""
                }
            ]
        },
        furrytails: {
            title: "FurryTails",
            role: "Lead Developer",
            year: "2025",
            desc: "An Online Pet Grooming and Boarding Reservation System designed to automate reservation workflows and optimize user experience. Features real-time client booking validation, pricing calculations based on pet characteristics, and a visual room/staff allocation grid board for administrators.",
            tags: ["PHP / Laravel", "MySQL", "JavaScript", "HTML/CSS", "Bootstrap"],
            slides: [
                {
                    caption: "Client Booking Panel: Real-time date scheduling, service item checklist, and Large-Breed pricing surcharge calculations.",
                    overlayText: "MODULE: BOOKING_SCHEMATIC\\nRESOLVING APPOINTMENT TIMESLOTS...\\nPRICING ENGINES OUT: PASS"
                },
                {
                    caption: "Admin Allocation Grid: Visual grid scheduler showing booked room/staff channels, time slot allocations, and occupancy level metrics.",
                    overlayText: "MODULE: GRID_SCHEDULER_MATRIX\\nOCCUPANCY COUNT: 75% OF SYSTEM LIMIT\\nALLOC_CHECK: SUCCESS"
                },
                {
                    caption: "Pet Health Profiler: Complete digital chart profiling patient details, immunisation records, and highlighted allergen flags.",
                    overlayText: "MODULE: HEALTH_PROFILER_STACK\\nWARNING: PENICILLIN DETECTED\\nAUTO_VACCINE_VALIDATION: PASS"
                }
            ]
        },
        insightful: {
            title: "INSIGHTFUL",
            role: "Lead Developer",
            year: "2024",
            desc: "Real-Time Object Detection, Text-Reader, and Color Recognition Prototype specifically developed for visually impaired assistance. Utilises light weight computer vision architectures and text-to-speech audio feedback systems to map environment assets into audio logs.",
            tags: ["Python", "OpenCV", "TensorFlow", "JavaScript", "Web Speech API"],
            codeLink: "https://github.com/specertorduke/insightful",
            slides: [
                {
                    caption: "Webcam Vision Viewport: Real-time object recognition mapping dashed target anchors and bounding coordinates to audio feeds.",
                    overlayText: "MODULE: CNN_OBJECT_DETECT_STK\\nCLASS: CUP (0.98), KEYBOARD (0.91)\\nVISION_FPS: 30.0HZ // SYSTEM: STANDBY"
                },
                {
                    caption: "OCR Text Extraction Frame: Digital reading matrix highlighting target sentences and parsing characters directly to Text-To-Speech (TTS) audio synthesizer.",
                    overlayText: "MODULE: OCR_TESSERACT_MATRIX\\nPARSE_STRING: 'WARNING: STEEP ELEVATION'\\nTTS_SYNTH: SOUND_OUT: ACTIVE"
                },
                {
                    caption: "HSL Color Analyzer: Polar radial spectrum selector targeting pixel coordinates and outputting precise HSL ranges with matching tag profiles.",
                    overlayText: "MODULE: COLOR_HEX_SWATCH\\nCOLOR DETECTED: #00F0FF (CYAN)\\nH:180 S:100% L:50% // CONF: 99.4%"
                }
            ]
        },
        spaswab: {
            title: "SPASWAB",
            role: "Programmer",
            year: "2023",
            desc: "Solar-Powered Arduino-Based Smart Waste Bin incorporating IoT systems and hardware microcontroller logic. Detects hand proximity using ultrasonic sensors, drives servo motors for automated lids, and monitors waste level telemetry sent to a central log dashboard.",
            tags: ["Arduino (C++)", "IoT Sensors", "SG90 Servo", "Ultrasonic Radar", "Fritzing"],
            slides: [
                {
                    caption: "System Telemetry Gauge: Analog-styled dial gauges monitoring real-time battery storage percentages, solar grid input voltages, and vertical fill column capacities.",
                    overlayText: "MODULE: TELEMETRY_DASH_MCU\\nBATTERY: 84% // SOLAR IN: 18.2V\\nBIN FILL PERCENT: 45.4% // GPS: LOCK"
                },
                {
                    caption: "Proximity Servo Dynamics: Oscilloscope tracking real-time hand-to-lid distance curve fluctuations and automated servo motor open/close intervals.",
                    overlayText: "MODULE: SERVO_PROXIMITY_OSCILLO\\nEVENT_FLAG: PROX_TRIGGER_90D_OPEN\\nSG90_TIMEOUT_CLOSE: ARMED"
                }
            ]
        }
    };

    // 3D Carousel Engine Setup
    const cards = document.querySelectorAll('.carousel-card');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let activeIndex = 1; // Default to FurryTails (second card)

    // Render Carousel Dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        cards.forEach((card, idx) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${idx === activeIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                activeIndex = idx;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function updateCarousel() {
        const isMobile = window.innerWidth <= 768;

        // Update active dot
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
            if (idx === activeIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        cards.forEach((card, idx) => {
            card.classList.remove('active');

            if (isMobile) {
                // Remove inline transforms to let mobile CSS flex/scroll snap work cleanly
                gsap.killTweensOf(card);
                gsap.set(card, {
                    x: 0,
                    xPercent: 0,
                    yPercent: 0,
                    scale: 1,
                    rotationY: 0,
                    z: 0,
                    opacity: 1,
                    filter: 'none',
                    clearProps: "all"
                });
                return;
            }

            // Calculations for 3D depth spacing
            const diff = idx - activeIndex;

            let x = 0;
            let scale = 0.8;
            let rotationY = 0;
            let z = -200;
            let opacity = 0.6;
            let zIndex = 5;
            let filter = 'blur(2px)';

            if (diff === 0) {
                card.classList.add('active');
                x = 0;
                scale = 1.05;
                rotationY = 0;
                z = 0;
                opacity = 1;
                zIndex = 10;
                filter = 'blur(0px)';
            } else if (diff === -1) {
                x = -320;
                scale = 0.82;
                rotationY = 32;
                z = -150;
                opacity = 0.65;
                zIndex = 8;
                filter = 'blur(1.5px)';
            } else if (diff === 1) {
                x = 320;
                scale = 0.82;
                rotationY = -32;
                z = -150;
                opacity = 0.65;
                zIndex = 8;
                filter = 'blur(1.5px)';
            } else if (diff < -1) {
                x = -580;
                scale = 0.68;
                rotationY = 45;
                z = -300;
                opacity = 0.25;
                zIndex = 4;
                filter = 'blur(3px)';
            } else if (diff > 1) {
                x = 580;
                scale = 0.68;
                rotationY = -45;
                z = -300;
                opacity = 0.25;
                zIndex = 4;
                filter = 'blur(3px)';
            }

            // Animate using GSAP
            gsap.to(card, {
                x: x,
                scale: scale,
                rotationY: rotationY,
                z: z,
                opacity: opacity,
                filter: filter,
                duration: 0.6,
                ease: "power2.out",
                overwrite: "auto",
                onStart: () => {
                    card.style.zIndex = zIndex;
                }
            });
        });
    }

    // Carousel Navigation Handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            activeIndex = (activeIndex - 1 + cards.length) % cards.length;
            updateCarousel();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            activeIndex = (activeIndex + 1) % cards.length;
            updateCarousel();
        });
    }

    // Direct Clicks on side cards to advance, or active card to explore
    cards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
            if (window.innerWidth > 768) {
                if (idx !== activeIndex) {
                    e.preventDefault();
                    e.stopPropagation();
                    activeIndex = idx;
                    updateCarousel();
                } else {
                    handleProjectClick(card.getAttribute('data-project-id'));
                }
            } else {
                handleProjectClick(card.getAttribute('data-project-id'));
            }
        });
    });

    // Drag/Swipe Interactivity on Desktop Viewport
    let startX = 0;
    let isDragging = false;
    const carouselViewport = document.querySelector('.projects-carousel');

    if (carouselViewport) {
        carouselViewport.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            startX = e.clientX;
            isDragging = true;
        });

        carouselViewport.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diffX = e.clientX - startX;
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) {
                    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
                } else {
                    activeIndex = (activeIndex + 1) % cards.length;
                }
                updateCarousel();
                isDragging = false;
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch swipe fallback
        carouselViewport.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) return;
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        carouselViewport.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const diffX = e.touches[0].clientX - startX;
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) {
                    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
                } else {
                    activeIndex = (activeIndex + 1) % cards.length;
                }
                updateCarousel();
                isDragging = false;
            }
        });

        carouselViewport.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // Project click routing
    function handleProjectClick(projectId) {
        openProjectPortal(projectId);
    }

    // Portal Interactive Controls
    const portal = document.getElementById('project-portal');
    const closeBtn = document.getElementById('portal-close-btn');
    const overlay = document.querySelector('.portal-overlay');

    let currentProjectId = '';
    let currentSlideIndex = 0;

    function openProjectPortal(projectId) {
        const data = projectData[projectId];
        if (!data) return;

        currentProjectId = projectId;
        currentSlideIndex = 0;

        // Populate text details
        const titleElem = document.getElementById('portal-title');
        titleElem.textContent = data.title;

        // Dynamically scale down font size for longer titles to prevent overflow/cutting
        if (data.title.length >= 9) {
            titleElem.style.fontSize = '2.0rem';
        } else if (data.title.length > 7) {
            titleElem.style.fontSize = '2.2rem';
        } else {
            titleElem.style.fontSize = '3.0rem';
        }
        document.getElementById('portal-meta-role').textContent = data.role;
        document.getElementById('portal-meta-year').textContent = data.year;
        document.getElementById('portal-desc').textContent = data.desc;

        // Populate tags
        const tagsContainer = document.getElementById('portal-tags');
        tagsContainer.innerHTML = '';
        data.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag hover-target';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });

        // Populate links
        const actionsContainer = document.getElementById('portal-actions');
        actionsContainer.innerHTML = '';
        if (data.codeLink || data.paperLink) {
            let actionsHTML = '<h3>Project Links</h3><div style="display: flex; flex-wrap: wrap; gap: 15px;">';
            if (data.paperLink) {
                actionsHTML += `
                    <a href="${data.paperLink}" target="_blank" class="portal-btn hover-target">
                        <i class="fa-solid fa-file-pdf"></i> Read Research Paper
                    </a>
                `;
            }
            if (data.codeLink) {
                actionsHTML += `
                    <a href="${data.codeLink}" target="_blank" class="portal-btn hover-target">
                        <i class="fa-brands fa-github"></i> View Repository
                    </a>
                `;
            }
            actionsHTML += '</div>';
            actionsContainer.innerHTML = actionsHTML;
        }

        // Populate slideshow tracks
        const track = document.getElementById('slideshow-track');
        track.innerHTML = '';

        data.slides.forEach((slide, idx) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = `slideshow-slide ${idx === 0 ? 'active' : ''}`;

            let mediaContent = '';
            if (slide.imgSrc) {
                mediaContent = `<img src="${slide.imgSrc}" alt="${slide.caption}" class="portal-slide-img" />`;
            } else {
                mediaContent = getBlueprintSVG(projectId, idx);
            }

            const slideHTML = `
                <div class="blueprint-mockup">
                    <div class="blueprint-grid"></div>
                    <div class="blueprint-scanline"></div>
                    ${mediaContent}
                    <div class="blueprint-overlay">${slide.overlayText.replace(/\\n/g, '<br>')}</div>
                </div>
                <div class="slideshow-caption">${slide.caption}</div>
            `;

            slideDiv.innerHTML = slideHTML;
            track.appendChild(slideDiv);
        });

        // Populate dots
        const pagination = document.getElementById('slideshow-pagination');
        pagination.innerHTML = '';
        data.slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `slideshow-dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                setSlide(idx);
            });
            pagination.appendChild(dot);
        });

        // Adjust control layouts
        updateSlideshowControlsVisibility(data.slides.length);

        // Trigger opening
        portal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('portal-open');
    }

    function updateSlideshowControlsVisibility(slideCount) {
        const prevSlideBtn = document.getElementById('prev-slide');
        const nextSlideBtn = document.getElementById('next-slide');
        const pagination = document.getElementById('slideshow-pagination');

        if (slideCount <= 1) {
            if (prevSlideBtn) prevSlideBtn.style.display = 'none';
            if (nextSlideBtn) nextSlideBtn.style.display = 'none';
            if (pagination) pagination.style.display = 'none';
        } else {
            if (prevSlideBtn) prevSlideBtn.style.display = 'flex';
            if (nextSlideBtn) nextSlideBtn.style.display = 'flex';
            if (pagination) pagination.style.display = 'flex';
        }
    }

    function setSlide(index) {
        const slides = document.querySelectorAll('.slideshow-slide');
        const dots = document.querySelectorAll('.slideshow-dot');
        if (index < 0 || index >= slides.length) return;

        currentSlideIndex = index;

        slides.forEach((slide, idx) => {
            if (idx === currentSlideIndex) slide.classList.add('active');
            else slide.classList.remove('active');
        });

        dots.forEach((dot, idx) => {
            if (idx === currentSlideIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    // Bind slide navigation listeners once
    const prevSlideBtn = document.getElementById('prev-slide');
    const nextSlideBtn = document.getElementById('next-slide');

    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            const slides = document.querySelectorAll('.slideshow-slide');
            if (slides.length <= 1) return;
            const newIdx = (currentSlideIndex - 1 + slides.length) % slides.length;
            setSlide(newIdx);
        });
    }

    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            const slides = document.querySelectorAll('.slideshow-slide');
            if (slides.length <= 1) return;
            const newIdx = (currentSlideIndex + 1) % slides.length;
            setSlide(newIdx);
        });
    }

    function closePortal() {
        portal.classList.remove('active');
        document.body.style.overflow = '';
        document.body.classList.remove('portal-open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closePortal);
    if (overlay) overlay.addEventListener('click', closePortal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && portal.classList.contains('active')) {
            closePortal();
        }
    });

    // Initialize state & listen for scaling changes
    updateCarousel();
    window.addEventListener('resize', updateCarousel);

});
