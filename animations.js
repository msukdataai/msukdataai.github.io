// ─── Particle Canvas ────────────────────────────────────────────────────────
(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "particle-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const PARTICLE_COUNT = 72;
  const LINK_DIST = 140;
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = document.documentElement.scrollHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function Particle() {
    this.x  = rand(0, W);
    this.y  = rand(0, H);
    this.vx = rand(-0.35, 0.35);
    this.vy = rand(-0.35, 0.35);
    this.r  = rand(1.2, 2.4);
    this.alpha = rand(0.35, 0.8);
    this.color = Math.random() > 0.5 ? "0,212,235" : "120,140,255";
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  };

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, function () { return new Particle(); });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + p.color + "," + p.alpha + ")";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const lineAlpha = (1 - dist / LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(" + p.color + "," + lineAlpha + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", function () { init(); });
  init();
  draw();
})();


// ─── Scroll-reveal ──────────────────────────────────────────────────────────
(function () {
  const targets = ".link-card, .event-card, .series-card, .events-list h2";
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("revealed");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  function observe() {
    document.querySelectorAll(targets).forEach(function (el) {
      el.classList.add("will-reveal");
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe);
  } else {
    observe();
  }
})();


// ─── Typing tagline ─────────────────────────────────────────────────────────
(function () {
  const tagline = document.querySelector(".hero .tagline");
  if (!tagline) return;

  const text = tagline.textContent.trim();
  tagline.textContent = "";
  tagline.style.visibility = "visible";

  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  cursor.textContent = "|";
  tagline.appendChild(cursor);

  let i = 0;
  function type() {
    if (i < text.length) {
      tagline.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, 28 + Math.random() * 18);
    } else {
      setTimeout(function () { cursor.style.display = "none"; }, 1800);
    }
  }

  setTimeout(type, 600);
})();


// ─── Hero floating tech tags (home page only) ────────────────────────────────
(function () {
  if (!document.body.classList.contains("home-page")) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const tags = [
    "Microsoft Fabric", "Microsoft Foundry", "Azure Machine Learning", "Power BI",
    "Data Engineering", "Machine Learning", "Azure OpenAI", "Azure SQL",
    "Real-time Intelligence", "OneLake"
  ];

  const container = document.createElement("div");
  container.className = "hero-tags";
  container.setAttribute("aria-hidden", "true");

  // Split tags evenly into left and right columns, then space them
  // vertically so no two tags in the same column overlap.
  const leftTags  = tags.filter(function (_, i) { return i % 2 === 0; });
  const rightTags = tags.filter(function (_, i) { return i % 2 !== 0; });

  // Estimated height per tag row (px) — tag height ~26px + ~14px gap
  const rowH = 44;
  // Hero height in px (approximate; tags are %-positioned so use 100 as base)
  // We spread from 12% to 88% of hero height
  const yStart = 12;
  const yRange = 76;

  function placeColumn(colTags, xMin, xMax, delayOffset) {
    const step = yRange / Math.max(colTags.length, 1);
    colTags.forEach(function (tag, i) {
      const el = document.createElement("span");
      el.className = "hero-tag";
      el.textContent = tag;
      // Stagger x slightly within the column band for a natural feel
      const xPos = xMin + Math.random() * (xMax - xMin);
      // Fixed vertical slots with a small jitter (±3%) so it's not a rigid grid
      const yPos = yStart + step * i + step * 0.5 + (Math.random() * 6 - 3);
      el.style.setProperty("--x", xPos.toFixed(1) + "%");
      el.style.setProperty("--y", Math.min(Math.max(yPos, yStart), yStart + yRange).toFixed(1) + "%");
      el.style.setProperty("--delay", ((i + delayOffset) * 0.4).toFixed(1) + "s");
      container.appendChild(el);
    });
  }

  // Left column: 1%–16%,  Right column: 76%–92%
  placeColumn(leftTags,  1,  16, 0);
  placeColumn(rightTags, 76, 92, leftTags.length);

  hero.appendChild(container);
})();
