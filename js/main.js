import { initializeTranslation } from './translation.js';
import { switchMode } from './switchMode.js';
import { hamburguerMenu, smoothScrollWithOffset, navbarEffects, hamburnavbarEffectsMobile } from './navbar.js';
import { benderEyes } from './benderEyes.js';
import { initializeProjects } from './projects.js';
import { allWindowReload } from './window.js';
import { initializeSkills, setupSkillsUI } from './skills.js';
import { initializeCertificates } from './certificates.js';
import { initializeReviews } from './reviews.js';
import { initializeSecurity } from './security.js';
import { guideanimation } from './guide.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initializeTranslation();
  setupSkillsUI();
  navbarEffects();
  switchMode();
  hamburguerMenu();
  benderEyes({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
  initializeProjects();
  allWindowReload();
  initializeCertificates();
  initializeReviews();
  smoothScrollWithOffset();
  hamburnavbarEffectsMobile();
  initializeSecurity();
  guideanimation();
});
