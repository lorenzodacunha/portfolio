export function setupProgressBar(containerElement, initialPercentage, type = 'skill', index = 0) {
  const isMobile = window.innerWidth <= 750;

  const limits = {
    skill: {
      desktop: { min: 4, max: 96 },
      mobile: { min: 24, max: 94 },
    },
    project: {
      desktop: { min: 2.4, max: 97.4 },
      mobile: { min: 24, max: 96 },
    },
  };

  const { min: minWidth, max: maxWidth } = isMobile
    ? limits[type]?.mobile || limits.skill.mobile
    : limits[type]?.desktop || limits.skill.desktop;

  const progressBar = containerElement.classList.contains('progress-bar')
    ? containerElement
    : containerElement.querySelector('.progress-bar');
  const progressFill =
    containerElement.querySelector('.progress-fill') ||
    progressBar?.querySelector('.progress-fill');
  const marker =
    containerElement.querySelector('.progress-marker') ||
    progressBar?.querySelector('.progress-marker');
  if (!progressBar || !progressFill || !marker) return;

  let isDragging = false;
  let dragOffset = 0;
  const originalWidth = Math.max(minWidth, Math.min(maxWidth, parseFloat(initialPercentage)));

  // Cache marker width to avoid repeated layout reads
  const markerOffset = marker.offsetWidth / 2;

  function updateMarkerPosition(widthPercentage) {
    marker.style.left = `calc(${widthPercentage}% - ${markerOffset}px)`;
  }

  progressFill.style.transition = 'none';
  marker.style.transition = 'none';
  const startWidth = minWidth;
  progressFill.style.width = `${startWidth}%`;
  updateMarkerPosition(startWidth);
  const delay = index % 2 === 0 ? 200 : 400;

  function animateToOriginal() {
    progressFill.style.transition = 'width 1s ease';
    marker.style.transition = 'left 1s ease';
    progressFill.style.width = `${originalWidth}%`;
    updateMarkerPosition(originalWidth);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(animateToOriginal, delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(progressBar);

  // Cache bounding rect to avoid forced reflow during drag
  let progressBarRect = progressBar.getBoundingClientRect();

  function startDrag(e) {
    isDragging = true;
    progressFill.style.transition = 'none';
    marker.style.transition = 'none';
    progressBarRect = progressBar.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const markerRect = marker.getBoundingClientRect();
    dragOffset = clientX - (markerRect.left + markerRect.width / 2);
  }

  function drag(e) {
    if (!isDragging) return;
    const rect = progressBarRect;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    let newWidth = ((clientX - dragOffset - rect.left) / rect.width) * 100;
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    progressFill.style.width = `${newWidth}%`;
    updateMarkerPosition(newWidth);
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    progressFill.style.transition = 'width 0.3s ease';
    marker.style.transition = 'left 0.3s ease';
    progressFill.style.width = `${originalWidth}%`;
    updateMarkerPosition(originalWidth);
  }

  // Update cached rect on resize to keep values accurate
  window.addEventListener('resize', () => {
    progressBarRect = progressBar.getBoundingClientRect();
  });

  marker.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  marker.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', endDrag);
}
