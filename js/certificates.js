import { getCurrentLang, getTranslations } from './translation.js';

export async function initializeCertificates() {
    const loading = document.getElementById('certification-loading');
    const conteudo = document.getElementById('certifications');
    loading.hidden = true
    conteudo.innerHTML = '';
    const translations = getTranslations();
    conteudo.innerHTML = `
        <div class="certification-item card-template loading">
            <div class="card-min-thumb loading"></div>
            <h3 class="card-title certification-title loading">titulo</h3>
            <div class="card-out-description">
                <div class="card-line loading">
                    <b>${translations['certification-item'].issued}:</b><span>Instituicao</span><br>
                </div>
                <div class="card-line loading">
                    <b>Tipo:</b><span>Tipo</span><br>
                </div>
                <div class="card-line loading">
                    <b>${translations['certification-item'].validity}:</b><span>1000 horas</span><br>
                </div>
                <div class="card-line loading">
                    <b>Status:</b><span>Concluido</span><br>
                </div>
            </div>
            <div class="card-buttons">
                <button class="download-button tooltip loading" aria-label="Ver certificado">
                    <span class="tooltip-text">Ver certificado</span>
                </button>
            </div>
        </div>
        <div class="certification-item card-template loading">
            <div class="card-min-thumb loading"></div>
            <h3 class="card-title certification-title loading">titulo</h3>
            <div class="card-out-description">
                <div class="card-line loading">
                    <b>${translations['certification-item'].issued}:</b><span>Instituicao</span><br>
                </div>
                <div class="card-line loading">
                    <b>Tipo:</b><span>Tipo</span><br>
                </div>
                <div class="card-line loading">
                    <b>${translations['certification-item'].validity}:</b><span>1000 horas</span><br>
                </div>
                <div class="card-line loading">
                    <b>Status:</b><span>Concluido</span><br>
                </div>
            </div>
            <div class="card-buttons">
                <button class="download-button tooltip loading" aria-label="Ver certificado">
                    <span class="tooltip-text">Ver certificado</span>
                </button>
            </div>
        </div>
        <div class="certification-item card-template loading">
            <div class="card-min-thumb loading"></div>
            <h3 class="card-title certification-title loading">titulo</h3>
            <div class="card-out-description">
                <div class="card-line loading">
                    <b>${translations['certification-item'].issued}:</b><span>Instituicao</span><br>
                </div>
                <div class="card-line loading">
                    <b>Tipo:</b><span>Tipo</span><br>
                </div>
                <div class="card-line loading">
                    <b>${translations['certification-item'].validity}:</b><span>1000 horas</span><br>
                </div>
                <div class="card-line loading">
                    <b>Status:</b><span>Concluido</span><br>
                </div>
            </div>
            <div class="card-buttons">
                <button class="download-button tooltip loading" aria-label="Ver certificado">
                    <span class="tooltip-text">Ver certificado</span>
                </button>
            </div>
        </div>
        <div class="certification-item card-template loading">
            <div class="card-min-thumb loading"></div>
            <h3 class="card-title certification-title loading">titulo</h3>
            <div class="card-out-description">
                <div class="card-line loading">
                    <b>${translations['certification-item'].issued}:</b><span>Instituicao</span><br>
                </div>
                <div class="card-line loading">
                    <b>Tipo:</b><span>Tipo</span><br>
                </div>
                <div class="card-line loading">
                    <b>${translations['certification-item'].validity}:</b><span>1000 horas</span><br>
                </div>
                <div class="card-line loading">
                    <b>Status:</b><span>Concluido</span><br>
                </div>
            </div>
            <div class="card-buttons">
                <button class="download-button tooltip loading" aria-label="Ver certificado">
                    <span class="tooltip-text">Ver certificado</span>
                </button>
            </div>
        </div>
        <div class="certification-item card-template loading">
            <div class="card-min-thumb loading"></div>
            <h3 class="card-title certification-title loading">titulo</h3>
            <div class="card-out-description">
                <div class="card-line loading">
                    <b>${translations['certification-item'].issued}:</b><span>Instituicao</span><br>
                </div>
                <div class="card-line loading">
                    <b>Tipo:</b><span>Tipo</span><br>
                </div>
                <div class="card-line loading">
                    <b>${translations['certification-item'].validity}:</b><span>1000 horas</span><br>
                </div>
                <div class="card-line loading">
                    <b>Status:</b><span>Concluido</span><br>
                </div>
            </div>
            <div class="card-buttons">
                <button class="download-button tooltip loading" aria-label="Ver certificado">
                    <span class="tooltip-text">Ver certificado</span>
                </button>
            </div>
        </div>
    `;
    loading.hidden = false
    try {
        const lang = getCurrentLang();
        const file = lang === 'en'
            ? 'data/certificates/certificates-en.json'
            : lang === 'es'
                ? 'data/certificates/certificates-es.json'
                : 'data/certificates/certificates.json';
        const response = await fetch(file);
        const certificados = await response.json();
        setTimeout(() => {
            const loading = document.getElementById('certification-loading');
            const certificadosCont = document.getElementById('certifications');
            loading.hidden = true;
            certificadosCont.innerHTML = '';
            certificados['certificados'].forEach((certificado, index) => {
                const projectElement = document.createElement('div');
                projectElement.classList.add('certification-item', 'card-template');
                projectElement.innerHTML = DOMPurify.sanitize(`
                <div class="card-min-thumb"><img width="auto" height="50px" src="${certificado.thumb}" alt="Imagem do certificado ${certificado.title}"> </div>
                <h3 class="card-title certification-title">${certificado.title}</h3>
                <div class="card-out-description">
                    <div class="card-line"><b>${translations['certification-item'].issued}:</b><span> ${certificado.institution}</span><br></div>
                    <div class="card-line"><b>${translations['certification-item'].type}:</b><span> ${certificado.type}</span><br></div>
                    <div class="card-line"><b>${translations['certification-item'].validity}:</b><span> ${certificado.workload}</span><br></div>
                    <div class="card-line">
                        <b>Status:</b>
                        <span class="${certificado.status ? 'finished' : 'in-progress'}">
                            ${certificado.status ? translations['certification-item'].completed : translations['certification-item']['in-progress']}
                        </span><br>
                    </div>
                </div>
                <div class="card-buttons">
                    ${certificado.status && certificado.certificationUrl && certificado.certificationUrl.trim() !== ''
                        ? `<a target="_blank" href="${certificado.certificationUrl}" aria-label="Abrir o certificado">
                            <button class="fa-solid fa-download download-button tooltip" aria-label="Abrir o certificado">
                                <span class="tooltip-text">Ver certificado</span>
                            </button>
                            </a>`
                        : `<button class="fa-solid fa-download download-button tooltip disabled" aria-label="Certificado indisponível" disabled>
                            <span class="tooltip-text">Certificado indisponível</span>
                            </button>`
                    }
                </div>
            `);
                certificadosCont.appendChild(projectElement);
            });
            certificadosCont.classList.remove('no-scroll');
            setTimeout(() => {
                document.querySelectorAll('.certification-item').forEach(item => item.classList.add('loaded'));
            }, 100);
        }, 500);
    } catch (error) {
        console.error('Erro ao carregar os certificados:', error);
        loading.hidden = true;
        conteudo.innerHTML = '<p>Erro ao carregar os certificados. Tente novamente mais tarde.</p>';
    }
}
document.addEventListener('languageChanged', initializeCertificates);
