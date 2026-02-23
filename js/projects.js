import { openModal, openModalById } from './modal.js';
import { removerAcentuacao } from './functions.js';
import { getIconMarkup } from './icons.js';
import { getCurrentLang, getTranslations } from './translation.js';

const buttons = document.querySelectorAll('.sidebar-Btn, .sidebar-Btn-Icon');
const sidebar = document.querySelector('.projects-Sidebar');
const closeButton = document.querySelector('.sidebar-Btn-Close');
const sidebarTexts = document.querySelectorAll('.sidebar-Btn-Text, .sidebar-Tittle');
const sidebarRelative = document.querySelector('.sidebar-relative');
const ALL_PROJECTS_CATEGORY = 'all-projects';
const PREFERRED_ALL_ORDER = ['web-designer', 'front-end', 'ui-design'];

function getProjectEntries(projetos, categoria) {
    if (categoria !== ALL_PROJECTS_CATEGORY) {
        const list = Array.isArray(projetos[categoria]) ? projetos[categoria] : [];
        return list.map((projeto, index) => ({ projeto, sourceCategory: categoria, sourceIndex: index }));
    }

    const categories = Object.keys(projetos);
    const orderedCategories = [
        ...PREFERRED_ALL_ORDER.filter(category => categories.includes(category)),
        ...categories.filter(category => !PREFERRED_ALL_ORDER.includes(category))
    ];

    return orderedCategories.flatMap(category => {
        const list = Array.isArray(projetos[category]) ? projetos[category] : [];
        return list.map((projeto, index) => ({ projeto, sourceCategory: category, sourceIndex: index }));
    });
}

async function projectUrlDetector() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const nomeDoProjeto = urlParams.get('projeto');

    if (projectId || nomeDoProjeto) {
        try {
            if (projectId) {
                await openModalById(projectId, {
                    fallbackSlug: nomeDoProjeto || '',
                });
                return;
            }
            if (nomeDoProjeto) {
                await openModalById('', {
                    fallbackSlug: nomeDoProjeto,
                });
            }
        } catch (error) {
            console.error('Erro ao carregar o projeto via url', error);
        }
    }
}

function projectButtonOpenModal() {
    document.getElementById('conteudo').addEventListener('click', function (event) {
        const button = event.target.closest('.card-button');
        if (button) {
            const projectId = button.getAttribute('data-project-id') || '';
            const slugFallback = button.getAttribute('data-project-slug') || '';
            if (projectId) {
                openModalById(projectId, { fallbackSlug: slugFallback });
                return;
            }
            const card = button.closest('.project-item');
            if (!card) return;
            const fallbackCategory = document.querySelector('.sidebar-Btn.sb-active').getAttribute('data-category');
            const category = card.getAttribute('data-project-category') || fallbackCategory;
            const index = Number(card.getAttribute('data-project-index'));

            if (!Number.isNaN(index)) {
                openModal(category, index);
                return;
            }

            const fallbackIndex = [...card.parentElement.children].indexOf(card);
            openModal(category, fallbackIndex);
        }
    });
}

function updateClickedCategoryButton() {
    document.querySelectorAll('.sidebar-Btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.sidebar-Btn').forEach(btn => btn.classList.remove('sb-active'));
            this.classList.add('sb-active');
            const categoria = this.getAttribute('data-category');
            loadProjects(categoria);
        });
    });
}

export function initializeProjects() {
    const botaoAtivo = document.querySelector('.sidebar-Btn.sb-active');

    if (botaoAtivo) {
        const categoria = botaoAtivo.getAttribute('data-category');
        loadProjects(categoria);
    }
}

function toggleProjectSidebar() {
    if (sidebar.classList.contains('sb-closed')) {
        sidebar.classList.remove('sb-closed');
        sidebarRelative.classList.remove('sb-closed-Relative');

        if (closeButton.classList.contains('sidebar-Btn-Minimized')) {
            buttons.classList.remove('sidebar-Btn-Minimized');
        }

        if (closeButton.classList.contains('sb-Btn-Rotate')) {
            closeButton.classList.remove('sb-Btn-Rotate');
        }
        sidebarTexts.forEach(text => {
            text.classList.remove('sidebar-Tittle-Hidden')
            buttons.forEach(element => {
                element.classList.remove('sidebar-Btn-Minimized')
            });
        });
    } else {
        sidebar.classList.add('sb-closed');
        closeButton.classList.add('sb-Btn-Rotate');
        sidebarTexts.forEach(text => {
            setTimeout(() => {
                text.classList.add('sidebar-Tittle-Hidden')
                buttons.forEach(element => {
                    element.classList.add('sidebar-Btn-Minimized');
                    sidebarRelative.classList.add('sb-closed-Relative')
                });
            }, 300);
        });
    }
}

export async function loadProjects(categoria) {
    const loading = document.getElementById('projects-loading');
    const conteudo = document.getElementById('conteudo');
    conteudo.classList.add('no-scroll');
    loading.hidden = true
    conteudo.innerHTML = '';
    conteudo.innerHTML = DOMPurify.sanitize(`
    <div class="project-item card-template loading">
        <div class="card-thumb loading"> </div>
        <h3 class="card-title loading">Titulo</h3>
        <div class="card-icons">
            <ul class="icons-Items">
                <li class="icon-item loading">icone 1</li>
                <li class="icon-item loading">icone 2</li>
                <li class="icon-item loading">icone 3</li>
            </ul>
        </div>
        <div class="card-button loading">Ver projeto</div>
    </div>
    <div class="project-item card-template loading">
        <div class="card-thumb loading"> </div>
        <h3 class="card-title loading">Titulo</h3>
        <div class="card-icons">
            <ul class="icons-Items">
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
            </ul>
        </div>
        <div class="card-button loading">Ver projeto</div>
    </div>
    <div class="project-item card-template loading">
        <div class="card-thumb loading"> </div>
        <h3 class="card-title loading">Titulo</h3>
        <div class="card-icons">
            <ul class="icons-Items">
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
            </ul>
        </div>
        <div class="card-button loading">Ver projeto</div>
    </div>
    <div class="project-item card-template loading">
        <div class="card-thumb loading"> </div>
        <h3 class="card-title loading">Titulo</h3>
        <div class="card-icons">
            <ul class="icons-Items">
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
            </ul>
        </div>
        <div class="card-button loading">Ver projeto</div>
    </div>
        <div class="project-item card-template loading">
        <div class="card-thumb loading"> </div>
        <h3 class="card-title loading">Titulo</h3>
        <div class="card-icons">
            <ul class="icons-Items">
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
            </ul>
        </div>
        <div class="card-button loading">Ver projeto</div>
    </div>
        <div class="project-item card-template loading">
        <div class="card-thumb loading"> </div>
        <h3 class="card-title loading">Titulo</h3>
        <div class="card-icons">
            <ul class="icons-Items">
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
                <li class="icon-item loading"></li>
            </ul>
        </div>
        <div class="card-button loading">Ver projeto</div>
    </div>
    `);

    loading.hidden = false;

    try {
        const lang = getCurrentLang();
        const file = lang === "en" ? "data/projects/projects-en.json" : lang === "es" ? "data/projects/projects-es.json" : "data/projects/projects.json";
        const response = await fetch(file);
        const projetos = await response.json();

        setTimeout(() => {
            loading.hidden = true;
            conteudo.classList.remove('no-scroll');
            conteudo.innerHTML = '';

            const searchBar = document.getElementById('project-search');
            const t = getTranslations();
            const base = t?.search?.paths?.projectsCategory || 'Portfolio/projetos/categorias/';
            searchBar.textContent = `${base}${categoria}`;

            const projectEntries = getProjectEntries(projetos, categoria);

            projectEntries.forEach(({ projeto, sourceCategory, sourceIndex }) => {
                const projectElement = document.createElement('div');
                projectElement.classList.add('project-item', 'card-template');
                projectElement.setAttribute('data-project-category', sourceCategory);
                projectElement.setAttribute('data-project-index', String(sourceIndex));

                const badge = !projeto.developed ? `<span class="developing-badge" data-i18n="projects.in_progress">Em desenvolvimento</span>` : '';
                const thumbClass = !projeto.developed ? 'card-thumb developing' : 'card-thumb';

                projectElement.innerHTML = DOMPurify.sanitize(`
                    <div class="${thumbClass}">
                        ${badge}
                        <img width="234px" height="117px" src="${projeto.image}" alt="Thumb do projeto ${projeto.title} desenvolvido por Lorenzo da Cunha">
                    </div>
                    <h3 class="card-title">${projeto.title}</h3>
                    </div>
                    <div class="card-icons">
                        <ul class="icons-Items">
                            ${projeto.icons.map(icon => `
                                <li class="icon-item tooltip">
                                    ${getIconMarkup(icon.class)}
                                    <span class="tooltip-text"> ${icon.tooltip} </span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <button class="card-button" data-project-id="${projeto.id || ''}" data-project-slug="${removerAcentuacao(projeto.title).replace(/\s+/g, '-').toLowerCase()}" data-project-category="${sourceCategory}" data-project-index="${sourceIndex}" data-i18n="projects.see_more"><i class="fa-solid fa-eye"></i>Ver mais</button>
                `);
                conteudo.appendChild(projectElement);
            });

            setTimeout(() => {
                document.querySelectorAll('.project-item').forEach(item => item.classList.add('loaded'));
            }, 100);
        }, 500);
    } catch (error) {
        console.error('Erro ao carregar os projetos:', error);
        loading.hidden = true;
        conteudo.innerHTML = '<p>Erro ao carregar os projetos. Tente novamente mais tarde.</p>';
    }
}
closeButton.addEventListener('click', toggleProjectSidebar);
updateClickedCategoryButton(); projectButtonOpenModal(); projectUrlDetector();
document.addEventListener('languageChanged', () => {
    const active = document.querySelector('.sidebar-Btn.sb-active');
    if (active) loadProjects(active.getAttribute('data-category'));
});

// Finger hint and mobile width
const NUDGE_DISTANCE = 120;
const NUDGE_CYCLES = 2;
const MOBILE_MAX_WIDTH = 768;
const CENTER_SCROLL_DELAY = 500;
let hintTriggered = false;
const section = document.getElementById('projects');
const scrollContainer = document.getElementById('conteudo');
const hint = document.getElementById('swipe-hint');

const isMobile = () => ('ontouchstart' in window) || window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;

function showHint() { hint && hint.classList.add('show'); }

function hideHint() { hint && hint.classList.remove('show'); }

function centerSection() {
    const rect = section.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const target = scrollTop + rect.top - (window.innerHeight - rect.height) / 2;
    window.scrollTo({ top: target, behavior: 'smooth' });
    return new Promise(res => setTimeout(res, CENTER_SCROLL_DELAY));
}

function nudgeScroll() {
    return new Promise(res => {
        const half = CENTER_SCROLL_DELAY / 2;
        let count = 0;
        function cycle() {
            if (count >= NUDGE_CYCLES) return res();
            scrollContainer.scrollBy({ left: NUDGE_DISTANCE, behavior: 'smooth' });
            setTimeout(() => {
                scrollContainer.scrollBy({ left: -NUDGE_DISTANCE, behavior: 'smooth' });
                count++;
                setTimeout(cycle, half);
            }, half);
        }
        cycle();
    });
}

async function triggerFlow() {
    showHint();
    await nudgeScroll();
    hideHint();
}

function onIntersect(entries, obs) {
    entries.forEach(async entry => {
        if (entry.isIntersecting && !hintTriggered) {
            hintTriggered = true;
            obs.unobserve(entry.target);
            await centerSection();
            await triggerFlow();
        }
    });
}

function initSwipeHint() {
    if (!isMobile() || !section || !scrollContainer || !hint) return;
    const observer = new IntersectionObserver(onIntersect, {
        root: null,
        threshold: 0,
        rootMargin: '-40% 0px -40% 0px'
    });
    observer.observe(section);
}
window.addEventListener('load', initSwipeHint);
