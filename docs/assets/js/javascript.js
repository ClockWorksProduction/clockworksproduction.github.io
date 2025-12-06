/* ----------------------------
   GLOBAL THEME INITIALIZATION
-----------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Loads the Font Awesome kit and falls back to Material Symbols if it fails.
   */
  async function loadIconFonts() {
    const loadFontAwesome = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://kit.fontawesome.com/6b3a6b196a.js";
      script.crossOrigin = "anonymous";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });

    const faLoaded = await loadFontAwesome;

    if (!faLoaded) {
      console.warn("FontAwesome kit failed to load. Falling back to Material Symbols.");
      const fallback = document.createElement("link");
      fallback.rel = "stylesheet";
      fallback.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded";
      document.head.appendChild(fallback);
    }
  }

  const savedTheme = localStorage.getItem("cw-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Load fonts, then the rest of the UI.
  loadIconFonts().then(() => {
    loadNavAndFooter().then(() => {
      initThemeToggle();
      initSidebar();
    });
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
