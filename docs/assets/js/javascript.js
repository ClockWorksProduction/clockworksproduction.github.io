/* Sidebar Toggle */
function toggleSidebar() {
  const sidebar = document.getElementById("mobileSidebar");
  sidebar.classList.toggle("sidebar-open");
  sidebar.classList.toggle("sidebar-closed");
}

/* Theme Toggle (optional) */
function setTheme(mode) {
  document.documentElement.classList.remove("theme-light", "theme-dark");
  document.documentElement.classList.add(mode);
  localStorage.setItem("cw-theme", mode);
}

/* Auto-load theme */
(function() {
  const saved = localStorage.getItem("cw-theme");
  if (saved) document.documentElement.classList.add(saved);
})();
