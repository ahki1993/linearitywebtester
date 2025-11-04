/**
 * AGENTS SECTION MANAGER
 * Gestisce la personalizzazione dinamica della sezione agenti
 */

class AgentsSectionManager {
    constructor() {
        this.settings = null;
        this.currentLang = 'it';
    }
    
    async init() {
        try {
            await this.loadSettings();
            this.applySettings();
            
            // Listener per cambio lingua
            window.addEventListener('languageChanged', (e) => {
                this.currentLang = e.detail.language;
                this.applySettings();
            });
            
            // Listener per assicurarsi che il link rimanga anche dopo altre modifiche DOM
            setTimeout(() => {
                this.applySettings();
            }, 1000);
            
            console.log('AgentsSection: Sezione personalizzata applicata');
        } catch (error) {
            console.error('Errore inizializzazione sezione agenti:', error);
        }
    }
    
    async loadSettings() {
        try {
            const response = await fetch('config/agents-settings.json');
            this.settings = await response.json();
        } catch (error) {
            console.error('Errore caricamento impostazioni agenti:', error);
            // Usa impostazioni di default
            this.settings = this.getDefaultSettings();
        }
    }
    
    applySettings() {
        if (!this.settings) return;
        
        const lang = this.currentLang;
        
        // Applica titolo
        const titleEl = document.querySelector('.agents-section .section-title');
        if (titleEl) {
            titleEl.textContent = this.settings.title[lang];
            this.applyStyles(titleEl, this.settings.title);
        }
        
        // Applica sottotitolo
        const subtitleEl = document.querySelector('.agents-section .section-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = this.settings.subtitle[lang];
            this.applyStyles(subtitleEl, this.settings.subtitle);
        }
        
        // Applica CTA title
        const ctaTitleEl = document.querySelector('.agents-cta h3');
        if (ctaTitleEl) {
            ctaTitleEl.textContent = this.settings.cta.title[lang];
            this.applyStyles(ctaTitleEl, this.settings.cta.title);
        }
        
        // Applica CTA description
        const ctaDescEl = document.querySelector('.agents-cta p');
        if (ctaDescEl) {
            ctaDescEl.textContent = this.settings.cta.description[lang];
            this.applyStyles(ctaDescEl, this.settings.cta.description);
        }
        
        // Applica CTA button
        const ctaBtnEl = document.querySelector('.agents-cta .btn');
        if (ctaBtnEl) {
            ctaBtnEl.textContent = this.settings.cta.button[lang];
            ctaBtnEl.setAttribute('href', this.settings.cta.button.link);
            
            // Log per debug
            console.log('AgentsSection: Link pulsante applicato:', this.settings.cta.button.link);
        }
    }
    
    applyStyles(element, config) {
        if (!element || !config) return;
        
        let styles = '';
        
        if (config.fontSize) {
            styles += `font-size: ${config.fontSize} !important;`;
        }
        
        if (config.bold) {
            styles += 'font-weight: 700 !important;';
        }
        
        if (config.italic) {
            styles += 'font-style: italic !important;';
        }
        
        if (config.underline) {
            styles += 'text-decoration: underline !important;';
        }
        
        if (styles) {
            element.setAttribute('style', styles);
        }
    }
    
    getDefaultSettings() {
        return {
            title: {
                it: "Diventa un Agente",
                en: "Become an Agent",
                fontSize: "36px",
                bold: false,
                italic: false,
                underline: false
            },
            subtitle: {
                it: "Guadagna promuovendo i nostri servizi di copy trading",
                en: "Earn by promoting our copy trading services",
                fontSize: "18px",
                bold: false,
                italic: false,
                underline: false
            },
            cta: {
                title: {
                    it: "Pronto a iniziare?",
                    en: "Ready to start?",
                    fontSize: "28px",
                    bold: false,
                    italic: false,
                    underline: false
                },
                description: {
                    it: "Unisciti al nostro programma agenti oggi stesso",
                    en: "Join our agent program today",
                    fontSize: "16px",
                    bold: false,
                    italic: false,
                    underline: false
                },
                button: {
                    it: "Diventa Agente",
                    en: "Become Agent",
                    link: "#contact"
                }
            }
        };
    }
}

// Inizializza
const agentsSectionManager = new AgentsSectionManager();
window.AgentsSectionManager = agentsSectionManager;
