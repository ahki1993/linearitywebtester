/**
 * TRANSLATIONS MANAGER
 * Gestione multilingua dinamica
 */

class TranslationsManager {
    constructor() {
        this.currentLang = 'it';
        this.availableLanguages = ['it', 'en'];
        this.countryLanguageMap = {
            'IT': 'it', 'CH': 'it', 'SM': 'it', 'VA': 'it',
            'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en'
        };
    }
    
    async init() {
        await this.detectLanguage();
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.setupLanguageSwitch();
        
        if (window.Debug) window.Debug.log('info', `Lingua inizializzata: ${this.currentLang}`);
    }
    
    async detectLanguage() {
        if (window.CONFIG.settings && !window.CONFIG.settings.features.autoDetectLanguage) {
            this.currentLang = window.CONFIG.settings.features.defaultLanguage || 'it';
            return;
        }
        
        const savedLang = localStorage.getItem('preferred_language');
        if (savedLang && this.availableLanguages.includes(savedLang)) {
            this.currentLang = savedLang;
            return;
        }
        
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const countryCode = data.country_code;
            this.currentLang = this.countryLanguageMap[countryCode] || 'it';
        } catch (error) {
            const browserLang = navigator.language.split('-')[0];
            this.currentLang = this.availableLanguages.includes(browserLang) ? browserLang : 'it';
        }
        
        window.CONFIG.currentLanguage = this.currentLang;
    }
    
    async loadTranslations(lang) {
        if (window.CONFIG.translations[lang]) return;
        await loadTranslations(lang);
    }
    
    applyTranslations() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(el => {
            const key = el.getAttribute('data-translate');
            const translation = getTranslation(key, this.currentLang);
            el.textContent = translation;
        });
        
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            const translation = getTranslation(key, this.currentLang);
            el.placeholder = translation;
        });
        
        document.documentElement.lang = this.currentLang;
        
        const currentLangEl = document.getElementById('current-lang');
        if (currentLangEl) {
            currentLangEl.textContent = this.currentLang.toUpperCase();
        }
    }
    
    async changeLanguage(lang) {
        if (!this.availableLanguages.includes(lang)) return;
        
        this.currentLang = lang;
        window.CONFIG.currentLanguage = lang;
        localStorage.setItem('preferred_language', lang);
        
        await this.loadTranslations(lang);
        this.applyTranslations();
        
        // Dispatch event so other modules (es. FAQ) possano aggiornare il contenuto
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        
        if (window.Debug) window.Debug.log('info', `Lingua cambiata in: ${lang}`);
    }
    
    setupLanguageSwitch() {
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                this.changeLanguage(lang);
            });
        });
    }
}

window.Translations = new TranslationsManager();
