/**
 * MAIN APPLICATION
 * Inizializzazione e coordinamento di tutti i moduli
 */

class App {
    constructor() {
        this.isInitialized = false;
        this.loadStartTime = performance.now();
    }
    
    async init() {
        try {
            // Mostra loader
            this.showLoader();
            
            // 1. Carica configurazioni
            await loadAllConfigs();
            
            // 2. Inizializza sistema di debug
            if (window.Debug) {
                window.Debug.init();
            }
            
            // 3. Carica traduzioni
            await window.Translations.init();
            
            // 4. Inizializza tema
            window.Theme.init();
            
            // 5. Inizializza navigazione
            window.Navigation.init();
            
            // 6. Carosello strategie già inizializzato automaticamente
            // (strategies-carousel.js si auto-inizializza)
            
            // 7. Inizializza MyFxBook
            window.MyFxBook.init();
            
            // 8. Inizializza animazioni
            window.Animations.init();
            
            // 9. Inizializza forms
            window.Forms.init();
            
            // 10. Inizializza benefit cards agenti
            if (window.AgentsBenefitsManager) {
                await window.AgentsBenefitsManager.init();
            }
            
            // 10a. Inizializza personalizzazione sezione agenti
            if (window.AgentsSectionManager) {
                await window.AgentsSectionManager.init();
            }

            // 10b. Inizializza FAQ
            if (window.FAQsManager) {
                await window.FAQsManager.init();
            }
            
            // 10c. Inizializza grafici performance
            if (window.PerformanceChartsManager) {
                await window.PerformanceChartsManager.init();
            }
            
            // 10d. Inizializza sezione contatti
            if (window.ContactSectionManager) {
                await window.ContactSectionManager.init();
            }
            
            // 10e. Inizializza sezione about
            if (window.AboutSectionManager) {
                await window.AboutSectionManager.init();
            }

            // 10f. Inizializza sezione hero
            if (window.HeroSectionManager) {
                await window.HeroSectionManager.init();
            }
            
            // 11. Aggiorna statistiche performance
            this.updatePerformanceData();
            
            // 12. Setup event listeners globali
            this.setupGlobalEvents();
            
            this.isInitialized = true;
            
            // Nascondi loader
            this.hideLoader();
            
            // Log tempo di caricamento
            const loadTime = performance.now() - this.loadStartTime;
            if (window.Debug) {
                window.Debug.log('info', `Applicazione inizializzata in ${loadTime.toFixed(2)}ms`);
            }
            
        } catch (error) {
            console.error('Errore inizializzazione applicazione:', error);
            if (window.Debug) {
                window.Debug.log('error', 'Errore critico inizializzazione', error);
            }
            this.hideLoader();
        }
    }
    
    showLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.remove('hidden');
        }
    }
    
    hideLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500);
        }
    }
    
    updatePerformanceData() {
        if (!window.CONFIG.settings || !window.CONFIG.settings.performance) return;
        
        const perf = window.CONFIG.settings.performance;
        
        // Aggiorna i valori delle performance
        this.updateElement('performance-week', `+${perf.weeklyProfit}%`);
        this.updateElement('performance-month', `+${perf.monthlyProfit}%`);
        this.updateElement('performance-year', `+${perf.yearlyProfit}%`);
        
        // Aggiorna statistiche
        this.updateElement('total-subscribers', perf.totalSubscribers.toLocaleString());
        this.updateElement('total-profit', perf.totalProfit);
        this.updateElement('total-trades', perf.totalTrades.toLocaleString());
        this.updateElement('success-rate', `${perf.successRate}%`);
        
        // Aggiorna hero stats
        this.updateElement('hero-stat-profit', `+${perf.yearlyProfit}%`);
        this.updateElement('hero-stat-users', `${perf.totalSubscribers.toLocaleString()}+`);
    }
    
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    setupGlobalEvents() {
        // Gestione resize window
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.Debug) {
                    window.Debug.log('debug', 'Window resized', {
                        width: window.innerWidth,
                        height: window.innerHeight
                    });
                }
            }, 250);
        });
        
        // Gestione visibilità pagina
        document.addEventListener('visibilitychange', () => {
            if (window.Debug) {
                window.Debug.log('debug', `Page visibility: ${document.hidden ? 'hidden' : 'visible'}`);
            }
        });
        
        // Previeni comportamento default su alcuni link
        document.querySelectorAll('a[href="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') === '#') {
                    e.preventDefault();
                }
            });
        });
    }
}

// Inizializza l'applicazione quando il DOM è pronto
const app = new App();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export per uso globale
window.App = app;
