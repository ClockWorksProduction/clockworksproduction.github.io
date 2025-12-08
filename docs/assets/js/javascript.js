/* ============================================================================ 
   GLOBAL JAVASCRIPT — Clockwork Production
============================================================================ */

// ============================================================================
// EXTERNAL SCRIPT IMPORTS
// ============================================================================
(function loadExternalScripts() {
    // FontAwesome
    const fa = document.createElement('script');
    fa.src = "https://kit.fontawesome.com/6b3a6b196a.js";
    fa.crossOrigin = "anonymous";
    fa.defer = true;
    document.head.appendChild(fa);

    // You can add more external scripts here if needed
})();


/* -------------------------------
   1. Load Partials (Nav & Footer)
--------------------------------- */
function loadPartial(id, path) {
    fetch(path)
        .then(response => response.text())
        .then(html => { document.getElementById(id).innerHTML = html; })
        .catch(err => console.error('Failed to load partial:', err));
}

// Load navbar and footer
loadPartial('nav-placeholder', '/partials/nav.html');
loadPartial('footer-placeholder', '/partials/footer.html');

/* -------------------------------
   2. Sidebar Toggle (Mobile)
--------------------------------- */
function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
}

/* -------------------------------
   3. Theme Toggle Logic
--------------------------------- */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Sync checkboxes after loading nav
    const desktopCheckbox = document.getElementById('theme-checkbox-desktop');
    const mobileCheckbox = document.getElementById('theme-checkbox-mobile');

    if(desktopCheckbox) desktopCheckbox.checked = (theme === 'dark');
    if(mobileCheckbox) mobileCheckbox.checked = (theme === 'dark');
}

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Event listeners for checkboxes (delegated in case partials not loaded yet)
    document.body.addEventListener('change', e => {
        if(e.target && e.target.classList.contains('theme-toggle-checkbox')){
            const newTheme = e.target.checked ? 'dark' : 'light';
            setTheme(newTheme);
        }
    });
});

/* ------------------------------
   Optional: Load external libraries dynamically
--------------------------------*/
// Example: Mermaid.js (only if used on page)
function initMermaid() {
  if (typeof mermaid !== "undefined") {
    mermaid.initialize({ startOnLoad: true });
  }
}

/* ------------------------------
   Theme Switch Buttons
--------------------------------*/
function initThemeSwitchButtons() {
  const desktopBtn = document.getElementById('theme-switch-btn-desktop');
  const mobileBtn = document.getElementById('theme-switch-btn-mobile');

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  if (desktopBtn) desktopBtn.addEventListener('click', toggleTheme);
  if (mobileBtn) mobileBtn.addEventListener('click', toggleTheme);
}

// Initialize switch buttons
document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitchButtons();
});
