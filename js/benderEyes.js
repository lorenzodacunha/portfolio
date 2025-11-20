const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

let svgRoot = null;
let eyeGroups = [];
const isEyeGroupVisibleMap = new Map();
const pointerPosition = { x: null, y: null };
let pendingFrame = null;

function cacheEyes() {
  if (!svgRoot) {
    svgRoot = document.querySelector('svg');
  }
  if (!eyeGroups.length) {
    eyeGroups = Array.from(document.querySelectorAll('.eyeGroup'));
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const eyeGroup = entry.target;
    isEyeGroupVisibleMap.set(eyeGroup, entry.isIntersecting);
  });
}, observerOptions);

function observeEyes() {
  cacheEyes();
  eyeGroups.forEach(eyeGroup => {
    if (!isEyeGroupVisibleMap.has(eyeGroup)) {
      observer.observe(eyeGroup);
      isEyeGroupVisibleMap.set(eyeGroup, true);
    }
  });
}

observeEyes();

function renderEyes() {
  pendingFrame = null;
  observeEyes();
  if (!svgRoot || !eyeGroups.length || pointerPosition.x === null || pointerPosition.y === null) {
    return;
  }
  const isMobile = window.innerWidth <= 750;
  const lerpFactor = isMobile ? 0.5 : 0.1;

  eyeGroups.forEach(eyeGroup => {
    if (!isEyeGroupVisibleMap.get(eyeGroup)) return;
    const eye = eyeGroup.querySelector('.eye');
    const pupil = eyeGroup.querySelector('.pupil');
    if (!eye || !pupil) return;
    const eyeRadius = parseFloat(eye.getAttribute('r'));
    const pupilSize = parseFloat(pupil.getAttribute('width')) / 2;
    const svgPoint = svgRoot.createSVGPoint();
    svgPoint.x = pointerPosition.x;
    svgPoint.y = pointerPosition.y;
    const pointTransformed = svgPoint.matrixTransform(eyeGroup.getScreenCTM().inverse());
    const eyeCenterX = parseFloat(eye.getAttribute('cx'));
    const eyeCenterY = parseFloat(eye.getAttribute('cy'));
    const dx = pointTransformed.x - eyeCenterX;
    const dy = pointTransformed.y - eyeCenterY;
    const angle = Math.atan2(dy, dx);
    const maxPupilMovement = eyeRadius - pupilSize - 10;
    const distance = Math.min(maxPupilMovement, Math.sqrt(dx * dx + dy * dy));
    const targetX = eyeCenterX + distance * Math.cos(angle);
    const targetY = eyeCenterY + distance * Math.sin(angle);
    const currentX = parseFloat(pupil.getAttribute('x')) + pupilSize || eyeCenterX;
    const currentY = parseFloat(pupil.getAttribute('y')) + pupilSize || eyeCenterY;
    const smoothX = currentX + (targetX - currentX) * lerpFactor;
    const smoothY = currentY + (targetY - currentY) * lerpFactor;
    pupil.setAttribute('x', smoothX - pupilSize);
    pupil.setAttribute('y', smoothY - pupilSize);
  });
}

export function benderEyes(event) {
  const pointer = event?.touches?.[0] || event;
  if (!pointer || typeof pointer.clientX !== 'number' || typeof pointer.clientY !== 'number') {
    return;
  }
  pointerPosition.x = pointer.clientX;
  pointerPosition.y = pointer.clientY;

  if (!pendingFrame) {
    pendingFrame = requestAnimationFrame(renderEyes);
  }
}

document.addEventListener('mousemove', benderEyes);
document.addEventListener('touchmove', benderEyes);
