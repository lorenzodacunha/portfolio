const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

let isEyeGroupVisibleMap = new Map();
const eyeGroupMatrixMap = new Map();
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const eyeGroup = entry.target;
    isEyeGroupVisibleMap.set(eyeGroup, entry.isIntersecting);
  });
}, observerOptions);

document.querySelectorAll('.eyeGroup').forEach(eyeGroup => {
  observer.observe(eyeGroup);
  isEyeGroupVisibleMap.set(eyeGroup, true);
  eyeGroupMatrixMap.set(eyeGroup, eyeGroup.getScreenCTM().inverse());
});

// Recalculate matrices on resize to keep positions accurate
window.addEventListener('resize', () => {
  document.querySelectorAll('.eyeGroup').forEach(eyeGroup => {
    eyeGroupMatrixMap.set(eyeGroup, eyeGroup.getScreenCTM().inverse());
  });
});

// Track viewport size without triggering layout
const mobileQuery = window.matchMedia('(max-width: 750px)');
let isMobile = mobileQuery.matches;
mobileQuery.addEventListener('change', e => {
  isMobile = e.matches;
});

export function benderEyes(event) {
  if (!event || !event.clientX || !event.clientY) {
    return;
  }
  const svgRoot = document.querySelector('svg');
  const eyes = document.querySelectorAll('.eyeGroup');
  eyes.forEach(eyeGroup => {
    if (!isEyeGroupVisibleMap.get(eyeGroup)) return;
    const eye = eyeGroup.querySelector('.eye');
    const pupil = eyeGroup.querySelector('.pupil');
    const eyeRadius = parseFloat(eye.getAttribute('r'));
    const pupilSize = parseFloat(pupil.getAttribute('width')) / 2;
    const svgPoint = svgRoot.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    const ctm = eyeGroupMatrixMap.get(eyeGroup);
    const pointTransformed = svgPoint.matrixTransform(ctm);
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
    const lerpFactor = isMobile ? 0.5 : 0.1;
    const smoothX = currentX + (targetX - currentX) * lerpFactor;
    const smoothY = currentY + (targetY - currentY) * lerpFactor;
    pupil.setAttribute('x', smoothX - pupilSize);
    pupil.setAttribute('y', smoothY - pupilSize);
  });
}

document.addEventListener('mousemove', benderEyes);
document.addEventListener('touchmove', benderEyes);
