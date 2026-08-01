import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createMagneticButtons, createPointerDepth } from "./motion-effects.js";

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add("gsap-ready");

const video = document.querySelector("[data-background-video]");

if (video) {
  video.addEventListener("error", () => {
    document.documentElement.classList.add("video-failed");
  });
}

function initializeBackgroundVideo() {
  if (!video) return;

  video.defaultMuted = true;
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.playbackRate = 1;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("disablepictureinpicture", "");

  const playVideo = () => {
    if (document.visibilityState === "hidden") return;

    video.play().catch(() => {
      document.removeEventListener("pointerdown", playVideo);
      document.addEventListener("pointerdown", playVideo, { once: true });
    });
  };

  if (video.readyState >= 2) playVideo();
  else video.addEventListener("canplay", playVideo, { once: true });

  video.addEventListener("pause", playVideo);
  window.addEventListener("pageshow", playVideo);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") playVideo();
  });
}

initializeBackgroundVideo();

function revealGroup(trigger, targets, options = {}) {
  const elements = gsap.utils.toArray(targets);
  if (!elements.length) return;

  gsap.from(elements, {
    autoAlpha: 0,
    y: options.y ?? 44,
    scale: options.scale ?? 1,
    duration: options.duration ?? 0.9,
    stagger: options.stagger ?? 0.09,
    ease: "power3.out",
    clearProps: "transform,opacity,visibility",
    scrollTrigger: {
      trigger,
      start: options.start ?? "top 82%",
      once: true
    }
  });
}

function createHeroIntro(isDesktop) {
  const introTargets = gsap.utils.toArray(
    ".nav-shell, .hero .eyebrow, .hero h1, .hero-subtext, .hero-actions .button, .hero-proof li"
  );
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

  timeline
    .from(".nav-shell", { autoAlpha: 0, y: -24, duration: 0.8 })
    .from(".hero .eyebrow", { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.4")
    .from(".hero h1", { autoAlpha: 0, y: 42, duration: 1.05 }, "-=0.38")
    .from(".hero-subtext", { autoAlpha: 0, y: 24, duration: 0.75 }, "-=0.62")
    .from(".hero-actions .button", {
      autoAlpha: 0,
      y: 20,
      duration: 0.65,
      stagger: 0.1
    }, "-=0.5")
    .from(".hero-proof li", {
      autoAlpha: 0,
      y: 18,
      duration: 0.58,
      stagger: 0.08
    }, "-=0.5");

  timeline.eventCallback("onComplete", () => {
    gsap.set(introTargets, { clearProps: "transform,opacity,visibility" });
  });

  if (!isDesktop) timeline.timeScale(1.25);
}

function createSectionMotion() {
  gsap.utils.toArray(".section-heading:not(.work-heading)").forEach((heading) => {
    revealGroup(heading, Array.from(heading.children), { y: 34, stagger: 0.08 });
  });

  [
    [".services-grid", ".services-grid .glass-card", { y: 58, scale: 0.985, stagger: 0.08 }],
    [".proof-grid", ".proof-grid .proof-feature", { y: 54, scale: 0.985, stagger: 0.1 }],
    [".timeline", ".timeline .timeline-item", { y: 42, stagger: 0.08 }],
    [".pricing-pillars", ".pricing-pillars span", { y: 20, stagger: 0.06 }],
    [".pricing-grid", ".pricing-grid .pricing-card", { y: 58, scale: 0.985, stagger: 0.09 }],
    [".faq-list", ".faq-list details", { y: 34, stagger: 0.07 }]
  ].forEach(([trigger, targets, options]) => revealGroup(trigger, targets, options));

  revealGroup(".contact-section", [".consultation-copy", ".consultation-form"], {
    y: 52,
    stagger: 0.16
  });

  gsap.to(".nav-shell", {
    backgroundColor: "rgba(16, 22, 22, 0.78)",
    borderColor: "rgba(255, 255, 255, 0.28)",
    duration: 0.35,
    ease: "power2.out",
    scrollTrigger: {
      trigger: document.body,
      start: "top -120",
      end: "bottom top",
      toggleActions: "play none none reverse"
    }
  });
}

function createCinematicMotion(isDesktop) {
  if (!isDesktop) return;

  gsap.utils.toArray(".page-section:not(.hero)").forEach((section) => {
    gsap.fromTo(section,
      {
        "--section-light": 0,
        "--section-light-y": "44px"
      },
      {
        "--section-light": 0.78,
        "--section-light-y": "0px",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          end: "center 42%",
          scrub: 0.8
        }
      }
    );
  });

  gsap.to(".hero-content", {
    yPercent: -8,
    autoAlpha: 0.58,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.9
    }
  });

  gsap.utils.toArray(".page-section:not(.hero):not(.work-section)").forEach((section) => {
    const heading = section.querySelector(".section-heading");
    if (!heading) return;

    gsap.fromTo(heading,
      { y: 16 },
      {
        y: -18,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.75
        }
      }
    );
  });
}

function createWorkMotion(isDesktop) {
  const section = document.querySelector(".work-section");
  const heading = document.querySelector(".work-heading");
  const cards = gsap.utils.toArray(".work-card");
  if (!section || !heading || !cards.length) return;

  if (isDesktop) {
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "selected-work-pin",
        trigger: section,
        start: "top top",
        end: "+=110%",
        scrub: 0.7,
        pin: true,
        anticipatePin: 1
      }
    });

    timeline
      .from(heading.children, {
        autoAlpha: 0,
        y: 46,
        stagger: 0.08,
        duration: 0.34,
        ease: "power2.out"
      })
      .from(cards, {
        autoAlpha: 0,
        y: 110,
        scale: 0.96,
        stagger: 0.12,
        duration: 0.58,
        ease: "power3.out"
      }, 0.08)
      .fromTo(cards[0], { xPercent: -2 }, { xPercent: 0, duration: 0.28 }, 0.28)
      .fromTo(cards[1], { xPercent: 2 }, { xPercent: 0, duration: 0.28 }, 0.28);
  } else {
    revealGroup(heading, Array.from(heading.children), { y: 34, stagger: 0.08 });
    revealGroup(".work-grid", cards, { y: 56, stagger: 0.12 });
  }

  if (!isDesktop) return;

  gsap.utils.toArray(".work-preview img").forEach((image) => {
    gsap.fromTo(image,
      { yPercent: -4, scale: 1.08 },
      {
        yPercent: 4,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: image.closest(".work-card"),
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6
        }
      }
    );
  });
}

const motion = gsap.matchMedia();

motion.add({
  desktop: "(min-width: 981px)",
  reduceMotion: "(prefers-reduced-motion: reduce)"
}, (context) => {
  const { desktop, reduceMotion } = context.conditions;

  if (reduceMotion) return;

  createHeroIntro(desktop);
  createSectionMotion();
  createCinematicMotion(desktop);
  createWorkMotion(desktop);
  const removePointerDepth = desktop
    ? createPointerDepth(
        gsap,
        ".services-grid .glass-card, .proof-grid .proof-feature, .pricing-grid .pricing-card",
        { maxRotation: 4.2, lift: -5, perspective: 1100 }
      )
    : () => {};
  const removeMagneticButtons = desktop
    ? createMagneticButtons(
        gsap,
        ".nav-cta, .button, .plan-link",
        { strength: 9 }
      )
    : () => {};

  requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => {
    removeMagneticButtons();
    removePointerDepth();
  };
});

const menuToggle = document.querySelector(".nav-menu-toggle");
const navMenu = document.querySelector("#primary-menu");
const navigationShell = document.querySelector(".nav-shell");
const mobileNavigationQuery = window.matchMedia("(max-width: 980px)");

function setMenu(open, { returnFocus = false } = {}) {
  if (!menuToggle || !navMenu) return;
  const shouldOpen = Boolean(open && mobileNavigationQuery.matches);

  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  navMenu.dataset.open = String(shouldOpen);
  navMenu.toggleAttribute("inert", mobileNavigationQuery.matches && !shouldOpen);
  document.body.classList.toggle("menu-open", shouldOpen);

  const label = menuToggle.querySelector(".sr-only");
  if (label) label.textContent = shouldOpen ? "Close navigation" : "Open navigation";

  if (!shouldOpen && returnFocus) menuToggle.focus();
}

if (menuToggle && navMenu) {
  setMenu(false);

  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false, { returnFocus: true });
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      navigationShell &&
      !navigationShell.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  mobileNavigationQuery.addEventListener("change", () => {
    setMenu(false);
  });
}

const form = document.querySelector(".consultation-form");
const formNote = document.querySelector(".form-note");
const packageSelect = form?.querySelector("select[name='package']");

document.querySelectorAll("[data-package]").forEach((link) => {
  link.addEventListener("click", () => {
    if (packageSelect) packageSelect.value = link.dataset.package;
    window.dataLayer?.push({ event: "package_selected", package: link.dataset.package });
  });
});

document.querySelectorAll("a[href='#contact']").forEach((link) => {
  link.addEventListener("click", () => {
    window.dataLayer?.push({ event: "contact_cta_clicked", label: link.textContent.trim() });
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) return;

    // Netlify captures this form in production. Keep local previews honest
    // instead of posting to a development server that cannot accept forms.
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      event.preventDefault();
      if (formNote) {
        formNote.textContent = "Preview mode: this request will submit after the site is deployed to Netlify.";
      }
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.querySelector("span")?.replaceChildren("Sending request…");
    }
    window.dataLayer?.push({ event: "strategy_call_submitted", package: packageSelect?.value });
  });
}

const testimonialsSection = document.querySelector(".testimonials-section");
const testimonialsGrid = document.querySelector("[data-testimonials-grid]");

if (testimonialsSection && testimonialsGrid) {
  fetch("/data/testimonials.json")
    .then((response) => response.ok ? response.json() : [])
    .then((items) => {
      if (!Array.isArray(items)) return;

      const validItems = items.filter((item) =>
        item &&
        typeof item.quote === "string" && item.quote.trim() &&
        typeof item.name === "string" && item.name.trim() &&
        typeof item.business === "string" && item.business.trim()
      );

      if (!validItems.length) return;

      const fragment = document.createDocumentFragment();

      validItems.forEach((item) => {
        const card = document.createElement("article");
        card.className = "testimonial-card";

        const quote = document.createElement("blockquote");
        quote.textContent = `“${item.quote.trim()}”`;

        const attribution = document.createElement("div");
        attribution.className = "testimonial-attribution";

        const name = document.createElement("p");
        name.textContent = item.name.trim();

        const business = document.createElement("span");
        business.textContent = [
          item.business.trim(),
          typeof item.location === "string" ? item.location.trim() : ""
        ]
          .filter(Boolean)
          .join(" · ");

        attribution.append(name, business);
        card.append(quote, attribution);
        fragment.append(card);
      });

      testimonialsGrid.append(fragment);
      testimonialsSection.hidden = false;
      ScrollTrigger.refresh();
    })
    .catch(() => {
      // Keep the section hidden if testimonial content is unavailable.
    });
}
