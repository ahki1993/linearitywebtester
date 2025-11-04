/**
 * HeroSectionManager
 * Loads hero-settings.json via API and applies to the hero section
 */
class HeroSectionManager {
    constructor() {
        this.settings = null;
        this.currentLang = 'it';
    }

    async init() {
        await this.loadSettings();
        this.applySettings();
        this.setupLanguageListener();
        // defensive reapply
        setTimeout(() => this.applySettings(), 800);
        console.log('HeroSection: initialized');
    }

    async loadSettings() {
        try {
            const res = await fetch('/api/config/hero-settings');
            if (!res.ok) throw new Error('Failed to load hero settings');
            this.settings = await res.json();
        } catch (err) {
            console.error('HeroSection: load error', err);
            this.settings = this.getDefault();
        }
    }

    applySettings() {
        if (!this.settings) return;
        this.currentLang = localStorage.getItem('language') || 'it';

        // Title
        const titleEl = document.querySelector('.hero-section .hero-title');
        if (titleEl && this.settings.title) {
            titleEl.textContent = this.settings.title[this.currentLang] || '';
            titleEl.style.fontSize = (this.settings.title.fontSize || 48) + 'px';
            titleEl.style.fontWeight = this.settings.title.bold ? '700' : '400';
            titleEl.style.fontStyle = this.settings.title.italic ? 'italic' : 'normal';
            titleEl.style.textDecoration = this.settings.title.underline ? 'underline' : 'none';
            titleEl.style.lineHeight = (this.settings.title.lineHeight ? this.settings.title.lineHeight + '%' : '110%');
            titleEl.style.marginBottom = (this.settings.title.marginBottom ? this.settings.title.marginBottom + 'px' : '20px');
            titleEl.style.textAlign = this.settings.title.align || 'center';
        }

        // Subtitle
        const subEl = document.querySelector('.hero-section .hero-subtitle');
        if (subEl && this.settings.subtitle) {
            subEl.textContent = this.settings.subtitle[this.currentLang] || '';
            subEl.style.fontSize = (this.settings.subtitle.fontSize || 18) + 'px';
            subEl.style.fontWeight = this.settings.subtitle.bold ? '700' : '400';
            subEl.style.fontStyle = this.settings.subtitle.italic ? 'italic' : 'normal';
            subEl.style.textDecoration = this.settings.subtitle.underline ? 'underline' : 'none';
            subEl.style.lineHeight = (this.settings.subtitle.lineHeight ? this.settings.subtitle.lineHeight + '%' : '140%');
            subEl.style.marginTop = (this.settings.subtitle.marginTop ? this.settings.subtitle.marginTop + 'px' : '10px');
            subEl.style.textAlign = this.settings.subtitle.align || 'center';
        }

        // Stats
        this.applyStats();

        // Visual: if integratePerformanceEditor true, leave placeholder (admin manages), otherwise hide
        const visual = document.querySelector('.hero-visual');
        if (visual) {
            visual.style.display = this.settings.visual && this.settings.visual.enabled ? 'block' : 'none';
            // positioning handled by CSS or admin settings
            visual.dataset.position = this.settings.visual && this.settings.visual.position ? this.settings.visual.position : 'right';
        }

        // CTA Buttons
        this.applyCTA();
    }

    applyStats() {
        const container = document.querySelector('.hero-stats');
        if (!container) return;
        const enabled = (this.settings.stats || []).filter(s => s.enabled);
        if (enabled.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        // Rimuovi tutti gli stili inline per usare il CSS di default
        container.style.display = '';
        container.style.flexDirection = '';
        container.style.justifyContent = '';
        container.style.flexWrap = '';
        container.style.gap = '';
        container.style.gridTemplateColumns = '';
        
        // Applica impostazioni layout solo se personalizzate
        const statsSettings = this.settings.statsSettings || {};
        
        // Applica gap personalizzato se diverso dal default
        if (statsSettings.gap && statsSettings.gap !== '24') {
            container.style.gap = statsSettings.gap + 'px';
        }
        
        // Applica layout personalizzato
        const layout = statsSettings.layout || 'grid';
        if (layout === 'vertical') {
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
        } else if (layout === 'horizontal') {
            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.justifyContent = 'center';
            container.style.flexWrap = 'wrap';
        }
        // Se layout è 'grid', usa il CSS di default (grid-template-columns: repeat(3, 1fr))
        
        container.innerHTML = '';
        enabled.forEach(stat => {
            const el = document.createElement('div');
            el.className = 'stat-item';
            
            // Crea i sottoelementi con le classi CSS originali
            const numberEl = document.createElement('div');
            numberEl.className = 'stat-value';
            numberEl.textContent = stat.number;
            
            const labelEl = document.createElement('div');
            labelEl.className = 'stat-label';
            labelEl.textContent = stat.label[this.currentLang] || '';
            
            // Applica dimensioni font sempre se specificate
            const numberFontSize = statsSettings.numberFontSize;
            const labelFontSize = statsSettings.labelFontSize;
            
            if (numberFontSize) {
                numberEl.style.fontSize = numberFontSize + 'px';
            }
            if (labelFontSize) {
                labelEl.style.fontSize = labelFontSize + 'px';
            }
            
            // Applica stili testo per i numeri
            if (statsSettings.numberBold !== undefined) {
                numberEl.style.fontWeight = statsSettings.numberBold ? '700' : '400';
            }
            if (statsSettings.numberItalic) {
                numberEl.style.fontStyle = 'italic';
            }
            if (statsSettings.numberUnderline) {
                numberEl.style.textDecoration = 'underline';
            }
            
            // Applica stili testo per le label
            if (statsSettings.labelBold) {
                labelEl.style.fontWeight = '700';
            }
            if (statsSettings.labelItalic) {
                labelEl.style.fontStyle = 'italic';
            }
            if (statsSettings.labelUnderline) {
                labelEl.style.textDecoration = 'underline';
            }
            
            el.appendChild(numberEl);
            el.appendChild(labelEl);
            container.appendChild(el);
        });
    }

    applyCTA() {
        const container = document.querySelector('.hero-section .hero-cta');
        if (!container) return;
        
        const ctaSettings = this.settings.ctaSettings || { enabled: true, align: 'center', gap: '16' };
        const ctaButtons = this.settings.ctaButtons || [];
        
        // Se CTA è disabilitato o non ci sono pulsanti abilitati, nascondi il container
        const enabledButtons = ctaButtons.filter(btn => btn.enabled);
        if (!ctaSettings.enabled || enabledButtons.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        container.style.textAlign = ctaSettings.align || 'center';
        container.style.gap = (ctaSettings.gap || '16') + 'px';
        container.style.justifyContent = ctaSettings.align === 'left' ? 'flex-start' : 
                                         ctaSettings.align === 'right' ? 'flex-end' : 'center';
        
        // Svuota e ricrea i pulsanti
        container.innerHTML = '';
        
        enabledButtons.forEach(btn => {
            const link = document.createElement('a');
            link.href = btn.link || '#';
            link.className = `btn btn-${btn.style || 'primary'} btn-${btn.size || 'large'}`;
            link.textContent = (btn.text && btn.text[this.currentLang]) || '';
            container.appendChild(link);
        });
    }

    setupLanguageListener() {
        window.addEventListener('languageChanged', () => this.applySettings());
    }

    getDefault() {
        return {
            title: { it: 'Benvenuto su Linearity', en: 'Welcome to Linearity', fontSize: 48, bold: true, lineHeight: 110, marginBottom: 20, align: 'center' },
            subtitle: { it: 'Strategie di trading progettate per te', en: 'Trading strategies built for you', fontSize: 18, lineHeight: 140, marginTop: 10, align: 'center' },
            statsSettings: { 
                numberFontSize: '30', 
                numberBold: true, 
                numberItalic: false, 
                numberUnderline: false,
                labelFontSize: '14', 
                labelBold: false, 
                labelItalic: false, 
                labelUnderline: false,
                gap: '24', 
                layout: 'grid' 
            },
            stats: [],
            visual: { enabled: true, integratePerformanceEditor: true, position: 'right' },
            ctaSettings: { enabled: true, align: 'center', gap: '16' },
            ctaButtons: []
        };
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.HeroSectionManager = new HeroSectionManager(); });
} else {
    window.HeroSectionManager = new HeroSectionManager();
}
