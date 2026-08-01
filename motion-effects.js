export function createPointerDepth(gsap, selector, options = {}) {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!finePointer.matches || reducedMotion.matches) return () => {};

  const cards = gsap.utils.toArray(selector);
  const cleanups = [];
  const maxRotation = options.maxRotation ?? 4.5;
  const lift = options.lift ?? -5;

  cards.forEach((card) => {
    card.classList.add("depth-card");
    gsap.set(card, {
      transformPerspective: options.perspective ?? 1000,
      transformOrigin: "center center"
    });

    const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.38, ease: "power3.out" });
    const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.38, ease: "power3.out" });
    const moveY = gsap.quickTo(card, "y", { duration: 0.38, ease: "power3.out" });
    const scale = gsap.quickTo(card, "scale", { duration: 0.38, ease: "power3.out" });

    const handlePointerEnter = () => {
      card.classList.add("depth-card-active");
      moveY(lift);
      scale(1.008);
    };

    const handlePointerMove = (event) => {
      const bounds = card.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;
      const normalizedX = (relativeX - 0.5) * 2;
      const normalizedY = (relativeY - 0.5) * 2;

      rotateX(-normalizedY * maxRotation);
      rotateY(normalizedX * maxRotation);
      card.style.setProperty("--depth-glow-x", `${relativeX * 100}%`);
      card.style.setProperty("--depth-glow-y", `${relativeY * 100}%`);
    };

    const handlePointerLeave = () => {
      rotateX(0);
      rotateY(0);
      moveY(0);
      scale(1);
      card.style.setProperty("--depth-glow-x", "50%");
      card.style.setProperty("--depth-glow-y", "50%");
      card.classList.remove("depth-card-active");
    };

    card.addEventListener("pointerenter", handlePointerEnter);
    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", handlePointerLeave);

    cleanups.push(() => {
      card.removeEventListener("pointerenter", handlePointerEnter);
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", handlePointerLeave);
      card.classList.remove("depth-card", "depth-card-active");
      card.style.removeProperty("--depth-glow-x");
      card.style.removeProperty("--depth-glow-y");
      gsap.set(card, { clearProps: "transform,transformOrigin" });
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

export function createMagneticButtons(gsap, selector, options = {}) {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!finePointer.matches || reducedMotion.matches) return () => {};

  const buttons = gsap.utils.toArray(selector);
  const cleanups = [];
  const strength = options.strength ?? 9;

  buttons.forEach((button) => {
    button.classList.add("magnetic-button");

    const moveX = gsap.quickTo(button, "x", {
      duration: 0.28,
      ease: "power3.out"
    });
    const moveY = gsap.quickTo(button, "y", {
      duration: 0.28,
      ease: "power3.out"
    });

    const handlePointerEnter = () => {
      button.classList.add("magnetic-button-active");
    };

    const handlePointerMove = (event) => {
      const bounds = button.getBoundingClientRect();
      const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      moveX(normalizedX * strength);
      moveY(normalizedY * strength * 0.7);
      button.style.setProperty("--magnetic-x", `${((normalizedX + 1) / 2) * 100}%`);
      button.style.setProperty("--magnetic-y", `${((normalizedY + 1) / 2) * 100}%`);
    };

    const handlePointerLeave = () => {
      button.classList.remove("magnetic-button-active");
      button.style.setProperty("--magnetic-x", "50%");
      button.style.setProperty("--magnetic-y", "50%");

      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.62,
        ease: "elastic.out(1, 0.42)",
        overwrite: true,
        onComplete: () => gsap.set(button, { clearProps: "transform" })
      });
    };

    button.addEventListener("pointerenter", handlePointerEnter);
    button.addEventListener("pointermove", handlePointerMove);
    button.addEventListener("pointerleave", handlePointerLeave);

    cleanups.push(() => {
      button.removeEventListener("pointerenter", handlePointerEnter);
      button.removeEventListener("pointermove", handlePointerMove);
      button.removeEventListener("pointerleave", handlePointerLeave);
      button.classList.remove("magnetic-button", "magnetic-button-active");
      button.style.removeProperty("--magnetic-x");
      button.style.removeProperty("--magnetic-y");
      gsap.killTweensOf(button);
      gsap.set(button, { clearProps: "transform" });
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
