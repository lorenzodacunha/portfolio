export function initializeSecurity() {
  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('contextmenu', e => e.preventDefault());
  });

  const contact = document.querySelector('.contact-section');
  if (contact) contact.classList.add('allow-select');
}
