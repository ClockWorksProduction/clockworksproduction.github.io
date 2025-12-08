/* ============================================================================ 
   GLOBAL JAVASCRIPT — Clockwork Production
============================================================================ */

// -------------------------------
// 1. External Script Imports
// -------------------------------
(function loadExternalScripts() {
  const fa = document.createElement('script');
  fa.src = "https://kit.fontawesome.com/6b3a6b196a.js";
  fa.crossOrigin = "anonymous";
  fa.defer = true;
  document.head.appendChild(fa);
})();

// -------------------------------
// 2. Load Partials
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
// 3. Sidebar Toggle
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
  const toggles = document.querySelectorAll('.theme-toggle-checkbox');
  toggles.forEach(toggle => {
    toggle.checked = theme === 'dark';
  });
  // Re-apply styles to Google Translate widget on theme change
  customizeGoogleTranslate();
}

function initThemeSlider() {
  const toggles = document.querySelectorAll('.theme-toggle-checkbox');
  if (toggles.length === 0) return;
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
        const newTheme = toggle.checked ? 'dark' : 'light';
        setTheme(newTheme);
    });
  });
}

// -------------------------------
// 5. Google Translate Logic
// -------------------------------
function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function customizeGoogleTranslate() {
    const styleId = 'custom-google-translate-style';
    const iframeDesktop = document.querySelector('#google_translate_element_desktop iframe');
    const iframeMobile = document.querySelector('#google_translate_element_mobile iframe');

    const css = `
        /* HIDE GOOGLE BRANDING */
        .goog-logo-link, .goog-te-gadget-icon {
            display: none !important;
        }
        /* CONTAINER STYLE */
        .goog-te-gadget-simple {
            background-color: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        /* TEXT STYLE */
        .goog-te-menu-value, .goog-te-menu-value span, .goog-te-menu-value-inner {
            font-family: ${getCssVar('--font-nav')} !important;
            color: ${getCssVar('--cw-text')} !important;
            font-size: 1rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            text-decoration: none !important;
            background: none !important;
        }
        .goog-te-menu-value:hover {
            color: ${getCssVar('--cw-accent')} !important;
        }
        /* ARROW STYLE */
        .goog-te-gadget-simple .goog-te-menu-value span[style="color: rgb(125, 125, 125);"] {
            color: ${getCssVar('--cw-accent-alt')} !important;
        }
    `;

    const applyStyles = (iframe) => {
        if (!iframe) return;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        let style = doc.getElementById(styleId);
        if (!style) {
            style = doc.createElement('style');
            style.id = styleId;
            doc.head.appendChild(style);
        }
        style.textContent = css;
    };
    
    applyStyles(iframeDesktop);
    applyStyles(iframeMobile);
}

function initGoogleTranslate() {
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'th,de,zh-CN', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element_desktop');
    new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'th,de,zh-CN', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element_mobile');
    
    // Use an observer to apply styles once the iframe is ready
    const observer = new MutationObserver(() => {
        customizeGoogleTranslate();
    });
    const desktopEl = document.getElementById('google_translate_element_desktop');
    const mobileEl = document.getElementById('google_translate_element_mobile');
    if(desktopEl) observer.observe(desktopEl, { childList: true });
    if(mobileEl) observer.observe(mobileEl, { childList: true });
  };

  const gtScript = document.createElement('script');
  gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  gtScript.async = true;
  document.head.appendChild(gtScript);
}

// -------------------------------
// 6. Initialize after partials
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const partials = [
      loadPartial('nav-placeholder', '/partials/nav.html'),
      loadPartial('footer-placeholder', '/partials/footer.html')
  ];

  Promise.all(partials).then(() => {
      initThemeSlider();
      initGoogleTranslate();
  });
});
''