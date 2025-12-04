/* ============================================================
   CLEAN JAVASCRIPT SYSTEM
   - Theme Toggle (class-based only)
   - Collapsible Sidebar
   ============================================================ */

/* ----------------------------------------
   SIDEBAR COLLAPSE / EXPAND
---------------------------------------- */
const sidebar = document.getElementById("mySidebar");

function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle("sidebar-closed");
    }
}

/* ----------------------------------------
   THEME TOGGLING (CLASS-BASED)
---------------------------------------- */
const body = document.body;
const themeStylesheet = document.getElementById("theme");
const themeToggleButtons = document.querySelectorAll("#theme-toggle-nav, #theme-toggle-side");

function applyTheme(theme) {
    const isDark = theme === "dark";

    // Toggle root class
    body.classList.toggle("theme-dark", isDark);
    body.classList.toggle("theme-light", !isDark);

    // Swap stylesheet file
    themeStylesheet.href = isDark 
        ? "/assets/css/dark-theme.css" 
        : "/assets/css/light-theme.css";

    // Update text on all toggle buttons
    themeToggleButtons.forEach(btn => {
        btn.textContent = isDark ? "LIGHT" : "DARK";
    });
}

function toggleTheme() {
    const newTheme = body.classList.contains("theme-dark") ? "light" : "dark";
    applyTheme(newTheme);

    // Optional: remember theme
    localStorage.setItem("cwp-theme", newTheme);
}

/* ----------------------------------------
   INITIAL PAGE LOAD
---------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    // Optional memory system
    const savedTheme = localStorage.getItem("cwp-theme") || "light";

    applyTheme(savedTheme);
});
