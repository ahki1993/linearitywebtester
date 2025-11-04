/**
 * AGENTS BENEFITS
 * Gestione delle benefit cards per il programma agenti
 */

class AgentsBenefitsManager {
    constructor() {
        this.benefits = [];
        this.container = null;
    }
    
    async init() {
        try {
            // Ottieni il container
            this.container = document.getElementById('agents-benefits-container');
            if (!this.container) {
                console.warn('Container benefit cards non trovato');
                return;
            }
            
            // Carica le benefit cards dal server
            await this.loadBenefits();
            
            // Renderizza le cards
            this.render();
            
            // Aggiungi listener per cambio lingua
            window.addEventListener('languageChanged', (e) => {
                this.updateLanguage(e.detail.language);
            });
            
            console.log('AgentsBenefits: Inizializzazione completata con', this.benefits.length, 'benefit cards');
            if (window.DebugSystem) {
                DebugSystem.log('AgentsBenefits', 'Benefit cards caricate', this.benefits);
            }
            
        } catch (error) {
            console.error('Errore inizializzazione benefit cards:', error);
            if (window.DebugSystem) {
                DebugSystem.error('AgentsBenefits', 'Errore caricamento benefit cards', error);
            }
        }
    }
    
    async loadBenefits() {
        try {
            console.log('AgentsBenefits: Caricamento benefit cards...');
            const response = await fetch('/api/config/agents-benefits');
            console.log('AgentsBenefits: Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('AgentsBenefits: Dati ricevuti:', data);
            
            // Filtra solo le cards abilitate
            this.benefits = data.filter(benefit => benefit.enabled);
            console.log('AgentsBenefits: Benefit abilitati:', this.benefits.length);
            
        } catch (error) {
            console.error('Errore caricamento benefit cards:', error);
            // Fallback con cards di default se il caricamento fallisce
            this.benefits = this.getDefaultBenefits();
            console.log('AgentsBenefits: Usando benefit di default');
        }
    }
    
    render() {
        if (!this.container) return;
        
        // Ottieni la lingua corrente (con fallback)
        const currentLang = (window.TranslationsManager && window.TranslationsManager.currentLanguage) 
            ? window.TranslationsManager.currentLanguage 
            : 'it';
        
        // Svuota il container
        this.container.innerHTML = '';
        
        // Crea le cards
        this.benefits.forEach(benefit => {
            const card = this.createBenefitCard(benefit, currentLang);
            this.container.appendChild(card);
        });
        
        console.log('AgentsBenefits:', this.benefits.length, 'benefit cards renderizzate');
        if (window.DebugSystem) {
            DebugSystem.log('AgentsBenefits', `${this.benefits.length} benefit cards renderizzate`);
        }
    }
    
    createBenefitCard(benefit, lang) {
        const card = document.createElement('div');
        card.className = 'benefit-card';
        card.setAttribute('data-benefit-id', benefit.id);
        
        // Ottieni titolo e descrizione nella lingua corrente
        const title = benefit.title[lang] || benefit.title.it;
        const description = benefit.description[lang] || benefit.description.it;
        
        card.innerHTML = `
            <div class="benefit-icon">
                <i class="${benefit.icon}"></i>
            </div>
            <h3 class="benefit-title">${title}</h3>
            <p class="benefit-description">${description}</p>
        `;
        
        return card;
    }
    
    getDefaultBenefits() {
        // Benefit cards di default in caso di errore
        return [
            {
                id: 1,
                icon: 'fas fa-percentage',
                title: {
                    it: 'Commissioni Elevate',
                    en: 'High Commissions'
                },
                description: {
                    it: 'Guadagna fino al 30% su ogni cliente che porti',
                    en: 'Earn up to 30% on every client you bring'
                },
                enabled: true
            },
            {
                id: 2,
                icon: 'fas fa-chart-line',
                title: {
                    it: 'Reddito Passivo',
                    en: 'Passive Income'
                },
                description: {
                    it: 'Guadagni ricorrenti per tutta la durata del cliente',
                    en: 'Recurring earnings for the lifetime of the client'
                },
                enabled: true
            },
            {
                id: 3,
                icon: 'fas fa-tools',
                title: {
                    it: 'Strumenti Marketing',
                    en: 'Marketing Tools'
                },
                description: {
                    it: 'Materiale promozionale professionale incluso',
                    en: 'Professional promotional materials included'
                },
                enabled: true
            },
            {
                id: 4,
                icon: 'fas fa-headset',
                title: {
                    it: 'Supporto Dedicato',
                    en: 'Dedicated Support'
                },
                description: {
                    it: 'Team di supporto sempre a tua disposizione',
                    en: 'Support team always at your disposal'
                },
                enabled: true
            }
        ];
    }
    
    // Metodo per ri-renderizzare quando cambia la lingua
    updateLanguage(newLang) {
        console.log('AgentsBenefits: Aggiornamento lingua a', newLang);
        this.render();
        if (window.DebugSystem) {
            DebugSystem.log('AgentsBenefits', `Lingua aggiornata a: ${newLang}`);
        }
    }
}

// Inizializza il manager
const agentsBenefitsManager = new AgentsBenefitsManager();

// Export per uso globale
window.AgentsBenefitsManager = agentsBenefitsManager;
