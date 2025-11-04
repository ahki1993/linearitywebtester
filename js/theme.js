/**
 * THEME MANAGER
 * Gestione tema chiaro/scuro
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
    }
    
    init() {
        this.loadSavedTheme();
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        
        if (window.Debug) window.Debug.log('info', `Tema inizializzato: ${this.currentTheme}`);
    }
    
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('preferred_theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else if (window.CONFIG.settings) {
            this.currentTheme = window.CONFIG.settings.features.defaultTheme || 'dark';
        }
        window.CONFIG.currentTheme = this.currentTheme;
    }
    
    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        this.currentTheme = theme;
        window.CONFIG.currentTheme = theme;
        localStorage.setItem('preferred_theme', theme);
        
        // Dispatch event per notificare i moduli del cambio tema
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
        
        if (window.Debug) window.Debug.log('info', `Tema applicato: ${theme}`);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    setupThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }
}

window.Theme = new ThemeManager();
