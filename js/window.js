import { initializeCertificates } from './certificates.js';
import { loadProjects } from './projects.js';
import { initializeSkills } from './skills.js';
import { initializeReviews } from './reviews.js';

export function allWindowReload() {
    document.querySelectorAll('.window-reload').forEach(button => {
        button.addEventListener('click', () => {
            const loadingElement = button.closest('.window-search').nextElementSibling.querySelector('.window-loading');
            const actualButton = document.querySelector('.sb-active');
            const newButton = document.querySelector('.sidebar-Btn');

            loadingElement.classList.remove('hidden');
            setTimeout(() => {
                loadingElement.classList.add('loaded')
            }, 100);

            if (button.closest('.window-search').nextElementSibling.querySelector('.projects-Content')) {
                setTimeout(() => {
                    actualButton.classList.remove('sb-active');
                    newButton.classList.add('sb-active');
                    loadProjects('front-end');
                }, 300);
            };

            if (button.closest('.window-search').nextElementSibling.querySelector('.certification-content')) {
                setTimeout(() => {
                    initializeCertificates();
                }, 300);
            };

            if (button.closest('.window-search').nextElementSibling.querySelector('.reviews-content')) {
                setTimeout(() => {
                    initializeReviews();
                }, 300);
            };

            if (button.closest('.window-search').nextElementSibling.querySelector('.skill-content')) {
                setTimeout(() => {
                    initializeSkills();
                }, 300);
            };

            loadingElement.classList.remove('loaded')
            setTimeout(() => {
                loadingElement.classList.remove('loaded');
                setTimeout(() => {
                    loadingElement.classList.add('hidden');
                }, 100);
            }, 500);
        });
    });
}