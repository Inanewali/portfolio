// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.querySelector(".menuBtn");
const nav = document.querySelector(".nav");
function setMenu(open) {
  if (!menuBtn || !nav) return;
  nav.classList.toggle("open", open);
  document.body.classList.toggle("menuOpen", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuBtn.textContent = open ? "✕" : "☰";
}
if (menuBtn && nav) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!nav.classList.contains("open"));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 960) setMenu(false); });
}

// Theme toggle (remembers choice when storage is available)
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (e) {}
const themeBtn = document.querySelector(".themeBtn");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const current =
      root.dataset.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

// Highlight the nav link for the section in view
const links = [...document.querySelectorAll(".nav a")];
const sections = links
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
if ("IntersectionObserver" in window) {
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObs.observe(s));

}

// ============================
// Scroll trail: data packet
// ============================
(function () {
  const host = document.querySelector(".dataTrail");
  if (!host) return;
  const NS = "http://www.w3.org/2000/svg";
  const W = 84, MID = 42, AMP = 26, WAVE = 460;
  const xAt = (y) => MID + AMP * Math.sin(y / WAVE * 2 * Math.PI);

  const svg = document.createElementNS(NS, "svg");
  const glow = document.createElementNS(NS, "path");
  const base = document.createElementNS(NS, "path");
  const done = document.createElementNS(NS, "path");
  const clip = document.createElementNS(NS, "clipPath");
  const clipRect = document.createElementNS(NS, "rect");
  clip.id = "trailClip";
  clip.appendChild(clipRect);
  glow.setAttribute("class", "trailGlow");
  base.setAttribute("class", "trailBase");
  done.setAttribute("class", "trailDone");
  glow.setAttribute("clip-path", "url(#trailClip)");
  done.setAttribute("clip-path", "url(#trailClip)");

  // Database-cylinder packet
  const packet = document.createElementNS(NS, "g");
  packet.setAttribute("class", "packet");
  packet.innerHTML = `
    <g class="packetBob">
      <circle class="bit" cx="-9" cy="-20" r="2"/>
      <circle class="bit" cx="0" cy="-22" r="2.4"/>
      <circle class="bit" cx="9" cy="-20" r="2"/>
      <path class="packetBody" d="M-14,-9 v18 a14,5 0 0 0 28,0 v-18"/>
      <rect class="packetBand" x="-14" y="-3" width="28" height="6"/>
      <path class="packetLine" d="M-14,-3 a14,5 0 0 0 28,0 M-14,3 a14,5 0 0 0 28,0"/>
      <path class="packetLine" d="M-14,-9 v18 a14,5 0 0 0 28,0 v-18"/>
      <ellipse class="packetBody" cx="0" cy="-9" rx="14" ry="5"/>
    </g>`;

  svg.append(clip, glow, base, done, packet);
  host.appendChild(svg);

  let H = 0;
  function build() {
    H = document.documentElement.scrollHeight;
    host.style.height = H + "px";
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    let d = `M${xAt(0).toFixed(1)},0`;
    for (let y = 12; y <= H; y += 12) d += ` L${xAt(y).toFixed(1)},${y}`;
    [glow, base, done].forEach((p) => p.setAttribute("d", d));
    clipRect.setAttribute("x", -20);
    clipRect.setAttribute("width", W + 40);
    update();
  }

  let ticking = false;
  function update() {
    ticking = false;
    const max = Math.max(1, H - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    // keep the packet on screen: ride from near the top to near the bottom of the page
    const y = window.scrollY + window.innerHeight * (0.2 + 0.6 * progress);
    const x = xAt(y);
    const slope = (AMP * 2 * Math.PI / WAVE) * Math.cos(y / WAVE * 2 * Math.PI);
    const tilt = Math.atan(slope) * 180 / Math.PI * 0.6;
    packet.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${tilt.toFixed(1)}) scale(1.35)`);
    clipRect.setAttribute("y", 0);
    clipRect.setAttribute("height", Math.max(0, y - 16));
  }

  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", build);
  window.addEventListener("load", build);
  if ("ResizeObserver" in window) new ResizeObserver(build).observe(document.querySelector("main"));
  build();
})();
