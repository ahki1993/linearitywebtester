/**
 * STRATEGIES CAROUSEL - Generazione Dinamica
 * Genera le card del carousel dalle configurazioni strategies.json
 */

class StrategiesCarousel {
    constructor() {
        this.strategies = null;
        this.currentLang = 'it';
        this.currentIndex = 0;
        this.track = null;
        this.slides = [];
        
        this.init();
    }
    
    async init() {
        // Aspetta che CONFIG sia caricato
        if (window.CONFIG && window.CONFIG.strategies) {
            this.strategies = window.CONFIG.strategies;
            this.currentLang = document.documentElement.lang || 'it';
            this.renderCarousel();
            this.setupNavigation();
            this.setupLanguageListener();
        } else {
            // Riprova dopo un po'
            setTimeout(() => this.init(), 100);
        }
    }
    
    getStrategyIcon(risk) {
        const icons = {
            'low': 'fa-shield-alt',
            'medium': 'fa-chart-line',
            'high': 'fa-rocket'
        };
        return icons[risk] || 'fa-chart-line';
    }
    
    renderCarousel() {
        const track = document.getElementById('carousel-track');
        if (!track) return;
        
        this.track = track;
        
        // Ordine delle strategie: low, medium, high
        const order = ['low', 'medium', 'high'];
        
        // Genera HTML per ogni strategia
        const cardsHTML = order.map((strategyKey, index) => {
            const strategy = this.strategies[strategyKey];
            if (!strategy) return '';
            
            const isFeatured = strategyKey === 'medium'; // Medium è il più popolare
            const icon = this.getStrategyIcon(strategy.risk);
            
            // Ottieni i dati localizzati
            const name = strategy.name[this.currentLang] || strategy.name.it;
            const tagline = strategy.tagline[this.currentLang] || strategy.tagline.it;
            const riskLabel = strategy.riskLabel ? 
                (strategy.riskLabel[this.currentLang] || strategy.riskLabel.it) : 
                strategy.risk;
            
            return `
                <div class="carousel-slide" data-strategy="${strategyKey}">
                    <div class="strategy-card ${isFeatured ? 'strategy-featured' : ''}">
                        ${isFeatured ? '<div class="featured-badge" data-translate="strategy_featured">Più Popolare</div>' : ''}
                        <div class="strategy-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <h3 class="strategy-name">${name}</h3>
                        <p class="strategy-tagline">${tagline}</p>
                        <div class="strategy-stats">
                            <div class="strategy-stat">
                                <span class="stat-label" data-translate="strategy_risk">Rischio:</span>
                                <span class="stat-value risk-${strategy.risk}">${riskLabel}</span>
                            </div>
                            <div class="strategy-stat">
                                <span class="stat-label" data-translate="strategy_return">Rendimento:</span>
                                <span class="stat-value">${strategy.return}</span>
                            </div>
                            <div class="strategy-stat">
                                <span class="stat-label" data-translate="strategy_drawdown">Drawdown:</span>
                                <span class="stat-value">${strategy.drawdown}</span>
                            </div>
                        </div>
                        <button class="btn ${isFeatured ? 'btn-primary' : 'btn-outline'} strategy-details-btn" 
                                data-strategy="${strategyKey}" 
                                data-translate="strategy_details_btn">
                            Dettagli Strategia
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Aggiorna il DOM
        track.innerHTML = cardsHTML;
        
        // Salva riferimenti alle slide
        this.slides = track.querySelectorAll('.carousel-slide');
        
        // Applica traduzioni se necessario
        if (window.applyTranslations) {
            window.applyTranslations();
        }
        
        // Re-inizializza le animazioni per le nuove card
        this.initCardAnimations();
        
        // Collega i pulsanti "Dettagli Strategia" all'overlay
        this.attachDetailButtons();
    }
    
    setupNavigation() {
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigate(1));
        }
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Touch/swipe support
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        if (this.track) {
            this.track.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            this.track.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.navigate(1); // Swipe left
            } else {
                this.navigate(-1); // Swipe right
            }
        }
    }
    
    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.slides.length) {
            this.goToSlide(newIndex);
        }
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        this.currentIndex = index;
        
        // Calcola la posizione (ogni slide è 100% wide con gap)
        const slideWidth = 100;
        const offset = -index * slideWidth;
        
        this.track.style.transform = `translateX(${offset}%)`;
        
        // Aggiorna indicatori
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        indicators.forEach((ind, i) => {
            if (i === index) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });
    }
    
    initCardAnimations() {
        // Riattiva le animazioni delle card se presenti
        const cards = document.querySelectorAll('.strategy-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 150));
        });
    }
    
    attachDetailButtons() {
        const detailButtons = document.querySelectorAll('.strategy-details-btn');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const strategy = btn.getAttribute('data-strategy');
                this.showStrategyDetails(strategy);
            });
        });
    }
    
    showStrategyDetails(strategy) {
        if (!window.CONFIG || !window.CONFIG.strategies || !window.CONFIG.strategies[strategy]) return;
        
        const strategyData = window.CONFIG.strategies[strategy];
        const lang = this.currentLang;
        
        const modalBody = document.getElementById('strategy-modal-body');
        if (!modalBody) return;
        
        // Leggi stile titolo (usa valori default se non presente)
        const titleStyle = strategyData.titleStyle || {
            fontSize: '36px',
            align: 'center',
            bold: false,
            italic: false,
            underline: false,
            marginBottom: '20px'
        };
        
        // Costruisci stile inline per il titolo
        let titleStyles = `
            font-size: ${titleStyle.fontSize};
            text-align: ${titleStyle.align};
            margin-bottom: ${titleStyle.marginBottom};
        `;
        
        if (titleStyle.bold) titleStyles += 'font-weight: bold;';
        if (titleStyle.italic) titleStyles += 'font-style: italic;';
        if (titleStyle.underline) titleStyles += 'text-decoration: underline;';
        
        // Costruisci sezione allegati se presente
        let attachmentsHTML = '';
        if (strategyData.attachments && strategyData.attachments.enabled && strategyData.attachments.files && strategyData.attachments.files.length > 0) {
            const attachments = strategyData.attachments;
            const enabledFiles = attachments.files.filter(f => f.enabled);
            
            console.log('Attachments data:', attachments);
            console.log('Enabled files:', enabledFiles);
            console.log('Current language:', lang);
            
            if (enabledFiles.length > 0) {
                // Titolo sezione con stili
                const titleStyle = attachments.titleStyle || {};
                let attachmentTitleStyle = `
                    display: block;
                    font-size: ${titleStyle.fontSize || '24px'};
                    text-align: ${titleStyle.align || 'left'};
                    margin-bottom: ${titleStyle.marginBottom || '15px'};
                    margin-top: 0;
                    color: var(--text-primary);
                `;
                if (titleStyle.bold !== false) attachmentTitleStyle += 'font-weight: bold;';
                if (titleStyle.italic) attachmentTitleStyle += 'font-style: italic;';
                if (titleStyle.underline) attachmentTitleStyle += 'text-decoration: underline;';
                
                // Ottieni il titolo nella lingua corretta con fallback multipli
                let attachmentTitle = 'Documenti e Allegati'; // Default italiano
                if (attachments.title) {
                    if (typeof attachments.title === 'string') {
                        attachmentTitle = attachments.title;
                    } else if (attachments.title[lang]) {
                        attachmentTitle = attachments.title[lang];
                    } else if (attachments.title.it) {
                        attachmentTitle = attachments.title.it;
                    }
                } else if (lang === 'en') {
                    attachmentTitle = 'Documents and Attachments';
                }
                
                attachmentsHTML = `
                    <div class="strategy-separator"></div>
                    <div class="strategy-attachments">
                        <h3 style="${attachmentTitleStyle}">${attachmentTitle}</h3>
                        <div class="attachments-grid">
                            ${enabledFiles.map(file => {
                                let descStyle = `
                                    font-size: ${file.descriptionStyle?.fontSize || '14px'};
                                `;
                                if (file.descriptionStyle?.bold) descStyle += 'font-weight: bold;';
                                if (file.descriptionStyle?.italic) descStyle += 'font-style: italic;';
                                if (file.descriptionStyle?.underline) descStyle += 'text-decoration: underline;';
                                
                                const iconClass = this.getFileIcon(file.icon || file.fileType);
                                
                                return `
                                    <a href="${file.filePath}" class="attachment-card" download target="_blank">
                                        <div class="attachment-icon">
                                            <i class="fas ${iconClass}"></i>
                                        </div>
                                        <div class="attachment-content">
                                            <h4 class="attachment-title">${file.title[lang] || file.title.it || 'Documento'}</h4>
                                            <p class="attachment-description" style="${descStyle}">${file.description[lang] || file.description.it || ''}</p>
                                        </div>
                                        <div class="attachment-action">
                                            <i class="fas fa-download"></i>
                                        </div>
                                    </a>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        modalBody.innerHTML = `
            <div class="strategy-details">
                <div class="strategy-header">
                    <h2 style="${titleStyles}">${strategyData.name[lang]}</h2>
                </div>
                <div class="strategy-description">
                    ${strategyData.description[lang]}
                </div>
                ${attachmentsHTML}
            </div>
        `;
        
        const modal = document.getElementById('strategy-modal');
        if (!modal) return;
        
        modal.classList.add('active');
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => modal.classList.remove('active');
        
        if (closeBtn) closeBtn.onclick = closeModal;
        if (overlay) overlay.onclick = closeModal;
        
        // Chiudi con ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    getFileIcon(iconOrType) {
        const iconMap = {
            // File types
            'pdf': 'fa-file-pdf',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image',
            'gif': 'fa-file-image',
            'bmp': 'fa-file-image',
            'bitmap': 'fa-file-image',
            
            // Direct icon names (from benefit-card icons)
            'file-pdf': 'fa-file-pdf',
            'file-image': 'fa-file-image',
            'file-alt': 'fa-file-alt',
            'file-contract': 'fa-file-contract',
            'file-signature': 'fa-file-signature',
            'file-invoice': 'fa-file-invoice',
            'file-chart-line': 'fa-file-chart-line',
            'chart-line': 'fa-chart-line',
            'shield-alt': 'fa-shield-alt',
            'lock': 'fa-lock',
            'award': 'fa-award',
            'trophy': 'fa-trophy',
            'medal': 'fa-medal',
            'certificate': 'fa-certificate',
            'book': 'fa-book',
            'graduation-cap': 'fa-graduation-cap'
        };
        
        return iconMap[iconOrType] || 'fa-file';
    }
    
    setupLanguageListener() {
        // Ascolta i cambiamenti di lingua
        window.addEventListener('languageChanged', (e) => {
            this.currentLang = e.detail.language;
            this.renderCarousel();
            this.goToSlide(this.currentIndex); // Mantieni la slide corrente
        });
    }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.strategiesCarousel = new StrategiesCarousel();
        window.StrategiesCarousel = window.strategiesCarousel; // Alias per compatibilità
    });
} else {
    window.strategiesCarousel = new StrategiesCarousel();
    window.StrategiesCarousel = window.strategiesCarousel; // Alias per compatibilità
}
