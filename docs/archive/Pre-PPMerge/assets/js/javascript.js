/* ============================================================
   SIDEBAR & THEME INTEGRATION
============================================================ */
const sidebar = document.getElementById("mySidebar");
const body = document.body;
const themeStylesheet = document.getElementById("theme");
const themeToggleButtons = document.querySelectorAll("#theme-toggle-nav, #theme-toggle-side, #themeToggle");

/* -----------------------------
   SIDEBAR OPEN / CLOSE
----------------------------- */
function openNav() {
    if (sidebar) {
        sidebar.style.display = "block";
        sidebar.offsetHeight; // force reflow
        sidebar.classList.add("open");
    }
}

function closeNav() {
    if (sidebar) {
        sidebar.classList.remove("open");
        sidebar.addEventListener("transitionend", () => {
            sidebar.style.display = "none";
        }, { once: true });
    }
}

/* -----------------------------
   THEME TOGGLE
----------------------------- */
function applyTheme(theme) {
    const isDark = theme === "dark";

    body.classList.toggle("theme-dark", isDark);
    body.classList.toggle("theme-light", !isDark);

    themeStylesheet.href = isDark
        ? "/assets/css/dark-theme.css"
        : "/assets/css/light-theme.css";

    themeToggleButtons.forEach(btn => {
        btn.textContent = isDark ? "LIGHT" : "DARK";
    });

    localStorage.setItem("cwp-theme", theme);
}

function toggleTheme() {
    const newTheme = body.classList.contains("theme-dark") ? "light" : "dark";
    applyTheme(newTheme);
}

/* -----------------------------
   INITIAL PAGE LOAD
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("cwp-theme") || "light";
    applyTheme(savedTheme);
});
