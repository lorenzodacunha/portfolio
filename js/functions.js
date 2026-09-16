export function removerAcentuacao(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();;

}

let typingTimeout;
let typingEffectActive = false;
let activeTypingWords = '';
let typingRunId = 0;

export function typingEffect(words = [], language = '') {
  const typingText = document.getElementById('typing-text');
  if (!typingText) {
    console.warn('typingEffect: elemento #typing-text não encontrado.');
    return;
  }

  const normalizedWords = words.filter(word => typeof word === 'string' && word.length);
  const wordsSignature = JSON.stringify([language, normalizedWords]);
  if (typingEffectActive && activeTypingWords === wordsSignature) return;

  clearTimeout(typingTimeout);
  const currentRunId = ++typingRunId;
  typingEffectActive = false;
  activeTypingWords = wordsSignature;

  if (!normalizedWords.length) {
    typingText.textContent = '';
    return;
  }

  let wordIndex = 0;
  let letterIndex = 0;
  let isDeleting = true;
  let speed = 150;

  typingText.textContent = normalizedWords[0];
  letterIndex = normalizedWords[0].length;
  typingEffectActive = true;

  function scheduleNext(delay) {
    typingTimeout = setTimeout(() => {
      if (currentRunId !== typingRunId) return;
      typeEffect();
    }, delay);
  }

  function typeEffect() {
    if (currentRunId !== typingRunId) return;

    if (isDeleting && letterIndex > 0) {
      typingText.textContent = normalizedWords[wordIndex].substring(0, letterIndex - 1);
      letterIndex--;
      speed = 25;
    } else if (!isDeleting && letterIndex < normalizedWords[wordIndex].length) {
      typingText.textContent = normalizedWords[wordIndex].substring(0, letterIndex + 1);
      letterIndex++;
      speed = 50;
    }

    if (!isDeleting && letterIndex === normalizedWords[wordIndex].length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % normalizedWords.length;
      speed = 500;
    }

    scheduleNext(speed);
  }

  scheduleNext(1200);
}
export function showPopup(message, isError = false) {
  const popup = document.createElement('div');
  popup.className = 'copy-popup';
  popup.innerHTML = `${isError ? '<i class="svg-icon icon-close" aria-hidden="true"></i>' : '<i class="svg-icon icon-check" aria-hidden="true"></i>'} ${message}`;
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('active'));
  setTimeout(() => {
    popup.classList.remove('active');
    setTimeout(() => popup.remove(), 400);
  }, 2500);
}
