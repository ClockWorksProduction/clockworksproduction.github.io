/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// this one is jut to wait for the page to load
localStorage.setItem('theme', 'deafult.css');
function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
}

// JavaScript to toggle between themes
const themeToggleButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-side, #theme-toggle-large, #theme-toggle-medium');
const themeStylesheet = document.getElementById('theme');
let currentTheme = 'light'; // Default to light theme

// Function to set the theme
function setTheme(theme) {
    if (theme === 'dark') {
        themeStylesheet.href = 'dark-theme.css';
        currentTheme = 'dark';
    } else {
        themeStylesheet.href = 'light-theme.css';
        currentTheme = 'light';
    }
}

themeToggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (currentTheme === 'light') {
          setTheme('dark');
          button.textContent = 'LIGHT'; // Change the button text to 'LIGHT'
      } else {
          setTheme('light');
          button.textContent = 'DARK'; // Change the button text back to 'DARK'
      }
    });
});
