import { updateModalIconsTheme } from './modal.js';

export function switchMode() {
    const themeSwitch = document.getElementById('theme-switch');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function setInitialTheme() {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.classList.toggle('light-theme', currentTheme === 'light');
            themeSwitch.checked = currentTheme === 'light';
        } else if (prefersDarkScheme.matches) {
            document.documentElement.classList.remove('dark-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            themeSwitch.checked = true;
        }
    }

    function toggleTheme(isLightTheme) {
        document.documentElement.classList.toggle('light-theme', isLightTheme);
        localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
        updateModalIconsTheme();
    }

    prefersDarkScheme.addEventListener('change', (event) => {
        const isDarkMode = event.matches;
        toggleTheme(!isDarkMode); 
        themeSwitch.checked = !isDarkMode;
    });

    setInitialTheme();

    themeSwitch.addEventListener('change', () => {
        toggleTheme(themeSwitch.checked);
    });
}
  