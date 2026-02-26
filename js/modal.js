import { removerAcentuacao, showPopup } from './functions.js';
import { getIconMarkup } from './icons.js';
import { setupProgressBar } from './progressBar.js';
import { getCurrentLang, getTranslations } from './translation.js';

let swiper = null;
let currentProjectImages = [];
let currentImageIndex = 0;
let shareInProgress = false;
let miniModalPendingResolver = null;
const ADULT_BYPASS_PARAM = 'adult_bypass';
const ADULT_BLOCK_PARAM = 'adult_blocked';
const ADULT_GATE_MESSAGE =
  'O conteúdo a seguir não é destinado para menores de 18 anos ou pode ser sensível para algumas pessoas.';
const ADULT_BLOCKED_MESSAGE = 'Você não tem idade suficiente para abrir este conteúdo';
const ADULT_BYPASS_MESSAGE = 'Agora você pode abrir projetos +18';

function normalizeLegacySlug(title) {
  return removerAcentuacao(String(title || '')).replace(/\s+/g, '-').toLowerCase();
}

function findProjectByIdOrSlug(projetos, projectId, fallbackSlug) {
  if (projectId) {
    for (const categoria of Object.keys(projetos)) {
      const index = projetos[categoria].findIndex((projeto) => String(projeto.id || '') === String(projectId));
      if (index >= 0) {
        return { categoria, index, projeto: projetos[categoria][index] };
      }
    }
  }

  if (fallbackSlug) {
    const normalizedSlug = String(fallbackSlug || '').toLowerCase();
    for (const categoria of Object.keys(projetos)) {
      const index = projetos[categoria].findIndex(
        (projeto) => normalizeLegacySlug(projeto.title) === normalizedSlug
      );
      if (index >= 0) {
        return { categoria, index, projeto: projetos[categoria][index] };
      }
    }
  }

  return null;
}

function abrirMiniModal() {
  const miniModal = document.getElementById('mini-modal');
  if (!miniModal) return;
  miniModal.classList.remove('hidden');

  setTimeout(() => {
    miniModal.classList.add('loaded');
  }, 100);
}

function fecharMiniModal() {
  const miniModal = document.getElementById('mini-modal');
  if (!miniModal) return;
  miniModal.classList.remove('loaded');

  setTimeout(() => {
    miniModal.classList.add('hidden');
  }, 100);

  if (miniModalPendingResolver) {
    const resolve = miniModalPendingResolver;
    miniModalPendingResolver = null;
    resolve(false);
  }

}

function updateUrlState({
  projectId = '',
  legacySlug = '',
  clearProject = false,
  adultState = 'keep',
  replace = false,
} = {}) {
  const url = new URL(window.location.href);

  if (clearProject) {
    url.searchParams.delete('id');
    url.searchParams.delete('projeto');
  } else if (projectId) {
    url.searchParams.set('id', projectId);
    url.searchParams.delete('projeto');
  } else if (legacySlug) {
    url.searchParams.set('projeto', legacySlug);
    url.searchParams.delete('id');
  }

  if (adultState === 'bypass') {
    url.searchParams.set(ADULT_BYPASS_PARAM, '1');
    url.searchParams.delete(ADULT_BLOCK_PARAM);
  } else if (adultState === 'blocked') {
    url.searchParams.set(ADULT_BLOCK_PARAM, '1');
    url.searchParams.delete(ADULT_BYPASS_PARAM);
  } else if (adultState === 'clear') {
    url.searchParams.delete(ADULT_BYPASS_PARAM);
    url.searchParams.delete(ADULT_BLOCK_PARAM);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', nextUrl);
}

function getAdultAccessStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hasBypass = params.get(ADULT_BYPASS_PARAM) === '1';
  const hasBlock = params.get(ADULT_BLOCK_PARAM) === '1';
  if (hasBypass) return 'bypass';
  if (hasBlock) return 'blocked';
  return 'unknown';
}

function openAdultGateModal() {
  const miniModal = document.getElementById('mini-modal');
  const title = document.getElementById('mini-modal-title');
  const message = document.getElementById('mini-modal-message');
  const cancelButton = document.getElementById('mini-modal-cancel');
  const confirmButton = document.getElementById('mini-modal-confirm');
  const closeButtons = miniModal ? miniModal.querySelectorAll('.close-button-mini') : [];

  if (!miniModal || !cancelButton || !confirmButton) {
    return Promise.resolve(false);
  }

  if (title) {
    title.textContent = 'Conteudo sensivel (+18)';
  }
  if (message) {
    message.textContent = ADULT_GATE_MESSAGE;
  }

  return new Promise((resolve) => {
    let resolved = false;

    const finalize = (allowed) => {
      if (resolved) return;
      resolved = true;
      if (miniModalPendingResolver === finalize) {
        miniModalPendingResolver = null;
      }
      cancelButton.onclick = null;
      confirmButton.onclick = null;
      closeButtons.forEach((button) => {
        button.onclick = null;
      });
      fecharMiniModal();
      resolve(allowed);
    };

    cancelButton.onclick = () => {
      updateUrlState({ adultState: 'blocked', replace: true });
      showPopup(ADULT_BLOCKED_MESSAGE, true);
      finalize(false);
    };

    confirmButton.onclick = () => {
      updateUrlState({ adultState: 'bypass', replace: true });
      showPopup(ADULT_BYPASS_MESSAGE);
      finalize(true);
    };

    closeButtons.forEach((button) => {
      button.onclick = () => finalize(false);
    });

    miniModalPendingResolver = finalize;
    abrirMiniModal();
  });
}

async function ensureAdultAccess(projeto) {
  if (!projeto || !Boolean(projeto.adult)) {
    return true;
  }

  const state = getAdultAccessStateFromUrl();
  if (state === 'bypass') {
    return true;
  }
  if (state === 'blocked') {
    showPopup(ADULT_BLOCKED_MESSAGE, true);
    return false;
  }

  return openAdultGateModal();
}

function closeProjectModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('loaded');

  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    updateUrlState({ clearProject: true, replace: true });
    const bar = document.querySelector('.card-icons-modal .modal-progress-bar');
    if (bar) bar.remove();
  }, 300);

  if (swiper) {
    swiper.destroy(true, false);
    swiper = null;
  }
}

function closeImageModal() {
  const imageModal = document.getElementById('imageModal');
  imageModal.classList.remove('loaded');

  setTimeout(() => {
    imageModal.classList.add('hidden');
  }, 100);
}

async function shareProject(projectLink, title) {
  const data = {
    title: title || 'Veja este projeto',
    text: 'Confira este projeto incr\u00edvel do meu portf\u00f3lio!',
    url: projectLink
  };

  if (shareInProgress) return;
  shareInProgress = true;
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      await navigator.share(data);
    } else {
      throw new Error('Fallback to copy');
    }
  } catch {
    const tryExecCopy = () => {
      const tempInput = document.createElement('textarea');
      tempInput.value = projectLink;
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      document.body.appendChild(tempInput);
      tempInput.select();
      const success = document.execCommand('copy');
      tempInput.remove();
      return success;
    };

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(projectLink);
        showPopup('Link copiado');
      } else if (tryExecCopy()) {
        showPopup('Link copiado ');
      } else {
        throw new Error('copy failed');
      }
    } catch (err) {
      if (!tryExecCopy()) {
        showPopup('Erro ao copiar', true);
      } else {
        showPopup('Link copiado');
      }
    }
  } finally {
    shareInProgress = false;
  }
}

function openModalImage(index) {
  const isMobile = window.innerWidth <= 750;

  if (isMobile) {
    const downloadLink = document.createElement('a');
    const imageSrc = currentProjectImages[index];
    downloadLink.href = imageSrc;
    downloadLink.download = imageSrc.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } else {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeButtons = document.querySelectorAll('.close-modal');
    const imageSearch = document.getElementById('image-search');
    const prevBtn = imageModal.querySelector('.image-button-prev');
    const nextBtn = imageModal.querySelector('.image-button-next');
    const arrowButtons = [prevBtn, nextBtn];

    if (currentProjectImages.length <= 1) {
      arrowButtons.forEach(btn => btn.classList.add('hidden'));
    } else {
      arrowButtons.forEach(btn => btn.classList.remove('hidden'));
    }

    currentImageIndex = index;

    const updateImage = () => {
      const src = currentProjectImages[currentImageIndex];
      modalImage.src = src;
      imageSearch.textContent = "Imagens/" + src;
    };

    updateImage();
    imageModal.classList.remove('hidden');

    setTimeout(() => {
      imageModal.classList.add('loaded');
    }, 100);

    prevBtn.onclick = () => {
      currentImageIndex = (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
      updateImage();
    };

    nextBtn.onclick = () => {
      currentImageIndex = (currentImageIndex + 1) % currentProjectImages.length;
      updateImage();
    };

    closeButtons.forEach(button => {
      button.onclick = closeImageModal;
    });

    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        closeImageModal();
      }
    });
  }
}

function closeModalDetect() {
  document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', closeProjectModal);
  });

  document.getElementById('modal').addEventListener('click', (event) => {
    const modalContent = document.querySelector('.window-modal');
    if (!modalContent.contains(event.target)) {
      closeProjectModal();
    }
  });

}

async function openModalInternal(categoria, index, projectId = '', fallbackSlug = '') {
  const modal = document.getElementById('modal');
  const modalTitle = document.querySelector('.modal-title h1, .modal-title h2');
  const modalDescription = document.getElementById('project-description');
  const modalIcons = document.querySelector('.project-tecnologies');
  const modalShareButton = document.getElementById('share-button');
  const modalVerProjeto = document.getElementById('modal-redirect');
  const modalInitialDate = document.querySelector('.modal-date-start');
  const modalEndDate = document.querySelector('.modal-date-end');
  const guideName = document.querySelector('.project-guide');
  let swiperWrapper = document.querySelector('.swiper-wrapper');
  if (!swiperWrapper) {
    const swiperContainer = document.querySelector('.swiper-container');
    swiperWrapper = document.createElement('div');
    swiperWrapper.classList.add('swiper-wrapper');
    swiperContainer && swiperContainer.appendChild(swiperWrapper);
  }
  const searchBar = document.getElementById('modal-search');
  const modalShare = document.querySelector('.modal-social');
  const modalGithubAnchor = modalShare.querySelector('a:nth-child(1)');
  const modalGithubButton = modalGithubAnchor.querySelector('button');
  const modalLinkedinAnchor = modalShare.querySelector('a:nth-child(2)');
  const modalLinkedinButton = modalLinkedinAnchor.querySelector('button');
  const modalReviews = document.querySelector('.modal-reviews')
  const modalSlider = document.querySelector('.modal-slider')
  const modalTecnologies = document.querySelector('.project-tecnologies')
  const modalCompabilities = document.querySelector('.project-compatibilities')
  const pc2 = document.querySelector('.pc2');
  const pc3 = document.querySelector('.pc3');

  if (pc2.classList.contains('hidden')) {
    pc2.classList.remove('hidden');
  }

  if (pc3.classList.contains('hidden')) {
    pc3.classList.remove('hidden');
  }

  if (modalShare.classList.contains('hidden')) {
    modalCompabilities.classList.remove('hidden');
    modalSlider.classList.remove('hidden');
    modalShare.classList.remove('hidden');
    modalReviews.classList.remove('hidden');
    modalTecnologies.classList.remove('margin-left');
  }

  try {
    const lang = getCurrentLang();
    const translations = getTranslations();
    const file = lang === 'en' ? 'data/projects/projects-en.json' : lang === 'es' ? 'data/projects/projects-es.json' : 'data/projects/projects.json';
    const response = await fetch(file);
    const projetos = await response.json();
    let selectedCategory = categoria;
    let selectedIndex = index;

    if (projectId || fallbackSlug) {
      const located = findProjectByIdOrSlug(projetos, projectId, fallbackSlug);
      if (located) {
        selectedCategory = located.categoria;
        selectedIndex = located.index;
      }
    }

    const projeto = projetos[selectedCategory]?.[selectedIndex];
    if (!projeto) {
      throw new Error('Projeto nao encontrado para abrir no modal.');
    }
    const canOpenAdultContent = await ensureAdultAccess(projeto);
    if (!canOpenAdultContent) {
      return;
    }
    const finalProjectId = String(projeto.id || '').trim();
    const legacySlug = normalizeLegacySlug(projeto.title);
    const iconsTranslation = translations?.['icons-items'] || {
      mobile: 'Compatível com Mobile',
      tablet: 'Compatível com Tablet',
      desktop: 'Compatível com Desktop'
    };

    const modalSocialTranslation = translations?.['modal-social'] || {
      project: 'Projeto',
      peek: 'Espiar',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      'no-link': 'Sem link'
    };

    const pc1Tooltip = document.querySelector('.pc1 .tooltip-text');
    if (pc1Tooltip) pc1Tooltip.textContent = iconsTranslation.mobile;

    const pc2Tooltip = document.querySelector('.pc2 .tooltip-text');
    if (pc2Tooltip) pc2Tooltip.textContent = iconsTranslation.tablet;

    const pc3Tooltip = document.querySelector('.pc3 .tooltip-text');
    if (pc3Tooltip) pc3Tooltip.textContent = iconsTranslation.desktop;
    const baseModal = translations?.search?.paths?.projectsRoot || 'Portfolio/projetos/';
    searchBar.textContent = `${baseModal}${selectedCategory}/${removerAcentuacao(projeto.title)}`;

    if (projeto.compatibility == 1) {
      pc3.classList.add('hidden');
      pc2.classList.add('hidden');
    } else if (projeto.compatibility == 2) {
      pc3.classList.add('hidden');
    }

    const updateCTAButton = (anchor, button, url) => {
      let span = button.querySelector('.tooltip-text');

      if (url && url.trim()) {
        if (span) span.remove();
        button.classList.remove('tooltip');
        anchor.href = url;
        button.disabled = false;
        button.classList.remove('disabled');
      } else {
        if (!span) {
          span = document.createElement('span');
          span.className = 'tooltip-text';
          button.appendChild(span);
        }
        button.classList.add('tooltip');
        anchor.removeAttribute('href');
        button.disabled = true;
        button.classList.add('disabled');
        span.textContent = modalSocialTranslation['no-link'];
      }
    };

    const modalCTAButton = modalVerProjeto.querySelector('button');
    modalCTAButton.innerHTML = projeto.developed
      ? '<i class="fa-solid fa-link"></i> ' + modalSocialTranslation.project
      : '<i class="fa-solid fa-eye-low-vision"></i> ' + modalSocialTranslation.peek;

    updateCTAButton(modalVerProjeto, modalCTAButton, projeto.projectUrlLink);
    const updateSocialButton = (anchor, button, url, tooltipText) => {
      let span = button.querySelector('.tooltip-text');

      if (!span) {
        span = document.createElement('span');
        span.className = 'tooltip-text';
        button.appendChild(span);
      }

      button.classList.add('tooltip');

      if (url && url.trim()) {
        anchor.href = url;
        button.disabled = false;
        button.classList.remove('disabled');
        span.textContent = tooltipText;
      } else {
        anchor.removeAttribute('href');
        button.disabled = true;
        button.classList.add('disabled');
        span.textContent = modalSocialTranslation['no-link'];
      }
    };
    updateSocialButton(modalGithubAnchor, modalGithubButton, projeto.githubUrlLink, modalSocialTranslation.github);
    updateSocialButton(modalLinkedinAnchor, modalLinkedinButton, projeto.linkedinUrlLink, modalSocialTranslation.linkedin);
    guideName.textContent = removerAcentuacao(projeto.title) + '.html';
    modalInitialDate.textContent = projeto.initialDate;
    modalEndDate.textContent = projeto.endDate;
    modalTitle.textContent = projeto.title;
    modalDescription.innerHTML = DOMPurify.sanitize(projeto.description);
    const isDarkTheme = !document.documentElement.classList.contains('light-theme');
    modalIcons.innerHTML = DOMPurify.sanitize(projeto.icons.map(icon => `
            <li class="icon-item tooltip">
                ${getIconMarkup(icon.class, isDarkTheme)}
                <span class="tooltip-text">${icon.tooltip}</span>
            </li>
        `).join(''));
    const cardIcons = document.querySelector('.card-icons-modal');
    if (!projeto.developed) {
      const progress = document.createElement('div');
      progress.className = 'icons-Items progress-bar modal-progress-bar';
      progress.innerHTML = `
            <div class="modal-progress-bar-text">Progresso </div>
            <span class="progress-marker tooltip">
              <span class="tooltip-text">${projeto.developingPorcentage}%</span>
            </span>
            <div class="progress-fill" style="width: 0;">
              <div data-i18n="" class="level-label">${projeto.developingPorcentage}%</div>
            </div>`;
      cardIcons.appendChild(progress);
      setupProgressBar(progress, projeto.developingPorcentage, 'project');
    } else {
      const existing = document.querySelector('.card-icons-modal .progress-bar');
      if (existing) existing.remove();
    }

    currentProjectImages = projeto.images;

    swiperWrapper.innerHTML = '';
    projeto.images.forEach((image, idx) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.innerHTML = DOMPurify.sanitize(`
            <img class="expand" src="${image}" alt="Imagem do projeto ${projeto.title}">
            <button class="expand-button expand fa-solid fa-up-right-and-down-left-from-center tooltip"><span class="tooltip-text">Expandir</span></button>
            `);
      if (!projeto.developed) {
        const overlay = document.createElement('div');
        overlay.className = 'developing-slide-overlay';
        overlay.innerHTML = DOMPurify.sanitize(`
                <i class='developing-icon fa-regular fa-eye-slash'></i>
                <h3 class='developing-title'>Em desenvolvimento</h3>
                <p class='developing-text'>Acompanhe o progresso do projeto dando uma espiadinha 👀</p>
                <div class="developing-buttons">
                  <button class='peek-button'>Espiar</button>
                </div>
              `);
        slide.appendChild(overlay);
        const peek = overlay.querySelector('.peek-button');
        peek.addEventListener('click', (e) => {
          e.stopPropagation();
          overlay.classList.add('developing-slide-hidden');
        });
        slide.addEventListener('mouseleave', () => {
          overlay.classList.remove('developing-slide-hidden');
        });
      }
      swiperWrapper.appendChild(slide);

      const expandButton = slide.querySelectorAll('.expand');
      expandButton.forEach(button => {
        button.addEventListener('click', () => {
          openModalImage(idx);
        });
      });
    });

    if (projeto.images.length === 1) {
      modalSlider.classList.add('single-image');
    } else {
      modalSlider.classList.remove('single-image');
    }

    const swiperOptions = {
      centeredSlides: true,
      spaceBetween: 0,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: true,
      },
    };

    if (projeto.images.length === 1) {
      delete swiperOptions.autoplay;
    }

    swiper = new Swiper('.swiper-container', swiperOptions);
    modalShareButton.onclick = () => shareProject(window.location.href, projeto.title);
    modal.classList.remove('hidden');
    const mobile = window.innerWidth <= 750;
    const modalContent = modal.querySelector('.modal-content');

    if (mobile && modalContent) {
      modalContent.scrollTop = 0;
    }

    document.body.classList.add('no-scroll');

    setTimeout(() => {
      modal.classList.add('loaded');
    }, 100);
    updateUrlState({
      projectId: finalProjectId,
      legacySlug,
      replace: false,
    });
  } catch (error) {
    console.error('Erro ao carregar os modais', error);
  }
}

export async function openModal(categoria, index) {
  return openModalInternal(categoria, index);
}

export async function openModalById(projectId, options = {}) {
  const fallbackSlug = options?.fallbackSlug || '';
  return openModalInternal('', -1, projectId, fallbackSlug);
}

export function updateModalIconsTheme() {
  const icons = document.querySelectorAll('.project-tecnologies img');
  const isDarkTheme = !document.documentElement.classList.contains('light-theme');

  icons.forEach(img => {
    const baseSrc = img.src.replace('-w.svg', '.svg');
    img.src = isDarkTheme ? baseSrc.replace('.svg', '-w.svg') : baseSrc;
  });
}

function setupModalKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (!['Escape', 'Enter', ' '].includes(e.key)) return;

    const active = document.activeElement.tagName;

    if (active === 'INPUT' || active === 'TEXTAREA') return;

    const modals = [
      { el: document.getElementById('imageModal'), close: closeImageModal },
      { el: document.getElementById('mini-modal'), close: fecharMiniModal },
      { el: document.getElementById('modal'), close: closeProjectModal }
    ];

    for (const m of modals) {
      if (m.el && !m.el.classList.contains('hidden')) {
        m.close();
        break;
      }
    }
  });
}

closeModalDetect();
setupModalKeyboardShortcuts();
