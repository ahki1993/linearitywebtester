/**
 * CAROUSEL MANAGER
 * Gestione carosello strategie interattivo
 */

class CarouselManager {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.track = null;
        this.slides = [];
        this.indicators = [];
        this.autoplayInterval = null;
        this.autoplayDelay = 5000;
    }
    
    init() {
        this.track = document.getElementById('carousel-track');
        if (!this.track) return;
        
        this.slides = Array.from(this.track.children);
        this.totalSlides = this.slides.length;
        this.indicators = Array.from(document.querySelectorAll('.indicator'));
        
        this.setupNavigation();
        this.setupIndicators();
        this.setupStrategyButtons();
        this.setupTouchEvents();
        
        // Mostra la slide centrale (medium risk) all'inizio
        this.goToSlide(1);
        
        if (window.Debug) window.Debug.log('info', 'Carosello inizializzato');
    }
    
    setupNavigation() {
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
    }
    
    setupIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    }
    
    setupStrategyButtons() {
        const detailButtons = document.querySelectorAll('.strategy-details-btn');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const strategy = btn.getAttribute('data-strategy');
                this.showStrategyDetails(strategy);
            });
        });
    }
    
    setupTouchEvents() {
        let startX = 0;
        let currentX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', () => {
            const diff = startX - currentX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;
        
        this.currentSlide = index;
        const offset = -index * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        
        this.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }
    
    nextSlide() {
        const next = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(next);
    }
    
    previousSlide() {
        const prev = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prev);
    }
    
    showStrategyDetails(strategy) {
        if (!window.CONFIG.strategies || !window.CONFIG.strategies[strategy]) return;
        
        const strategyData = window.CONFIG.strategies[strategy];
        const lang = window.CONFIG.currentLanguage;
        
        const modalBody = document.getElementById('strategy-modal-body');
        modalBody.innerHTML = `
            <div class="strategy-details">
                <div class="strategy-header">
                    <h2>${strategyData.name[lang]}</h2>
                    <p class="tagline">${strategyData.tagline[lang]}</p>
                </div>
                <div class="strategy-description">
                    <p>${strategyData.description[lang]}</p>
                </div>
                <div class="strategy-metrics">
                    <div class="metric">
                        <span class="label">${getTranslation('strategy_return')}</span>
                        <span class="value">${strategyData.return}</span>
                    </div>
                    <div class="metric">
                        <span class="label">${getTranslation('strategy_drawdown')}</span>
                        <span class="value">${strategyData.drawdown}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Min. Investment:</span>
                        <span class="value">${strategyData.minInvestment}</span>
                    </div>
                </div>
                <div class="strategy-features">
                    <h3>Features:</h3>
                    <ul>
                        ${strategyData.features.map(f => `<li>${f[lang]}</li>`).join('')}
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="window.location.href='#contact'">
                    ${getTranslation('header_cta')}
                </button>
            </div>
        `;
        
        const modal = document.getElementById('strategy-modal');
        modal.classList.add('active');
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => modal.classList.remove('active');
        closeBtn.onclick = closeModal;
        overlay.onclick = closeModal;
    }
}

// NOTA: Inizializzazione spostata in strategies-carousel.js
// Il nuovo sistema genera dinamicamente le card e gestisce la navigazione
// window.Carousel = new CarouselManager();
