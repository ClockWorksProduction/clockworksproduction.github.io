/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// this one is jut to wait for the page to load
localStorage.setItem('theme', 'deafult.css');

document.addEventListener('DOMContentLoaded', () => {

    const themeStylesheet = document.getElementById('theme');
    const themeToggleLarge = document.getElementById('theme-toggle-large');
    const themeToggleMedium = document.getElementById('theme-toggle-medium');
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');
    if(storedTheme){
        themeStylesheet.href = storedTheme;
    }

    themeToggleLarge.addEventListener('click', () => {
        // if it's light -> go dark
        if(themeStylesheet.href.includes('light')){
            themeStylesheet.href = 'dark-theme.css';
            themeToggle.innerText = 'LIGHT';
        } else {
            // if it's dark -> go light
            themeStylesheet.href = 'light-theme.css';
            themeToggle.innerText = 'DARK';
        }
        // save the preference to localStorage
        localStorage.setItem('theme',themeStylesheet.href);
    });

    themeToggle.addEventListener('click', () => {
        // if it's light -> go dark
        if(themeStylesheet.href.includes('light')){
            themeStylesheet.href = 'dark-theme.css';
            themeToggle.innerText = 'LIGHT';
        } else {
            // if it's dark -> go light
            themeStylesheet.href = 'light-theme.css';
            themeToggle.innerText = 'DARK';
        }
        // save the preference to localStorage
        localStorage.setItem('theme',themeStylesheet.href);
    });

    themeToggle.addEventListener('click', () => {
        // if it's light -> go dark
        if(themeStylesheet.href.includes('light')){
            themeStylesheet.href = 'dark-theme.css';
            themeToggle.innerText = 'LIGHT';
        } else {
            // if it's dark -> go light
            themeStylesheet.href = 'light-theme.css';
            themeToggle.innerText = 'DARK';
        }
        // save the preference to localStorage
        localStorage.setItem('theme',themeStylesheet.href);
    });

    button.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }
});
