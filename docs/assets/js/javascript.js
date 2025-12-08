/* -------------------------
   AUTO LOAD NAV + FOOTER
--------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  // Load nav
  fetch("/partials/nav.html")
      .then(r => r.text())
      .then(html => document.getElementById("nav-placeholder").innerHTML = html)
      .then(() => initThemeToggle()); // init after nav is loaded

  // Load footer
  fetch("/partials/footer.html")
      .then(r => r.text())
      .then(html => document.getElementById("footer-placeholder").innerHTML = html);

  loadMaterialSymbols();
});

/* -------------------------
 MATERIAL SYMBOLS LOADER
--------------------------*/
function loadMaterialSymbols() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0";

  link.onerror = () => {
      console.warn("Material Symbols CDN failed. Using local fallback.");
      const fallback = document.createElement("link");
      fallback.rel = "stylesheet";
      fallback.href = "/assets/css/material-fallback.css";
      document.head.appendChild(fallback);
  };

  document.head.appendChild(link);
}

/* -------------------------
 THEME TOGGLE + ANIMATION
--------------------------*/
function initThemeToggle() {
  const toggles = document.querySelectorAll("[data-cw-theme-toggle]");
  const body = document.body;

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    body.setAttribute("data-theme", theme);
    body.classList.toggle("theme-dark", isDark);
    body.classList.toggle("theme-light", !isDark);

    toggles.forEach(cb => {
      cb.checked = isDark; // sync checkbox
      const slider = cb.nextElementSibling;
      if (slider) {
        slider.querySelector(".gear-icon").style.opacity = isDark ? 1 : 0;
        slider.querySelector(".crystal-ball-icon").style.opacity = isDark ? 0 : 1;
      }
    });

    localStorage.setItem("cw-theme", theme);
  };

  toggles.forEach(cb => {
    cb.addEventListener("click", () => {
      body.classList.add("theme-anim");
      setTimeout(() => body.classList.remove("theme-anim"), 600);

      const newTheme = body.classList.contains("theme-dark") ? "light" : "dark";
      applyTheme(newTheme);
    });
  });

  // Apply saved theme on load
  const saved = localStorage.getItem("cw-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(saved);
}

/* -------------------------
 MOBILE SIDEBAR
--------------------------*/
function toggleSidebar() {
  const sidebar = document.getElementById("mobileSidebar") || document.getElementById("mySidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("sidebar-open");
  sidebar.classList.toggle("sidebar-closed");
}
