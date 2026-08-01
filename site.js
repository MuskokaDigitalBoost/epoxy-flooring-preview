import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createMagneticButtons, createPointerDepth } from "./motion-effects.js";

gsap.registerPlugin(ScrollTrigger);

const bookingMeta = document.querySelector('meta[name="mdb-booking-url"]');
const bookingUrl = bookingMeta?.content.trim() ?? "";
const validBookingUrl = /^https:\/\//i.test(bookingUrl);

document.querySelectorAll("[data-booking-link]").forEach((link) => {
  if (!validBookingUrl) return;

  link.href = bookingUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.hidden = false;
  link.addEventListener("click", () => {
    window.dataLayer?.push({
      event: "booking_link_clicked",
      location: link.dataset.bookingLocation || "unknown"
    });
  });
});

const pageMenuToggle = document.querySelector("[data-page-menu-toggle]");
const pageNavigation = document.querySelector("[data-page-navigation]");
const pageNavigationShell = document.querySelector("[data-page-nav-shell]");
const pageMobileQuery = window.matchMedia("(max-width: 980px)");

function setPageMenu(open, { returnFocus = false } = {}) {
  if (!pageMenuToggle || !pageNavigation) return;

  const shouldOpen = Boolean(open && pageMobileQuery.matches);
  pageMenuToggle.setAttribute("aria-expanded", String(shouldOpen));
  pageNavigation.dataset.open = String(shouldOpen);
  pageNavigation.toggleAttribute("inert", pageMobileQuery.matches && !shouldOpen);
  document.body.classList.toggle("menu-open", shouldOpen);

  const label = pageMenuToggle.querySelector(".sr-only");
  if (label) label.textContent = shouldOpen ? "Close navigation" : "Open navigation";
  if (!shouldOpen && returnFocus) pageMenuToggle.focus();
}

if (pageMenuToggle && pageNavigation) {
  setPageMenu(false);

  pageMenuToggle.addEventListener("click", () => {
    setPageMenu(pageMenuToggle.getAttribute("aria-expanded") !== "true");
  });

  pageNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setPageMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && pageMenuToggle.getAttribute("aria-expanded") === "true") {
      setPageMenu(false, { returnFocus: true });
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      pageMenuToggle.getAttribute("aria-expanded") === "true" &&
      pageNavigationShell &&
      !pageNavigationShell.contains(event.target)
    ) {
      setPageMenu(false);
    }
  });

  pageMobileQuery.addEventListener("change", () => setPageMenu(false));
}

function revealContentGroup(trigger, targets, options = {}) {
  const elements = gsap.utils.toArray(targets);
  if (!trigger || !elements.length) return;

  gsap.from(elements, {
    autoAlpha: 0,
    y: options.y ?? 34,
    scale: options.scale ?? 1,
    duration: options.duration ?? 0.82,
    stagger: options.stagger ?? 0.08,
    ease: "power3.out",
    clearProps: "transform,opacity,visibility",
    scrollTrigger: {
      trigger,
      start: options.start ?? "top 86%",
      once: true
    }
  });
}

function createContentPageMotion(isDesktop) {
  const hero = document.querySelector(".content-hero");
  const heroInner = document.querySelector(".content-hero-inner");

  if (hero && heroInner) {
    gsap.from(Array.from(heroInner.children), {
      autoAlpha: 0,
      y: 30,
      duration: 0.85,
      stagger: 0.08,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility"
    });
  }

  document.querySelectorAll(".content-section-heading").forEach((heading) => {
    revealContentGroup(heading, Array.from(heading.children), { y: 28, stagger: 0.07 });
  });

  document.querySelectorAll(".content-grid, .service-area-grid, .case-facts, .article-summary-grid, .article-related-grid").forEach((grid) => {
    revealContentGroup(grid, Array.from(grid.children), { y: 42, scale: 0.99, stagger: 0.08 });
  });

  document.querySelectorAll(".content-split, .insight-feature").forEach((group) => {
    revealContentGroup(group, Array.from(group.children), { y: 36, stagger: 0.12 });
  });

  revealContentGroup(
    document.querySelector(".case-study-visual"),
    ".case-study-visual",
    { y: 48, scale: 0.985 }
  );

  document.querySelectorAll(".content-cta").forEach((cta) => {
    revealContentGroup(cta, Array.from(cta.children), { y: 26, stagger: 0.07 });
  });

  if (!isDesktop) return () => {};

  if (hero && heroInner) {
    gsap.to(heroInner, {
      yPercent: -7,
      autoAlpha: 0.72,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.85
      }
    });
  }

  document.querySelectorAll(".content-section").forEach((section) => {
    const heading = section.querySelector(".content-section-heading");
    if (!heading) return;

    gsap.fromTo(heading,
      { y: 14 },
      {
        y: -16,
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

  document.querySelectorAll(".case-study-visual img").forEach((image) => {
    gsap.fromTo(image,
      { yPercent: -3, scale: 1.06 },
      {
        yPercent: 3,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: image.closest(".case-study-visual"),
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7
        }
      }
    );
  });

  const removePointerDepth = createPointerDepth(
    gsap,
    ".content-grid .content-card, .service-area-grid .service-area-card, .insight-feature, .article-summary-grid section, .article-related-grid a",
    { maxRotation: 3.6, lift: -4, perspective: 1150 }
  );
  const removeMagneticButtons = createMagneticButtons(
    gsap,
    ".nav-cta, .button, .plan-link",
    { strength: 9 }
  );

  return () => {
    removeMagneticButtons();
    removePointerDepth();
  };
}

if (document.body.classList.contains("content-page")) {
  document.documentElement.classList.add("gsap-ready");
  const contentMotion = gsap.matchMedia();

  contentMotion.add({
    desktop: "(min-width: 981px)",
    reduceMotion: "(prefers-reduced-motion: reduce)"
  }, (context) => {
    if (context.conditions.reduceMotion) return;
    const removePointerDepth = createContentPageMotion(context.conditions.desktop);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return removePointerDepth;
  });
}

if (document.body.classList.contains("article-page")) {
  const progress = document.createElement("div");
  const progressBar = document.createElement("span");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.append(progressBar);
  document.body.prepend(progress);

  let progressFrame = 0;
  const updateReadingProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.setProperty("--reading-progress", value.toFixed(4));
    progressFrame = 0;
  };

  const requestProgressUpdate = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(updateReadingProgress);
  };

  updateReadingProgress();
  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
}

const searchParams = new URLSearchParams(window.location.search);
const form = document.querySelector(".consultation-form");

if (form) {
  const attribution = {
    utm_source: searchParams.get("utm_source"),
    utm_medium: searchParams.get("utm_medium"),
    utm_campaign: searchParams.get("utm_campaign"),
    landing_page: `${window.location.pathname}${window.location.search}`
  };

  Object.entries(attribution).forEach(([name, value]) => {
    const input = form.elements.namedItem(name);
    if (input && value) input.value = value;
  });
}

if (document.body.classList.contains("thank-you-page")) {
  window.dataLayer?.push({
    event: "strategy_call_completed",
    page_location: window.location.href
  });
}

if (!document.querySelector("[data-background-video]")) {
  document.querySelectorAll("a[href*='#contact']").forEach((link) => {
    link.addEventListener("click", () => {
      window.dataLayer?.push({
        event: "contact_cta_clicked",
        label: link.textContent.trim(),
        page_path: window.location.pathname
      });
    });
  });
}

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  link.addEventListener("click", () => {
    window.dataLayer?.push({
      event: "outbound_link_clicked",
      link_url: link.href,
      page_path: window.location.pathname
    });
  });
});
