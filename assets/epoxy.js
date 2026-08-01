import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createMagneticButtons, createPointerDepth } from "../motion-effects.js";

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js-ready");

const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const mobileQuery = window.matchMedia("(max-width: 980px)");

function updateNav() {
  nav?.classList.toggle("is-scrolled", window.scrollY > 36);
}

updateNav();
window.addEventListener("scroll", updateNav, { passive: true });

function setMenu(open, { returnFocus = false } = {}) {
  if (!menuToggle || !menu) return;

  const shouldOpen = Boolean(open && mobileQuery.matches);
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  menu.dataset.open = String(shouldOpen);
  menu.toggleAttribute("inert", mobileQuery.matches && !shouldOpen);
  document.body.classList.toggle("menu-open", shouldOpen);

  const label = menuToggle.querySelector(".sr-only");
  if (label) label.textContent = shouldOpen ? "Close navigation" : "Open navigation";
  if (!shouldOpen && returnFocus) menuToggle.focus();
}

if (menuToggle && menu) {
  setMenu(false);

  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false, { returnFocus: true });
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (menuToggle.getAttribute("aria-expanded") === "true" && nav && !nav.contains(event.target)) {
      setMenu(false);
    }
  });

  mobileQuery.addEventListener("change", () => setMenu(false));
}

const finishDetails = {
  granite: {
    name: "Granite flake",
    description: "A versatile salt-and-pepper blend that works easily with most garage interiors."
  },
  graphite: {
    name: "Graphite flake",
    description: "A darker architectural blend for spaces that call for a more tailored, low-contrast look."
  },
  smoke: {
    name: "Smoked metallic",
    description: "A fluid, expressive finish direction with bronze movement over a deep charcoal base."
  },
  sandstone: {
    name: "Sandstone quartz",
    description: "A warm, granular palette that brings a grounded natural character to working spaces."
  }
};

const finishStage = document.querySelector("[data-finish-stage]");
const finishName = document.querySelector("[data-finish-name]");
const finishDescription = document.querySelector("[data-finish-description]");
const finishChips = Array.from(document.querySelectorAll("[data-finish]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

finishChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const finish = chip.dataset.finish;
    const details = finishDetails[finish];
    if (!finishStage || !finishName || !finishDescription || !details) return;

    finishChips.forEach((item) => {
      const selected = item === chip;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    const applyFinish = () => {
      finishStage.dataset.activeFinish = finish;
      finishName.textContent = details.name;
      finishDescription.textContent = details.description;
    };

    if (reduceMotion.matches) {
      applyFinish();
      return;
    }

    gsap.to(finishStage, {
      autoAlpha: 0.72,
      scale: 0.992,
      duration: 0.16,
      ease: "power2.in",
      onComplete() {
        applyFinish();
        gsap.to(finishStage, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power3.out" });
      }
    });
  });
});

const conceptForm = document.querySelector("[data-concept-form]");

conceptForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!conceptForm.checkValidity()) {
    conceptForm.reportValidity();
    return;
  }

  const status = conceptForm.querySelector(".form-status");
  if (status) {
    status.textContent = "Concept preview: form delivery will be connected after the client approves a hosting and contact setup.";
  }
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const motion = gsap.matchMedia();

motion.add(
  {
    desktop: "(min-width: 981px)",
    reduce: "(prefers-reduced-motion: reduce)"
  },
  (context) => {
    if (context.conditions.reduce) return;

    const heroTargets = [
      ".site-nav",
      ".hero .eyebrow",
      ".hero h1",
      ".hero-lede",
      ".hero-actions",
      ".hero-note",
      ".hero-rail article",
      ".hero-footer"
    ];

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".site-nav", { autoAlpha: 0, y: -20, duration: 0.7 })
      .from(".hero .eyebrow", { autoAlpha: 0, y: 18, duration: 0.55 }, "-=0.28")
      .from(".hero h1", { autoAlpha: 0, y: 54, duration: 1.05 }, "-=0.3")
      .from(".hero-lede", { autoAlpha: 0, y: 28, duration: 0.72 }, "-=0.58")
      .from(".hero-actions", { autoAlpha: 0, y: 22, duration: 0.65 }, "-=0.48")
      .from(".hero-note", { autoAlpha: 0, y: 14, duration: 0.5 }, "-=0.4")
      .from(".hero-rail article", { autoAlpha: 0, x: 25, stagger: 0.08, duration: 0.55 }, "-=0.55")
      .from(".hero-footer", { autoAlpha: 0, duration: 0.45 }, "-=0.35")
      .eventCallback("onComplete", () => gsap.set(heroTargets, { clearProps: "transform,opacity,visibility" }));

    gsap.utils.toArray(".reveal").forEach((item) => {
      gsap.from(Array.from(item.children), {
        autoAlpha: 0,
        y: 34,
        duration: 0.78,
        stagger: 0.07,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: item, start: "top 84%", once: true }
      });
    });

    gsap.utils.toArray(".reveal-card").forEach((card) => {
      gsap.from(card, {
        autoAlpha: 0,
        y: 50,
        scale: 0.985,
        duration: 0.78,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: card, start: "top 88%", once: true }
      });
    });

    if (context.conditions.desktop) {
      gsap.to(".hero-image", {
        yPercent: 8,
        scale: 1.07,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.9 }
      });

      gsap.to(".visual-break > img", {
        yPercent: 7,
        scale: 1.13,
        ease: "none",
        scrollTrigger: { trigger: ".visual-break", start: "top bottom", end: "bottom top", scrub: 0.8 }
      });
    }

    const removeDepth = context.conditions.desktop
      ? createPointerDepth(gsap, ".service-card, .finish-stage", { maxRotation: 3.1, lift: -4, perspective: 1200 })
      : () => {};
    const removeMagnetic = context.conditions.desktop
      ? createMagneticButtons(gsap, ".magnetic", { strength: 7 })
      : () => {};

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      removeDepth();
      removeMagnetic();
    };
  }
);
