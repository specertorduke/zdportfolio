// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 1. Custom Cursor setup
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button');

    // Only apply custom cursor on non-touch devices
    if(window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Move inner cursor instantly
            gsap.to(cursor, {
                x: mouseX,
                y: mouseY,
                duration: 0.1,
                ease: "power2.out"
            });
        });

        // Smooth follow for outer ring
        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            
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
        elem.addEventListener('mousemove', function(e) {
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
        
        elem.addEventListener('mouseleave', function() {
            gsap.to(this, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // 3. Initial Load Animations
    const tl = gsap.timeline();
    
    tl.fromTo(".nav-logo, .nav-links a", 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
    ).fromTo(".hero .reveal-text > *", 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power4.out" },
        "-=0.5"
    ).fromTo(".scroll-indicator",
        { opacity: 0 },
        { opacity: 0.5, duration: 1 },
        "-=0.5"
    );

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

});
