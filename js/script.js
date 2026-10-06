
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // Check if the user prefers reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Check if device supports hover/pointer (to avoid running tilt logic on touch devices)
  const isTouchDevice = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ==========================================================================
     1. MOBILE NAVIGATION TOGGLE & ACCESSIBILITY
     ========================================================================== */
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (menuToggle && navMenu) {
    // Open/Close toggle handler
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.classList.toggle("active", isOpen);
    });

    // Close menu when any navigation link is clicked
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("open")) {
          navMenu.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.classList.remove("active");
        }
      });
    });

    // Close menu when pressing Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("active");
        menuToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. STICKY NAVBAR ON SCROLL
     ========================================================================== */
  const header = document.getElementById("header");

  const handleHeaderScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Run on initial load

  /* ==========================================================================
     3. ACTIVE NAVIGATION INDICATOR (INTERSECTION OBSERVER)
     ========================================================================== */
  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Trigger when section passes upper viewport
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (href === `#${currentId}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ==========================================================================
     4. SMOOTH SCROLLING FOR INTERNAL ANCHORS
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  });

  /* ==========================================================================
     5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    ".about-content, .highlight-card, .skill-category-card, .project-card, .resume-card, .contact-layout"
  );

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    revealElements.forEach((el) => {
      el.classList.add("fade-in");
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // Unobserve once animated
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // If IntersectionObserver is unsupported or reduced motion is requested
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* ==========================================================================
     6. SKILL BAR ANIMATIONS (TRIGGER ONCE WHEN VISIBLE)
     ========================================================================== */
  const skillBars = document.querySelectorAll(".skill-progress-bar");

  if ("IntersectionObserver" in window && skillBars.length > 0) {
    const skillObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const fill = bar.querySelector(".skill-progress-fill");

            if (fill) {
              // Read current level from data-level or keep default percentage
              const currentLevel = bar.getAttribute("data-level");
              let targetWidth = "80%"; // Default balanced presentation

              // Respect custom progress levels if specified
              if (currentLevel === "html") targetWidth = "90%";
              else if (currentLevel === "css") targetWidth = "85%";
              else if (currentLevel === "javascript") targetWidth = "75%";
              else if (currentLevel === "cpp") targetWidth = "80%";
              else if (currentLevel === "dsa") targetWidth = "70%";
              else if (currentLevel === "oop") targetWidth = "80%";
              else if (currentLevel === "database") targetWidth = "75%";
              else if (currentLevel === "graphic-design") targetWidth = "85%";
              else if (currentLevel === "canva") targetWidth = "90%";

              fill.style.width = prefersReducedMotion ? targetWidth : "0%";
              if (!prefersReducedMotion) {
                // Trigger smooth width transition on next animation frame
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    fill.style.width = targetWidth;
                  }, 100);
                });
              }
            }
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.25 }
    );

    skillBars.forEach((bar) => skillObserver.observe(bar));
  }

  /* ==========================================================================
     7. 3D MOUSE PERSPECTIVE (HERO PROFILE CONTAINER & FLOATING DECOR)
     ========================================================================== */
  const heroSection = document.getElementById("home");
  const profileContainer = document.querySelector(".profile-image-container");
  const floatingDecor = document.querySelector(".decor-3");

  if (heroSection && profileContainer && !isTouchDevice && !prefersReducedMotion) {
    let ticking = false;

    heroSection.addEventListener("mousemove", (e) => {
      if (ticking) return;

      window.requestAnimationFrame(() => {
        const rect = heroSection.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate offset percentage from center (-0.5 to 0.5)
        const xOffset = mouseX / rect.width - 0.5;
        const yOffset = mouseY / rect.height - 0.5;

        // Subtle rotation angles (maximum ~8 degrees)
        const rotateY = xOffset * 14;
        const rotateX = -yOffset * 14;

        profileContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(35px)`;

        if (floatingDecor) {
          floatingDecor.style.transform = `translate(${xOffset * 25}px, ${yOffset * 25}px) rotate(${xOffset * 20}deg)`;
        }

        ticking = false;
      });

      ticking = true;
    });

    // Reset when mouse leaves hero area
    heroSection.addEventListener("mouseleave", () => {
      profileContainer.style.transform = "rotateY(-8deg) rotateX(6deg) translateZ(30px)";
      if (floatingDecor) {
        floatingDecor.style.transform = "rotate(25deg)";
      }
    });
  }

  /* ==========================================================================
     8. 3D PROJECT CARD TILT EFFECT
     ========================================================================== */
  const projectCards = document.querySelectorAll(".project-card");

  if (!isTouchDevice && !prefersReducedMotion && projectCards.length > 0) {
    projectCards.forEach((card) => {
      let cardTicking = false;

      card.addEventListener("mousemove", (e) => {
        if (cardTicking) return;

        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const cardX = e.clientX - rect.left;
          const cardY = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          // Gentle tilt angle (max ±5 degrees)
          const rotateX = -((cardY - centerY) / centerY) * 5;
          const rotateY = ((cardX - centerX) / centerX) * 5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
          cardTicking = false;
        });

        cardTicking = true;
      });

      // Smooth reset on cursor exit
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      });
    });
  }

  /* ==========================================================================
     9. BACK-TO-TOP BUTTON
     ========================================================================== */
  const backToTopBtn = document.getElementById("back-to-top");

  const handleBackToTopVisibility = () => {
    if (!backToTopBtn) return;
    if (window.scrollY > 400) {
      backToTopBtn.style.opacity = "1";
      backToTopBtn.style.pointerEvents = "auto";
    } else {
      backToTopBtn.style.opacity = "0.6";
    }
  };

  window.addEventListener("scroll", handleBackToTopVisibility, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ==========================================================================
     10. ACCESSIBLE CONTACT FORM VALIDATION & FRONT-END NOTICE
     ========================================================================== */
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    // Container for user feedback message
    let statusMessage = document.getElementById("form-status-message");

    if (!statusMessage) {
      statusMessage = document.createElement("div");
      statusMessage.id = "form-status-message";
      statusMessage.setAttribute("role", "alert");
      statusMessage.setAttribute("aria-live", "polite");
      statusMessage.style.display = "none";
      statusMessage.style.marginTop = "16px";
      statusMessage.style.padding = "14px";
      statusMessage.style.borderRadius = "6px";
      statusMessage.style.fontSize = "0.92rem";
      statusMessage.style.lineHeight = "1.5";
      contactForm.appendChild(statusMessage);
    }

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("contact-name");
      const emailInput = document.getElementById("contact-email");
      const subjectInput = document.getElementById("contact-subject");
      const messageInput = document.getElementById("contact-message");

      const nameVal = nameInput ? nameInput.value.trim() : "";
      const emailVal = emailInput ? emailInput.value.trim() : "";
      const subjectVal = subjectInput ? subjectInput.value.trim() : "";
      const messageVal = messageInput ? messageInput.value.trim() : "";

      // Simple regex for valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Validation checks
      if (!nameVal) {
        showFormAlert("Please provide your name.", "error");
        if (nameInput) nameInput.focus();
        return;
      }

      if (!emailVal || !emailRegex.test(emailVal)) {
        showFormAlert("Please enter a valid email address.", "error");
        if (emailInput) emailInput.focus();
        return;
      }

      if (!subjectVal) {
        showFormAlert("Please enter a subject for your message.", "error");
        if (subjectInput) subjectInput.focus();
        return;
      }

      if (!messageVal || messageVal.length < 10) {
        showFormAlert("Please write a message with at least 10 characters.", "error");
        if (messageInput) messageInput.focus();
        return;
      }

      // Success state (Front-end only notification)
      showFormAlert(
        `Thank you, ${nameVal}! Your message has been prepared. Please note: This portfolio is currently operating in front-end preview mode without an active email backend, so your message was not transmitted externally. Feel free to contact me directly at the email listed on this page.`,
        "success"
      );

      // Reset form fields
      contactForm.reset();
    });

    function showFormAlert(message, type) {
      statusMessage.textContent = message;
      statusMessage.style.display = "block";

      if (type === "error") {
        statusMessage.style.backgroundColor = "rgba(180, 40, 40, 0.2)";
        statusMessage.style.border = "1px solid rgba(220, 60, 60, 0.4)";
        statusMessage.style.color = "#ff9b9b";
      } else {
        statusMessage.style.backgroundColor = "rgba(40, 122, 76, 0.25)";
        statusMessage.style.border = "1px solid rgba(78, 209, 135, 0.4)";
        statusMessage.style.color = "#e6ede8";
      }
    }
  }

  /* ==========================================================================
     11. RESUME LINKS VERIFICATION
     ========================================================================== */
  const resumeLinks = document.querySelectorAll('a[href*="resume"]');
  resumeLinks.forEach((link) => {
    // Ensure all target buttons point accurately to the designated assets path
    if (link.getAttribute("href") === "#resume" || link.classList.contains("nav-link")) {
      return; // Skip section jump anchors
    }
    if (!link.getAttribute("href") || link.getAttribute("href") === "#") {
      link.setAttribute("href", "assets/resume.pdf");
    }
  });
});
