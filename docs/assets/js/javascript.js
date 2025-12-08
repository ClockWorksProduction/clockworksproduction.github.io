/* ============================================================================ 
   GLOBAL JAVASCRIPT — Clockwork Production
============================================================================ */

// -------------------------------
// 1. External Script Imports
// -------------------------------
(function loadExternalScripts() {
  // FontAwesome
  const fa = document.createElement('script');
  fa.src = "https://kit.fontawesome.com/6b3a6b196a.js";
  fa.crossOrigin = "anonymous";
  fa.defer = true;
  document.head.appendChild(fa);
})();

// -------------------------------
// 2. Load Partials (Nav & Footer)
// -------------------------------
function loadPartial(id, path) {
  return fetch(path)
      .then(response => response.text())
      .then(html => {
          document.getElementById(id).innerHTML = html;
          return true;
      })
      .catch(err => {
          console.error('Failed to load partial:', err);
          return false;
      });
}

// -------------------------------
// 3. Sidebar Toggle (Mobile)
// -------------------------------
function w3_open() {
  const sidebar = document.getElementById("mySidebar");
  if(sidebar) sidebar.style.display = "block";
}

function w3_close() {
  const sidebar = document.getElementById("mySidebar");
  if(sidebar) sidebar.style.display = "none";
}

// -------------------------------
// 4. Theme Toggle Logic
// -------------------------------
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function initThemeSwitchButtons() {
  const desktopBtn = document.getElementById('theme-switch-btn-desktop');
  const mobileBtn = document.getElementById('theme-switch-btn-mobile');

  function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = current === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
  }

  if (desktopBtn) desktopBtn.addEventListener('click', toggleTheme);
  if (mobileBtn) mobileBtn.addEventListener('click', toggleTheme);
}

// -------------------------------
// 5. Initialize after partials loaded
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const partials = [
      loadPartial('nav-placeholder', '/partials/nav.html'),
      loadPartial('footer-placeholder', '/partials/footer.html')
  ];

  Promise.all(partials).then(() => {
      // Initialize sidebar buttons and theme switch
      initThemeSwitchButtons();

      // Load saved theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
  });
});

// -------------------------------
// 6. Optional Libraries (e.g., Mermaid)
// -------------------------------
function initMermaid() {
if (typeof mermaid !== "undefined") {
  mermaid.initialize({ startOnLoad: true });
}
}
