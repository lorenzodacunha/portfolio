
const rotateWords = [
  "Portfólio Lorenzo da Cunha",
  "Dev Front-End",
  "Dev Shopify",
  "UI Designer"
];
const fullTitle = "Portfólio Lorenzo da Cunha Dev Front-End | Dev Shopify & UI Designer";
const saudadeMessage = "Ei, volta aqui 👀";
let wordIndex = 0;
let titleTimeout;
const defaultIcon = "/assets/icons/favicon.svg";
const blurIcon = "/assets/icons/favicon-blur.svg";
const faviconLink = document.getElementById('favicon');
function clearTimers() {
  clearTimeout(titleTimeout);
}

function setFavicon(path) {
  faviconLink.type = path.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  faviconLink.href = path;
}

function startTitleCycle() {
  clearTimers();
  wordIndex = 0;
  showNextWord();
}

function showNextWord() {
  document.title = rotateWords[wordIndex];
  wordIndex++;
  if (wordIndex < rotateWords.length) {
    titleTimeout = setTimeout(showNextWord, 2000);
  } else {
    document.title = fullTitle;
    titleTimeout = setTimeout(showFullTitleOnce, 2000);
  }
}

function showFullTitleOnce() {
  let i = 0;
  const length = fullTitle.length;
  function step() {
    document.title = fullTitle.slice(i) + ' ' + fullTitle.slice(0, i);
    i++;
    if (i <= length) {
      titleTimeout = setTimeout(step, 100);
    } else {
      startTitleCycle();
    }
  }
  step();
}

function showSaudadeThenLoop() {
  clearTimers();
  setFavicon(blurIcon);
  document.title = saudadeMessage;
  titleTimeout = setTimeout(startTitleCycle, 5000);
}

document.addEventListener('visibilitychange', () => {
  clearTimers();
  if (document.hidden) {
    showSaudadeThenLoop();
  } else {
    setFavicon(defaultIcon);
    startTitleCycle();
  }
});

export function guideanimation() {
  setFavicon(defaultIcon);
  startTitleCycle();
}