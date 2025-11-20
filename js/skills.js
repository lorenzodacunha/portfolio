import { applyTranslations } from './translation.js';
import { getIconMarkup } from './icons.js';
import { setupProgressBar } from './progressBar.js';

function changeDisplayMode(mode) {
    const skillItems = document.querySelector('.skill-items');
    const gridButton = document.getElementById('grid-view');
    const scrollButton = document.getElementById('scroll-view');
    if (!skillItems || !gridButton || !scrollButton) return;

    const defaultMode = skillItems.classList.contains('scroll-view') ? 'scroll' : 'grid';
    const currentMode = skillItems.dataset.displayMode || defaultMode;

    if (currentMode !== mode) {
        if (mode === 'grid') {
            skillItems.classList.remove('scroll-view');
            skillItems.classList.add('grid-view');
        } else if (mode === 'scroll') {
            skillItems.classList.remove('grid-view');
            skillItems.classList.add('scroll-view');
        }
        skillItems.dataset.displayMode = mode;
    }

    document.querySelectorAll('.display-icon').forEach(icon => {
        icon.classList.remove('display-active');
    });

    document.querySelectorAll('.display-icon svg .icon-color').forEach(icon => {
        icon.classList.remove('icon-active');
    });

    const activeButton = mode === 'grid' ? gridButton : scrollButton;
    activeButton.classList.add('display-active');
    activeButton.querySelectorAll('svg .icon-color').forEach(icon => {
        icon.classList.add('icon-active');
    });
}

function setupDisplayMode() {
    document.getElementById('grid-view').addEventListener('click', () => {
        changeDisplayMode('grid');
    });

    document.getElementById('scroll-view').addEventListener('click', () => {
        changeDisplayMode('scroll');
    });
}

function handleResponsiveDisplay(event) {
    const isMobile = typeof event?.matches === 'boolean'
        ? event.matches
        : window.innerWidth < 550;
    if (isMobile) {
        changeDisplayMode('scroll');
    }
}

export async function initializeSkills(translations) {
    const loading = document.getElementById('skills-loading');
    const conteudo = document.getElementById('skills');
    loading.hidden = true;
    conteudo.innerHTML = '';
    conteudo.innerHTML = DOMPurify.sanitize(`
    <div class="card-pair">
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-pair">
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-pair">
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-pair">
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-pair">
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
        <div class="skill-item card-template loading">
            <div class="skill-header">
                <div class="icon-item loading"></div>
                <h3 class="skill-title loading">Small text</h3>             
            </div>
            <div class="skill-level">
                <div class="progress-bar">
                    <div class="level-label"></div>
                    <span class="progress-marker loading"></span>
                    <div class="progress-fill loading" style="width: 96%;">
                    </div>
                </div>
            </div>
        </div>
    </div>
    `);
    loading.hidden = false
    try {
        const response = await fetch('data/skills.json');
        const habilidades = await response.json();

        setTimeout(() => {
            const loading = document.getElementById('skills-loading');
            const conteudo = document.getElementById('skills');
            loading.hidden = true;
            conteudo.innerHTML = '';
            let pairContainer = null;
            const progressBarInitQueue = [];

            habilidades['habilidades'].forEach((habilidade, index) => {
                const skillId = `skill-${index}`;
                if (index % 2 === 0) {
                    pairContainer = document.createElement('div');
                    pairContainer.classList.add('card-pair');
                    conteudo.appendChild(pairContainer);
                }

                const levelMap = {
                    'inicial': 'initial',
                    'médio': 'intermediate',
                    'medio': 'intermediate',
                    'avançado': 'advanced',
                    'advanced': 'advanced'
                };

                const levelKey = levelMap[habilidade.level.toLowerCase()] || habilidade.level.toLowerCase();
                const translatedLevel = translations?.levels?.[levelKey] || habilidade.level;
                const projectElement = document.createElement('div');
                projectElement.classList.add('skill-item', 'card-template');
                projectElement.id = skillId;
                const iconHTML = getIconMarkup(habilidade.icon);
                projectElement.innerHTML = DOMPurify.sanitize(`
                    <div class="skill-header">
                        <div class="icon-item">${iconHTML}</div>
                        <h3 class="skill-title">${habilidade.name}</h3>
                    </div>
                    <div class="skill-level" id="html-skill">
                        <div class="progress-bar">
                        <span class="progress-marker tooltip">
                            <span class="tooltip-text">${habilidade.porcentage}%</span>
                        </span>
                        <div class="progress-fill" style="width: 0;">
                            <div class="level-label" data-i18n="levels.${levelKey}">${translatedLevel}</div>
                        </div>
                        </div>
                    </div>`);
                pairContainer.appendChild(projectElement);
                progressBarInitQueue.push({
                    element: projectElement,
                    percentage: habilidade.porcentage,
                    index
                });
            });

            const runProgressSetup = () => {
                progressBarInitQueue.forEach(({ element, percentage, index }) => {
                    setupProgressBar(element, percentage, 'skill', index);
                });
            };

            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(runProgressSetup);
            } else {
                setTimeout(runProgressSetup, 0);
            }

            setTimeout(() => {
                document.querySelectorAll('.skill-item').forEach(item => item.classList.add('loaded'));
                applyTranslations(translations);
            }, 100);
        }, 500);

    } catch (error) {
        console.error('Erro ao carregar as Habilidades:', error);
        loading.hidden = true;
        conteudo.innerHTML = '<p>Erro ao carregar as habilidades. Tente novamente mais tarde.</p>';
    }
}

export function setupSkillsUI() {
    setupDisplayMode();
    const mobileQuery = window.matchMedia('(max-width: 549px)');
    handleResponsiveDisplay(mobileQuery);
    mobileQuery.addEventListener('change', handleResponsiveDisplay);
}
