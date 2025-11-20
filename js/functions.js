export function removerAcentuacao(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();;

}

let typingTimeout;
let typingEffectActive = false;

export function typingEffect(words = []) {
  const typingText = document.getElementById('typing-text');
  if (!typingText) {
    console.warn('typingEffect: elemento #typing-text não encontrado.');
    return;
  }

  if (typingEffectActive) {
    clearTimeout(typingTimeout);
    typingEffectActive = false;
  }

  let wordIndex = 0;
  let letterIndex = 0;
  let isDeleting = true;
  let speed = 150;

  if (words.length) {
    typingText.textContent = words[0];
    letterIndex = words[0].length;
  }

  function typeEffect() {
    typingEffectActive = true;
    if (!words[wordIndex]) return;

    if (isDeleting && letterIndex > 0) {
      typingText.textContent = words[wordIndex].substring(0, letterIndex - 1);
      letterIndex--;
      speed = 25;
    } else if (!isDeleting && letterIndex < words[wordIndex].length) {
      typingText.textContent = words[wordIndex].substring(0, letterIndex + 1);
      letterIndex++;
      speed = 50;
    }

    if (!isDeleting && letterIndex === words[wordIndex].length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 500;
    }

    typingTimeout = setTimeout(typeEffect, speed);
  }

  typingTimeout = setTimeout(typeEffect, 1200);
}
export function showPopup(message, isError = false) {
  const popup = document.createElement('div');
  popup.className = 'copy-popup';
  popup.innerHTML = `${isError ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-check"></i>'} ${message}`;
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('active'));
  setTimeout(() => {
    popup.classList.remove('active');
    setTimeout(() => popup.remove(), 400);
  }, 2500);
}
