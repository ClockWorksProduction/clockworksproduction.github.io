/* ----------------------------
   GLOBAL THEME INITIALIZATION
-----------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("cw-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  loadMaterialSymbols();
  loadNavAndFooter().then(() => {
    initThemeToggle();
    initSidebar();
  });
});

/* Load nav + footer */
function loadNavAndFooter() {
  return Promise.all([
    fetch("/partials/nav.html")
      .then(r => r.text())
      .then(html => { document.getElementById("nav-placeholder").innerHTML = html; }),
    fetch("/partials/footer.html")
      .then(r => r.text())
      .then(html => { document.getElementById("footer-placeholder").innerHTML = html; })
  ]);
}

/* Material Symbols loader */
function loadMaterialSymbols() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded";

  link.onerror = () => {
    const fallback = document.createElement("link");
    fallback.rel = "stylesheet";
    fallback.href = "/assets/css/material-fallback.css";
    document.head.appendChild(fallback);
  };

  document.head.appendChild(link);
}

/* THEME TOGGLE */
function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";

    document.documentElement.classList.add("theme-anim");
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("cw-theme", next);

    setTimeout(() => {
      document.documentElement.classList.remove("theme-anim");
    }, 600);
  });
}

/* ----------------------------------------
   SIDEBAR COLLAPSE / EXPAND
---------------------------------------- */
function toggleSidebar() {
    const sidebar = document.getElementById("mySidebar");
    if (sidebar) {
        sidebar.classList.toggle("sidebar-closed");
    }
}

function initSidebar() {
  const hamburger = document.getElementById("hamburger-menu");
  const closeButton = document.getElementById("close-sidebar");
  if (hamburger) {
    hamburger.addEventListener('click', toggleSidebar);
  }
  if (closeButton) {
    closeButton.addEventListener('click', toggleSidebar);
  }
}