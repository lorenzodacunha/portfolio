import { typingEffect } from './functions.js';
import { initializeSkills } from './skills.js';

export let currentLang = 'pt';
let currentTranslations = {};
let applyingTranslations = false;

export function getCurrentLang() { return currentLang; }
export function getTranslations() { return currentTranslations; }

export async function loadTranslations(lang) {
  try {
    const path = `locales/${lang}.json`;
    const response = await fetch(path);
    if (!response.ok) throw new Error('Erro ao carregar o arquivo de tradução.');
    const translations = await response.json();

    currentTranslations = translations;
    applyTranslations(currentTranslations);

    if (translations?.window?.description?.roles?.length) {
      typingEffect(translations.window.description.roles);
    }

    initializeSkills(translations);

  } catch (error) {
    console.error(error);
    if (lang !== 'pt') {
      return loadTranslations('pt');
    }
  }
}

export function applyTranslations(translations) {
  applyingTranslations = true;
  const allowedTags = ['b', 'i', 'strong', 'em', 'br', 'u'];

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const value = getNestedTranslation(translations, key);

    if (value) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;

      tempDiv.querySelectorAll('*').forEach(node => {
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
          node.replaceWith(...node.childNodes);
        }
      });

      element.innerHTML = tempDiv.innerHTML;
    }
  });
  applyingTranslations = false;
}

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function reapplyTranslations() {
  if (Object.keys(currentTranslations).length) {
    applyTranslations(currentTranslations);
  }
}

const observer = new MutationObserver((mutations) => {
  if (applyingTranslations) return;
  for (const mutation of mutations) {
    if ([...mutation.addedNodes].some(node =>
      node.nodeType === 1 && (node.hasAttribute('data-i18n') || node.querySelector('[data-i18n]')))) {
      reapplyTranslations();
      break;
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, { childList: true, subtree: true });
});


export function setLanguageButton(flag, lang) {
  const languageButton = document.getElementById('language-button');
  languageButton.innerHTML = `<span class="flag">${flag}</span> ${lang.toUpperCase()} <i id="lang-arrow" class="fa-solid fa-chevron-down"></i>`;
}

export async function changeLanguage(lang) {
  const languageOptions = document.querySelectorAll('#language-options button');
  const currentLangButton = document.querySelector(`[data-lang="${lang}"]`);

  languageOptions.forEach(option => option.classList.remove('hidden'));

  if (currentLangButton) currentLangButton.classList.add('hidden');

  switch (lang) {
    case 'en':
      setLanguageButton('<img class="us-flag-svg" width="22px"  height="22px" src="assets/icons/us.svg" alt="USA Flag svg">', 'EN');
      break;
    case 'es':
      setLanguageButton('<img class="es-flag-svg" width="22px"  height="22px" src="assets/icons/es.svg" alt="Spain Flag svg">', 'ES');
      break;
    case 'pt':
      setLanguageButton('<img class="br-flag-svg" width="22px"  height="22px" src="assets/icons/br.svg" alt="Brazil Flag svg">', 'BR');
      break;
  }

  currentLang = lang;
  await loadTranslations(lang);
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

export async function initializeTranslation() {
  const languageButton = document.getElementById('language-button');
  const languageOptions = document.getElementById('language-options');

  const userLanguage = navigator.language || navigator.userLanguage;
  const defaultLanguage = userLanguage.startsWith('pt') ? 'pt' :
    userLanguage.startsWith('es') ? 'es' : 'en';

  setLanguageButton(defaultLanguage === 'pt' ? '<img class="br-flag-svg" width="22px"  height="22px" src="assets/icons/br.svg" alt="Brasil Flag svg">' :
    defaultLanguage === 'es' ? '<img class="es-flag-svg" width="22px"  height="22px" src="assets/icons/es.svg" alt="Spain Flag svg">' :
      '<img class="us-flag-svg" width="22px"  height="22px" src="assets/icons/us.svg" alt="USA Flag svg">',
    defaultLanguage === 'pt' ? 'BR' :
      defaultLanguage === 'es' ? 'ES' : 'EN');

  currentLang = defaultLanguage;
  await loadTranslations(defaultLanguage);
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: defaultLanguage }));

  document.querySelector(`[data-lang="${defaultLanguage}"]`).classList.add('hidden');

  languageButton.addEventListener('click', () => {
    languageOptions.classList.toggle('close');
    setTimeout(() => {
      languageOptions.classList.toggle('active');
      languageButton.classList.toggle('active');
    }, 300);
  });

  document.addEventListener('click', (event) => {
    if (!document.querySelector('.language-selector').contains(event.target)) {
      languageOptions.classList.add('close');
      languageOptions.classList.remove('active');
      setTimeout(() => {
        languageButton.classList.remove('active');
      }, 300);
    }
  });

  document.querySelectorAll('#language-options button').forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.getAttribute('data-lang');
      changeLanguage(lang);
      languageOptions.classList.add('close');
      languageOptions.classList.remove('active');
      setTimeout(() => {
        languageButton.classList.remove('active');
      }, 300);
    });
  });
}