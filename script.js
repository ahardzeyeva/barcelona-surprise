const revealButtons = document.querySelectorAll("[data-unlock]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const hasGsap = typeof window.gsap !== "undefined";
let celebrationPlayed = false;
let giftOpeningStarted = false;
const ticketHoverBound = new WeakSet();

if (hasGsap) {
  document.body.classList.add("has-gsap");
}

if (window.lucide && typeof window.lucide.createIcons === "function") {
  window.lucide.createIcons();
}

function celebrateFinalReveal() {
  if (celebrationPlayed || reducedMotion.matches || typeof window.confetti !== "function") {
    return;
  }

  celebrationPlayed = true;
  const colors = ["#76223d", "#d3b879", "#f4eee4", "#173d70"];
  const burstFrom = (origin, angle) => {
    window.confetti({
      particleCount: 12,
      angle,
      spread: 46,
      startVelocity: 18,
      gravity: 0.9,
      decay: 0.91,
      ticks: 82,
      scalar: 0.72,
      origin,
      colors,
      disableForReducedMotion: true,
      zIndex: 12
    });
  };

  burstFrom({ x: 0.06, y: 0.19 }, 55);
  burstFrom({ x: 0.94, y: 0.19 }, 125);
  window.setTimeout(() => {
    burstFrom({ x: 0.1, y: 0.38 }, 48);
    burstFrom({ x: 0.9, y: 0.38 }, 132);
  }, 420);
  window.setTimeout(() => {
    burstFrom({ x: 0.04, y: 0.27 }, 58);
    burstFrom({ x: 0.96, y: 0.27 }, 122);
  }, 840);
}

function animateSection(section) {
  if (!hasGsap) {
    return;
  }

  const progress = section.querySelector(".progress");
  const content = section.querySelector(".section__content");
  const contentItems = Array.from(content?.children || []);
  const isFinal = section.dataset.section === "4";
  const tickets = isFinal ? section.querySelectorAll(".ticket") : [];
  const reduced = reducedMotion.matches;
  const timeline = window.gsap.timeline();
  const copyNodes = [progress, ...contentItems].filter(Boolean);

  if (content) {
    window.gsap.set(content, { autoAlpha: 1, y: 0 });
  }
  window.gsap.set(copyNodes, { autoAlpha: 0, y: reduced ? 0 : 16 });
  timeline.to(copyNodes, {
    autoAlpha: 1,
    y: 0,
    duration: reduced ? 0.28 : 0.72,
    stagger: reduced ? 0 : 0.1,
    ease: "power3.out"
  }, 0);

  if (!isFinal || !tickets.length) {
    return;
  }

  if (!reduced) {
    timeline.call(celebrateFinalReveal, [], 0.34);
  }

  timeline.fromTo(tickets, {
    autoAlpha: 0,
    y: reduced ? 0 : 220,
    scale: reduced ? 1 : 0.96,
    rotation: (index) => index === 0 ? -5 : 5
  }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    rotation: (index) => index === 0 ? -2 : 2,
    duration: reduced ? 0.32 : 0.9,
    stagger: reduced ? 0 : 0.16,
    ease: "power3.out",
    overwrite: "auto"
  }, reduced ? 0.12 : 0.44);

  if (!reduced) {
    tickets.forEach((ticket, index) => {
      if (ticketHoverBound.has(ticket)) {
        return;
      }

      ticketHoverBound.add(ticket);
      ticket.addEventListener("pointerenter", () => {
        window.gsap.to(ticket, {
          y: -6,
          scale: 1.01,
          rotation: index === 0 ? -0.8 : 0.8,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
      ticket.addEventListener("pointerleave", () => {
        window.gsap.to(ticket, {
          y: 0,
          scale: 1,
          rotation: index === 0 ? -2 : 2,
          duration: 0.34,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    });
  }
}

function bindObjectInteractions() {
  if (!hasGsap || reducedMotion.matches) {
    return;
  }

  const gift = document.querySelector(".section--gift .section__image");
  const giftHotspot = document.querySelector(".gift-hotspot");
  if (gift && giftHotspot) {
    const floatGift = () => window.gsap.to(gift, {
      y: 3,
      scale: 1.025,
      duration: 4.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    floatGift();
    giftHotspot.addEventListener("pointerenter", () => {
      window.gsap.killTweensOf(gift);
      window.gsap.to(gift, { y: -4, scale: 1.04, duration: 0.35, ease: "power2.out" });
    });
    giftHotspot.addEventListener("pointerleave", () => {
      window.gsap.killTweensOf(gift);
      floatGift();
    });
  }

  const flight = document.querySelector(".section--flight .section__image");
  const flightHotspot = document.querySelector(".flight-hotspot");
  if (flight && flightHotspot) {
    flightHotspot.addEventListener("pointerenter", () => {
      window.gsap.to(flight, { scale: 1.018, filter: "brightness(1.05)", duration: 0.35, ease: "power2.out" });
    });
    flightHotspot.addEventListener("pointerleave", () => {
      window.gsap.to(flight, { scale: 1.005, filter: "brightness(1)", duration: 0.4, ease: "power2.out" });
    });
  }
}

function revealSection(sectionNumber) {
  const section = document.querySelector(`[data-section="${sectionNumber}"]`);

  if (!section || !section.hidden) {
    return;
  }

  const isFinalReveal = String(sectionNumber) === "4";
  document.body.classList.add("is-revealing");

  const showSection = () => {
    section.hidden = false;

    requestAnimationFrame(() => {
      section.classList.add("is-visible");
      section.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
      animateSection(section);
      if (section.dataset.section === "4" && !hasGsap) {
        window.setTimeout(celebrateFinalReveal, 340);
      }
    });

    window.setTimeout(() => {
      document.body.classList.remove("is-revealing");
    }, 900);
  };

  if (isFinalReveal) {
    document.body.classList.add("is-final-transition");
    window.setTimeout(() => {
      showSection();
      window.setTimeout(() => {
        document.body.classList.remove("is-final-transition");
      }, 80);
    }, 360);
    return;
  }

  showSection();
}

function openGift() {
  if (giftOpeningStarted) {
    return;
  }

  giftOpeningStarted = true;
  const section = document.querySelector('[data-section="1"]');
  const image = section.querySelector(".section__image");
  const sparkles = section.querySelectorAll(".sparkle");
  document.querySelectorAll('[data-unlock="2"]').forEach((trigger) => {
    trigger.disabled = true;
  });
  section.classList.add("is-opening");

  if (!reducedMotion.matches && hasGsap) {
    window.gsap.killTweensOf(image);
    const opening = window.gsap.timeline({ onComplete: () => revealSection(2) });
    opening.to(image, {
      scale: 1.035,
      y: -2,
      duration: 0.16,
      ease: "power2.out",
      overwrite: "auto"
    }, 0);
    opening.to(image, {
      scale: 1.06,
      y: -5,
      filter: "brightness(1.08)",
      duration: 0.58,
      ease: "power3.out",
      overwrite: "auto"
    }, 0.14);
    opening.fromTo(sparkles, {
      autoAlpha: 0,
      scale: 0.2,
      x: 0,
      y: 0
    }, {
      autoAlpha: 0.88,
      scale: 1,
      x: (index) => [-15, 12, 2][index],
      y: (index) => [-13, -10, 15][index],
      duration: 0.36,
      stagger: 0.035,
      ease: "power2.out"
    }, 0.22);
    opening.to(sparkles, {
      autoAlpha: 0,
      scale: 0.55,
      duration: 0.2,
      stagger: 0.025
    }, 0.59);
    return;
  }

  if (reducedMotion.matches) {
    revealSection(2);
    return;
  }

  window.setTimeout(() => revealSection(2), 760);
}

const holdButton = document.querySelector(".button--final-reveal");
let holdTimer = null;

function cancelFinalHold() {
  if (holdTimer === null) {
    return;
  }

  window.clearTimeout(holdTimer);
  holdTimer = null;
  holdButton.classList.remove("is-holding");
}

function beginFinalHold(event) {
  if (holdTimer !== null || (event.type === "pointerdown" && event.button !== 0)) {
    return;
  }

  event.preventDefault();
  holdButton.classList.remove("is-complete");
  holdButton.classList.add("is-holding");

  if (event.type === "pointerdown" && holdButton.setPointerCapture) {
    holdButton.setPointerCapture(event.pointerId);
  }

  holdTimer = window.setTimeout(() => {
    holdTimer = null;
    holdButton.classList.remove("is-holding");
    holdButton.classList.add("is-complete");
    revealSection(4);
  }, 2000);
}

if (holdButton) {
  holdButton.addEventListener("pointerdown", beginFinalHold);
  holdButton.addEventListener("pointerup", cancelFinalHold);
  holdButton.addEventListener("pointercancel", cancelFinalHold);
  holdButton.addEventListener("lostpointercapture", cancelFinalHold);
  holdButton.addEventListener("keydown", (event) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      beginFinalHold(event);
    }
  });
  holdButton.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") {
      cancelFinalHold();
    }
  });
  holdButton.addEventListener("blur", cancelFinalHold);
}

revealButtons.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (trigger.dataset.unlock === "2") {
      openGift();
      return;
    }

    if (trigger.dataset.unlock === "4") {
      return;
    }

    revealSection(trigger.dataset.unlock);
  });
});

animateSection(document.querySelector('[data-section="1"]'));
bindObjectInteractions();
