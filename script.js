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
