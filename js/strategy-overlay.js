/**
 * STRATEGY OVERLAY MANAGER
 * Gestisce overlay con cards 3D per selezione strategia
 */

class StrategyOverlayManager {
    constructor() {
        this.overlay = null;
        this.currentIndex = -1; // -1 = nessuna selezione
        this.cards = [];
        this.currentLang = 'it';
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        // Aspetta che il config sia caricato
        if (window.CONFIG && window.CONFIG.strategyCards) {
            this.createOverlay();
            this.attachEvents();
        } else {
            // Riprova dopo un po'
            setTimeout(() => this.init(), 100);
        }
    }
    
    createOverlay() {
        // Crea HTML overlay
        const overlayHTML = `
            <div class="strategy-overlay" id="strategy-overlay">
                <button class="overlay-close" id="close-strategy-overlay" aria-label="Chiudi">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="overlay-content">
                    <h2 class="overlay-title" id="strategy-overlay-title"></h2>
                    
                    <div class="strategy-cards-container" id="strategy-cards-container">
                        <!-- Le cards verranno inserite dinamicamente -->
                    </div>
                    
                    <button class="strategy-nav prev" id="strategy-prev" aria-label="Precedente">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="strategy-nav next" id="strategy-next" aria-label="Successivo">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Aggiungi al body
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        
        this.overlay = document.getElementById('strategy-overlay');
        
        // Render iniziale
        this.currentLang = document.documentElement.lang || 'it';
        this.renderCards();
    }
    
    attachEvents() {
        // Close button
        document.getElementById('close-strategy-overlay').addEventListener('click', () => {
            this.close();
        });
        
        // Click fuori dall'overlay per chiudere
        this.overlay.addEventListener('click', (e) => {
            // Se clicco direttamente sull'overlay (sfondo scuro), chiudi
            if (e.target === this.overlay) {
                this.close();
            }
            // Se clicco sull'area del contenuto ma non su una card, deseleziona
            else if (e.target.classList.contains('overlay-content')) {
                this.deselectAll();
            }
        });
        
        // Click sullo sfondo del container per deselezionare
        const cardsContainer = document.getElementById('strategy-cards-container');
        cardsContainer.addEventListener('click', (e) => {
            // Se clicco sul container ma non su una card, deseleziona
            if (e.target === cardsContainer) {
                this.deselectAll();
            }
        });
        
        // Navigation arrows
        document.getElementById('strategy-prev').addEventListener('click', () => {
            this.navigate(-1);
        });
        
        document.getElementById('strategy-next').addEventListener('click', () => {
            this.navigate(1);
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.overlay.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'ArrowLeft') {
                this.navigate(-1);
            } else if (e.key === 'ArrowRight') {
                this.navigate(1);
            }
        });
        
        // Touch events per mobile swipe
        cardsContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        cardsContainer.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        // Language change event
        window.addEventListener('languageChanged', (e) => {
            this.currentLang = e.detail.language;
            this.renderCards();
        });
        
        // Intercetta click sui pulsanti CTA
        this.interceptCTAButtons();
    }
    
    interceptCTAButtons() {
        // Trova tutti i button con href che puntano a #contact o classe specifica
        // Escludi il pulsante agenti che ha una classe specifica
        document.querySelectorAll('a[href="#contact"].btn-primary:not(.agents-cta-btn), a[data-strategy-trigger]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });
    }
    
    renderCards() {
        const data = window.CONFIG.strategyCards[this.currentLang];
        if (!data) return;
        
        // Update title
        document.getElementById('strategy-overlay-title').textContent = data.overlayTitle;
        
        // Render cards
        const container = document.getElementById('strategy-cards-container');
        this.cards = data.cards;
        
        container.innerHTML = this.cards.map((card, index) => `
            <div class="strategy-card-wrapper" data-index="${index}">
                <div class="strategy-card">
                    <div class="strategy-card-header">
                        <div class="strategy-card-icon">
                            ${this.getCardIcon(card.id)}
                        </div>
                        <h3 class="strategy-card-title">${card.title}</h3>
                    </div>
                    
                    <div class="strategy-card-description">
                        ${card.description}
                    </div>
                    
                    <a href="${card.buttonLink}" 
                       class="strategy-card-btn" 
                       target="_blank" 
                       rel="noopener noreferrer">
                        ${card.buttonText}
                    </a>
                </div>
            </div>
        `).join('');
        
        // Attach click events alle cards per selezione
        container.querySelectorAll('.strategy-card-wrapper').forEach((wrapper, index) => {
            wrapper.addEventListener('click', () => {
                this.selectCard(index);
            });
        });
        
        // Nascondi le frecce di navigazione (non servono più)
        document.getElementById('strategy-prev').style.display = 'none';
        document.getElementById('strategy-next').style.display = 'none';
    }
    
    getCardIcon(cardId) {
        const icons = {
            'low-risk': '<i class="fas fa-shield-alt"></i>',
            'mid-risk': '<i class="fas fa-balance-scale"></i>',
            'high-risk': '<i class="fas fa-rocket"></i>'
        };
        
        return icons[cardId] || '<i class="fas fa-chart-line"></i>';
    }
    
    selectCard(index) {
        // Se clicco sulla stessa card già selezionata, deseleziona
        if (this.currentIndex === index) {
            this.deselectAll();
            return;
        }
        
        this.currentIndex = index;
        
        const wrappers = document.querySelectorAll('.strategy-card-wrapper');
        
        wrappers.forEach((wrapper, i) => {
            if (i === index) {
                // Card selezionata - in primo piano
                wrapper.classList.add('selected');
                wrapper.classList.remove('dimmed');
            } else {
                // Altre cards - in secondo piano
                wrapper.classList.remove('selected');
                wrapper.classList.add('dimmed');
            }
        });
    }
    
    deselectAll() {
        this.currentIndex = -1;
        
        const wrappers = document.querySelectorAll('.strategy-card-wrapper');
        wrappers.forEach(wrapper => {
            wrapper.classList.remove('selected', 'dimmed');
        });
    }
    
    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.cards.length) {
            this.selectCard(newIndex);
        }
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('strategy-prev');
        const nextBtn = document.getElementById('strategy-next');
        
        // Hide prev se primo
        if (this.currentIndex === 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
        
        // Hide next se ultimo
        if (this.currentIndex === this.cards.length - 1) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                this.navigate(1);
            } else {
                // Swipe right - prev
                this.navigate(-1);
            }
        }
    }
    
    open() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Rimuovi selezione e riavvia animazione
        this.deselectAll();
        
        const wrappers = document.querySelectorAll('.strategy-card-wrapper');
        wrappers.forEach(w => {
            // Reset animazione
            w.style.animation = 'none';
            setTimeout(() => {
                w.style.animation = '';
            }, 10);
        });
    }
    
    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.strategyOverlayManager = new StrategyOverlayManager();
    });
} else {
    window.strategyOverlayManager = new StrategyOverlayManager();
}
