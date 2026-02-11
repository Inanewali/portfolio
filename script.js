const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const menuBtn = document.querySelector(".menuBtn");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a link (mobile)
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}


// ============================
// Load projects from GitHub
// ============================
async function loadGitHubProjects() {
  const username = "Inanewali";
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  grid.innerHTML = `<p class="muted">Loading projects...</p>`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const repos = await res.json();

    // Filter out portfolio repo + forks (optional)
    const projects = repos
      .filter((r) => r.name.toLowerCase() !== "portfolio")
      .filter((r) => !r.fork)
      .slice(0, 6); // show latest 6 updated repos

    if (projects.length === 0) {
      grid.innerHTML = `<p class="muted">No projects found.</p>`;
      return;
    }

    grid.innerHTML = projects
      .map((repo) => {
        const desc = repo.description || "No description provided.";
        const lang = repo.language || "—";

        return `
          <article class="project">
            <h3>${escapeHtml(repo.name)}</h3>
            <p class="muted">${escapeHtml(desc)}</p>

            <div class="tags">
              <span>${escapeHtml(lang)}</span>
            </div>

            <div class="projectLinks">
              <a href="${repo.html_url}" target="_blank" rel="noreferrer">Code</a>
              ${
                repo.homepage
                  ? `<a href="${repo.homepage}" target="_blank" rel="noreferrer">Live</a>`
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="muted">Could not load projects right now.</p>`;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", loadGitHubProjects);
