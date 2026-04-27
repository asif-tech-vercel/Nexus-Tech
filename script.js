document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Custom Cursor Logic ---
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    if (window.innerWidth > 1024) {
        let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            follower.style.left = `${followerX}px`;
            follower.style.top = `${followerY}px`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        document.querySelectorAll('a, button, input, .faq-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                follower.style.width = '70px'; follower.style.height = '70px';
                follower.style.backgroundColor = 'rgba(255,255,255,0.05)';
                follower.style.borderColor = '#6366f1';
            });
            el.addEventListener('mouseleave', () => {
                follower.style.width = '46px'; follower.style.height = '46px';
                follower.style.backgroundColor = 'transparent';
                follower.style.borderColor = 'rgba(255,255,255,0.3)';
            });
        });
    }

    // --- 2. Hamburger Menu Logic ---
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu');
    const menu = document.getElementById('fullscreen-menu');
    const menuLinks = document.querySelectorAll('.menu-link');

    function toggleMenu(show) {
        if (show) {
            menu.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
        } else {
            menu.classList.remove('menu-open');
            document.body.style.overflow = '';
        }
    }
    
    menuBtn.addEventListener('click', () => toggleMenu(true));
    closeBtn.addEventListener('click', () => toggleMenu(false));
    
    // Close smoothly on link click
    menuLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // --- 3. Sticky Nav ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-dark/90', 'py-3'); navbar.classList.remove('bg-dark/70', 'py-5');
        } else {
            navbar.classList.add('bg-dark/70', 'py-5'); navbar.classList.remove('bg-dark/90', 'py-3');
        }
    });

    // --- 4. FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all others
            faqItems.forEach(el => el.classList.remove('active'));
            
            // Open clicked if it wasn't already open
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- 5. Intersection Observers (Scroll Effects) ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { rootMargin: '0px', threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Timeline trigger
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
            else entry.target.classList.remove('active'); 
        });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.timeline-step').forEach(el => timelineObserver.observe(el));

    // --- 6. 3D Card Hover ---
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const centerX = rect.width / 2; const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -12; 
            const rotateY = ((x - centerX) / centerX) * 12;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        card.addEventListener('mouseenter', () => card.style.transition = 'none');
    });

    // --- 7. Lead Capture Form Submission ---
    const form = document.getElementById("ghl-form");
    const submitBtn = document.getElementById("submit-btn");
    const formMessage = document.getElementById("form-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
        };

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i class="ph-bold ph-spinner animate-spin text-2xl"></i><span>Booking Securely...</span>`;
        submitBtn.disabled = true;

        try {
            // ---> PUT YOUR n8n/MAKE WEBHOOK URL HERE <---
            const webhookUrl = "/api/submit";

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                form.reset();
                formMessage.textContent = "Success! An architect will reach out shortly to confirm your time.";
                formMessage.className = "text-center text-lg font-bold mt-6 p-6 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 block shadow-lg";
            } else throw new Error("Submission failed");
        } catch (error) {
            console.error(error);
            formMessage.textContent = "Server Error. Please try again later.";
            formMessage.className = "text-center text-lg font-bold mt-6 p-6 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 block shadow-lg";
        } finally {
            setTimeout(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                setTimeout(() => formMessage.classList.add("hidden"), 6000);
            }, 1000);
        }
    });
});