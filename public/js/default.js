// Script for handling the burger menu
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('nav');

    burgerMenu.addEventListener('click', function() {
        navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close the menu when a link is clicked
    navMenu.addEventListener('click', function() {
        navMenu.style.display = 'none';
    });
});
