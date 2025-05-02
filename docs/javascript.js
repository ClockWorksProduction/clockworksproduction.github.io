/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// this one is jut to wait for the page to load
function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
  
}

// JavaScript to toggle between themes
const themeStylesheet = document.getElementById('theme');
let currentTheme = 'light'; // Default to light theme

function toggleTheme() {
  const body = document.body;
  const themeToggleButtons = document.querySelectorAll('#theme-toggle-nav, #theme-toggle-side');
  
    if (theme === 'dark') {
      themeStylesheet.href = 'light-theme.css';
      body.style.backgroundColor = '#ffffff'; // Light mode background
      currentTheme = 'light';
    } else {
      themeStylesheet.href = 'dark-theme.css';
      body.style.backgroundColor = '#1e1e1e'; // Dark mode background
      currentTheme = 'dark';
    }
    themeToggleButtons.forEach(button => {
      button.textContent = currentTheme === 'dark' ? 'LIGHT' : 'DARK'; // Update button text
    });
  }

// Set the initial theme on page load
document.addEventListener('DOMContentLoaded', () => {
  setTheme(currentTheme); // Set the initial theme
});
