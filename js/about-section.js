/**
 * AboutSectionManager
 * Gestisce la visualizzazione dinamica della sezione about
 */
class AboutSectionManager {
    constructor() {
        this.settings = null;
        this.currentLang = 'it';
    }

    async init() {
        await this.loadSettings();
        this.applySettings();
        this.setupLanguageListener();
        
        // Riapplica dopo 1 secondo per sicurezza
        setTimeout(() => {
            this.applySettings();
        }, 1000);
        
        console.log('AboutSection: Sezione about personalizzata applicata');
    }

    async loadSettings() {
        try {
            const response = await fetch('config/about-settings.json');
            if (!response.ok) throw new Error('Errore nel caricamento delle impostazioni about');
            this.settings = await response.json();
        } catch (error) {
            console.error('AboutSection: Errore nel caricamento:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    applySettings() {
        if (!this.settings) return;

        this.currentLang = localStorage.getItem('language') || 'it';
        
        // Applica titolo e descrizione
        this.applyTitle();
        this.applyDescription();
        
        // Applica features
        this.applyFeatures();
        
        // Applica/nascondi immagine
        this.applyImage();
        
        // Applica layout in base alla presenza dell'immagine
        this.applyLayout();
        
        // Applica CTA button
        this.applyCTA();
    }

    applyTitle() {
        const titleEl = document.querySelector('.about-section .section-title');
        if (!titleEl) return;

        titleEl.textContent = this.settings.title[this.currentLang];
        let styles = this.applyStyles(this.settings.title);
        
        // Aggiungi margin-bottom
        if (this.settings.title.marginBottom) {
            styles += `margin-bottom: ${this.settings.title.marginBottom}px;`;
        }
        
        titleEl.style.cssText = styles;
    }

    applyDescription() {
        const descEl = document.querySelector('.about-description');
        if (!descEl) return;

        descEl.textContent = this.settings.description[this.currentLang];
        let styles = this.applyStyles(this.settings.description);
        
        // Aggiungi line-height (interlinea)
        if (this.settings.description.lineHeight) {
            styles += `line-height: ${this.settings.description.lineHeight};`;
        }
        
        descEl.style.cssText = styles;
    }

    applyFeatures() {
        const container = document.querySelector('.about-features');
        if (!container) return;

        // Filtra solo le features abilitate
        const enabledFeatures = this.settings.features.filter(f => f.enabled);
        
        if (enabledFeatures.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'grid';
        
        // Applica posizione features
        this.applyFeaturesPosition(container);
        container.innerHTML = '';

        enabledFeatures.forEach(feature => {
            const featureEl = this.createFeature(feature);
            container.appendChild(featureEl);
        });
    }

    createFeature(feature) {
        const div = document.createElement('div');
        div.className = 'feature-item';

        const iconClass = this.getIconClass(feature.icon);
        
        div.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${feature.text[this.currentLang]}</span>
        `;

        return div;
    }
    
    applyFeaturesPosition(container) {
        const position = this.settings.featuresPosition || 'bottom';
        const descEl = document.querySelector('.about-description');
        
        if (!descEl) return;
        
        // Reset previous positioning
        container.style.order = '';
        container.style.marginLeft = '';
        container.style.marginRight = '';
        container.style.float = '';
        container.style.width = '';
        container.style.clear = '';
        descEl.style.clear = '';
        
        switch(position) {
            case 'left':
                // Features a sinistra del testo
                container.style.float = 'left';
                container.style.width = '45%';
                container.style.marginRight = '2rem';
                descEl.style.clear = 'none';
                break;
                
            case 'right':
                // Features a destra del testo
                container.style.float = 'right';
                container.style.width = '45%';
                container.style.marginLeft = '2rem';
                descEl.style.clear = 'none';
                break;
                
            case 'top':
                // Features sopra la descrizione
                container.style.order = '-1';
                descEl.style.clear = 'both';
                break;
                
            case 'bottom':
            default:
                // Features sotto la descrizione (default)
                container.style.order = '1';
                descEl.style.clear = 'both';
                break;
        }
    }

    getIconClass(iconName) {
        // Mappa delle icone con i loro prefix corretti
        const iconMap = {
            'check-circle': 'fas fa-check-circle',
            'check': 'fas fa-check',
            'star': 'fas fa-star',
            'shield-alt': 'fas fa-shield-alt',
            'rocket': 'fas fa-rocket',
            'chart-line': 'fas fa-chart-line',
            'users': 'fas fa-users',
            'trophy': 'fas fa-trophy',
            'lock': 'fas fa-lock',
            'clock': 'fas fa-clock',
            'bolt': 'fas fa-bolt',
            'heart': 'fas fa-heart',
            'thumbs-up': 'fas fa-thumbs-up',
            'award': 'fas fa-award',
            'gem': 'fas fa-gem',
            'crown': 'fas fa-crown',
            'fire': 'fas fa-fire',
            'lightbulb': 'fas fa-lightbulb',
            'medal': 'fas fa-medal',
            'flag': 'fas fa-flag'
        };

        return iconMap[iconName] || 'fas fa-check-circle';
    }

    applyImage() {
        const visualContainer = document.querySelector('.about-visual');
        const imageContainer = document.querySelector('.about-image-container');
        const imgEl = document.querySelector('.about-image');
        
        if (!visualContainer || !imageContainer || !imgEl) return;

        if (!this.settings.image.enabled) {
            visualContainer.style.display = 'none';
            return;
        }

        visualContainer.style.display = 'block';
        
        // Applica immagine
        imgEl.src = this.settings.image.src;
        imgEl.alt = this.settings.image.alt;
        
        // Applica stili immagine
        let imageStyles = '';
        
        // Dimensione
        if (this.settings.image.width) {
            imageStyles += `width: ${this.settings.image.width}%;`;
        }
        
        // Opacità
        if (this.settings.image.opacity) {
            imageStyles += `opacity: ${this.settings.image.opacity / 100};`;
        }
        
        // Bordo
        if (this.settings.image.border?.enabled) {
            imageStyles += `border: ${this.settings.image.border.width}px solid ${this.settings.image.border.color};`;
        }
        
        // Ombra
        if (this.settings.image.shadow?.enabled) {
            imageStyles += `box-shadow: 0 0 ${this.settings.image.shadow.blur}px ${this.settings.image.shadow.color};`;
        }
        
        // Bagliore
        if (this.settings.image.glow?.enabled) {
            imageStyles += `filter: drop-shadow(0 0 ${this.settings.image.glow.blur}px ${this.settings.image.glow.color});`;
        }
        
        imgEl.style.cssText = imageStyles;
    }

    applyLayout() {
        const aboutContent = document.querySelector('.about-content');
        const aboutText = document.querySelector('.about-text');
        const aboutVisual = document.querySelector('.about-visual');
        
        if (!aboutContent || !aboutText) return;

        // Se l'immagine è disabilitata, centra il testo
        if (!this.settings.image.enabled) {
            aboutContent.style.cssText = 'display: flex; justify-content: center; align-items: center;';
            aboutText.style.cssText = 'text-align: center; max-width: 800px;';
            return;
        }

        // Layout con immagine
        aboutContent.style.cssText = '';
        aboutText.style.cssText = '';
        
        // Posizione immagine
        if (this.settings.image.position === 'left') {
            aboutContent.style.gridTemplateColumns = '1fr 1fr';
            if (aboutVisual) aboutVisual.style.order = '-1';
        } else if (this.settings.image.position === 'right') {
            aboutContent.style.gridTemplateColumns = '1fr 1fr';
            if (aboutVisual) aboutVisual.style.order = '1';
        } else if (this.settings.image.position === 'top') {
            aboutContent.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
            if (aboutVisual) aboutVisual.style.order = '-1';
        } else if (this.settings.image.position === 'bottom') {
            aboutContent.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
            if (aboutVisual) aboutVisual.style.order = '1';
        }
    }

    applyCTA() {
        const ctaBtn = document.querySelector('.about-text .btn');
        if (!ctaBtn) return;

        if (!this.settings.cta.enabled) {
            ctaBtn.style.display = 'none';
            return;
        }

        ctaBtn.style.display = 'inline-block';
        ctaBtn.textContent = this.settings.cta.text[this.currentLang];
        ctaBtn.setAttribute('href', this.settings.cta.link);
        
        // Allineamento
        const ctaContainer = ctaBtn.parentElement;
        if (ctaContainer) {
            ctaContainer.style.textAlign = this.settings.cta.align;
        }
        
        // Gestione overlay strategie
        if (this.settings.cta.openStrategyOverlay) {
            ctaBtn.setAttribute('data-strategy-trigger', '');
        } else {
            ctaBtn.removeAttribute('data-strategy-trigger');
        }
        
        console.log('AboutSection: CTA button configurato:', this.settings.cta.link);
    }

    applyStyles(config) {
        let styles = '';
        if (config.fontSize) styles += `font-size: ${config.fontSize}px;`;
        if (config.bold) styles += 'font-weight: bold;';
        if (config.italic) styles += 'font-style: italic;';
        if (config.underline) styles += 'text-decoration: underline;';
        if (config.align) styles += `text-align: ${config.align};`;
        return styles;
    }

    setupLanguageListener() {
        window.addEventListener('languageChanged', () => {
            this.applySettings();
        });
    }

    getDefaultSettings() {
        return {
            title: {
                it: "Il Nostro Progetto",
                en: "Our Project",
                fontSize: "36",
                bold: true,
                italic: false,
                underline: false,
                align: "left"
            },
            description: {
                it: "Linearity è nato dalla passione per il trading.",
                en: "Linearity was born from a passion for trading.",
                fontSize: "18",
                bold: false,
                italic: false,
                underline: false,
                align: "left"
            },
            features: [],
            image: {
                enabled: true,
                src: "images/about-visual.jpg",
                alt: "Trading",
                position: "right",
                width: "100",
                opacity: "100"
            },
            cta: {
                enabled: true,
                text: { it: "Inizia Ora", en: "Start Now" },
                link: "#contact",
                align: "left",
                openStrategyOverlay: true
            }
        };
    }
}

// Auto-inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AboutSectionManager = new AboutSectionManager();
    });
} else {
    window.AboutSectionManager = new AboutSectionManager();
}
