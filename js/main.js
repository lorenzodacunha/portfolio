import { getTranslations, initializeTranslation } from './translation.js';
import { switchMode } from './switchMode.js';
import { hamburguerMenu, smoothScrollWithOffset, navbarEffects, hamburnavbarEffectsMobile } from './navbar.js';
import { benderEyes } from './benderEyes.js';
import { allWindowReload } from './window.js';
import { initializeSecurity } from './security.js';
import { guideanimation } from './guide.js';

function initializeWhenNear(sectionId, initializer) {
  const section = document.getElementById(sectionId);
  if (!section || typeof IntersectionObserver === 'undefined') {
    initializer();
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    currentObserver.disconnect();
    initializer();
  }, { rootMargin: '250px 0px' });

  observer.observe(section);
}

document.addEventListener('DOMContentLoaded', async () => {
  const translationReady = initializeTranslation();
  navbarEffects();
  switchMode();
  hamburguerMenu();
  allWindowReload();
  smoothScrollWithOffset();
  hamburnavbarEffectsMobile();
  initializeSecurity();
  guideanimation();

  await translationReady;
  initializeWhenNear('projects', async () => {
    const { initializeProjects } = await import('./projects.js');
    initializeProjects();
  });
  initializeWhenNear('skills', async () => {
    const { initializeSkills, setupSkillsUI } = await import('./skills.js');
    setupSkillsUI();
    initializeSkills(getTranslations());
  });
  initializeWhenNear('certificates', async () => {
    const { initializeCertificates } = await import('./certificates.js');
    initializeCertificates();
  });
  initializeWhenNear('depoiments', async () => {
    const { initializeReviews } = await import('./reviews.js');
    initializeReviews();
  });
});
