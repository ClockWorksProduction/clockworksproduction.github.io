/* common js
================================================== */

/* navaigation and footer */
document.addEventListener("DOMContentLoaded", () => {

  // Load footer
  fetch('/partials/footer.html')
    .then(response => response.text())
    .then(data => {
      const footer = document.getElementById('footer-placeholder');
      if (footer) footer.innerHTML = data;
    });

  // Load navbar
  fetch('/partials/nav.html')
    .then(response => response.text())
    .then(data => {
      const nav = document.getElementById('nav-placeholder');
      if (nav) nav.innerHTML = data;
    });

});


