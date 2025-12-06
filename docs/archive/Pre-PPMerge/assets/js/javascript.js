/* -------------------------
   AUTO LOAD NAV + FOOTER
--------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  fetch("/partials/nav.html")
      .then(r => r.text())
      .then(html => document.getElementById("nav-placeholder").innerHTML = html);

  fetch("/partials/footer.html")
      .then(r => r.text())
      .then(html => document.getElementById("footer-placeholder").innerHTML = html);

  loadMaterialSymbols();
  initThemeToggle();
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
  const btns = document.querySelectorAll("#themeToggle, #theme-toggle-nav, #theme-toggle-side");
  const body = document.body;

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    body.setAttribute("data-theme", theme);
    body.classList.toggle("theme-dark", isDark);
    body.classList.toggle("theme-light", !isDark);

    btns.forEach(btn => btn.textContent = isDark ? "LIGHT" : "DARK");
    localStorage.setItem("cw-theme", theme);
  };

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      body.classList.add("theme-anim");
      setTimeout(() => body.classList.remove("theme-anim"), 600);

      const newTheme = body.classList.contains("theme-dark") ? "light" : "dark";
      applyTheme(newTheme);
    });
  });

  const saved = localStorage.getItem("cw-theme") || "light";
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
