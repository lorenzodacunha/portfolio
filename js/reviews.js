import { getCurrentLang, getTranslations } from './translation.js';

export async function initializeReviews() {
    const loading = document.getElementById('reviews-loading');
    const container = document.getElementById('reviews');
    loading.hidden = true;
    container.innerHTML = '';
    container.innerHTML = `
      <div class="review-item card-template loading">
          <div class="review-header">
              <div class="review-project loading">Projeto de modificação</div>
              <div class="review-user">
                  <div class="review-photo loading"></div>
                  <a class="client-name loading " href="https://www.workana.com/"
                      target="_blank">Nome Sobrenome</a>
                  <div class="review-stars loading">★★★★★</div>
              </div>
          </div>
          <div class="review-description">
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
          </div>
          <div class="review-footer">
              <a class="workana-logo loading" href="https://www.workana.com/" target="_blank">
                  Workana </a>
          </div>
      </div>
      <div class="review-item card-template loading">
          <div class="review-header">
              <div class="review-project loading">Projeto de modificação</div>
              <div class="review-user">
                  <div class="review-photo loading"></div>
                  <a class="client-name loading " href="https://www.workana.com/"
                      target="_blank">Nome Sobrenome</a>
                  <div class="review-stars loading">★★★★★</div>
              </div>
          </div>
          <div class="review-description">
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
          </div>
          <div class="review-footer">
              <a class="workana-logo loading" href="https://www.workana.com/" target="_blank">
                  Workana </a>
          </div>
      </div>
      <div class="review-item card-template loading">
          <div class="review-header">
              <div class="review-project loading">Projeto de modificação</div>
              <div class="review-user">
                  <div class="review-photo loading"></div>
                  <a class="client-name loading " href="https://www.workana.com/"
                      target="_blank">Nome Sobrenome</a>
                  <div class="review-stars loading">★★★★★</div>
              </div>
          </div>
          <div class="review-description">
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
          </div>
          <div class="review-footer">
              <a class="workana-logo loading" href="https://www.workana.com/" target="_blank">
                  Workana </a>
          </div>
      </div>
      <div class="review-item card-template loading">
          <div class="review-header">
              <div class="review-project loading">Projeto de modificação</div>
              <div class="review-user">
                  <div class="review-photo loading"></div>
                  <a class="client-name loading " href="https://www.workana.com/"
                      target="_blank">Nome Sobrenome</a>
                  <div class="review-stars loading">★★★★★</div>
              </div>
          </div>
          <div class="review-description">
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
              <div class="card-line loading">Lorem Ipsum is simply dummy text </div>
          </div>
          <div class="review-footer">
              <a class="workana-logo loading" href="https://www.workana.com/" target="_blank">
                  Workana </a>
          </div>
      </div>
    `;
    loading.hidden = false;

    try {
        const lang = getCurrentLang();
        const file = lang === 'en'
            ? 'data/reviews/reviews-en.json'
            : lang === 'es'
                ? 'data/reviews/reviews-es.json'
                : 'data/reviews/reviews.json';
        const response = await fetch(file);
        const data = await response.json();
        const translations = getTranslations();

        setTimeout(() => {
            loading.hidden = true;
            container.innerHTML = '';
            data.reviews.forEach(review => {
                const el = document.createElement('div');
                el.classList.add('review-item', 'card-template');
                const stars = '<i class="fa-solid fa-star"></i>'.repeat(review.rating) + '<i class="fa-regular fa-star"></i>'.repeat(5 - review.rating);
                el.innerHTML = DOMPurify.sanitize(`
                    <div class="review-header">
                      <div class="review-project">${review.projectName}</div>
                      <div class="review-user">
                          <img class="review-photo" src="${review.clientPhoto}" alt="${review.clientName}">
                          <div class="review-client">
                            <a class="client-name" href="${review.clientProfileLink}" target="_blank">${review.clientName}</a>
                            <div class="review-stars" aria-label="${translations['review-item'].rating}: ${review.rating}">${stars}</div>
                          </div>
                      </div>
                    </div>
                    <p class="review-description">"${review.description}"</p>
                    <div class="review-footer">
                        <a class="workana-logo" href="${review.sourceLink}" target="_blank">
                            <img src="${review.sourceLogo}" alt="${review.source}">
                        </a>
                    </div>
                `);
                const clientLink = el.querySelector('.client-name');
                const sourceLink = el.querySelector('.workana-logo');
                clientLink.setAttribute('target', '_blank');
                sourceLink.setAttribute('target', '_blank');
                container.appendChild(el);
            });
            setTimeout(() => {
                document.querySelectorAll('.review-item').forEach(item => item.classList.add('loaded'));
            }, 100);
        }, 500);
    } catch (error) {
        console.error('Erro ao carregar os depoimentos:', error);
        loading.hidden = true;
        container.innerHTML = '<p>Erro ao carregar os depoimentos.</p>';
    }
}
document.addEventListener('languageChanged', initializeReviews);
