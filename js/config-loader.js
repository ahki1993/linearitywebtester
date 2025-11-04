/**
 * CONFIG LOADER
 * Caricamento centralizzato delle configurazioni
 * Gestisce il caricamento di tutti i file JSON di configurazione
 */

// Configurazioni globali
window.CONFIG = {
    settings: null,
    translations: {},
    themeColors: null,
    images: null,
    debug: null,
    strategies: null,
    faqs: null,
    performanceCharts: null,
    strategyCards: null,
    currentLanguage: 'it',
    currentTheme: 'dark'
};

/**
 * Carica tutte le configurazioni all'avvio
 */
async function loadAllConfigs() {
    try {
        // Log di debug
        debugLog('info', 'Inizio caricamento configurazioni...');
        
        // Caricamento parallelo di tutte le configurazioni
        const [settings, debugConfig, themeColors, images, strategies, faqs, performanceCharts, strategyCards] = await Promise.all([
            fetch('config/settings.json').then(r => r.json()),
            fetch('config/debug.json').then(r => r.json()),
            fetch('config/theme-colors.json').then(r => r.json()),
            fetch('config/images.json').then(r => r.json()),
            fetch('config/strategies.json').then(r => r.json()),
            fetch('config/faqs.json').then(r => r.json()),
            fetch('config/performance-charts.json').then(r => r.json()),
            fetch('config/strategy-cards.json').then(r => r.json())
        ]);
        
        // Salva le configurazioni
        window.CONFIG.settings = settings;
        window.CONFIG.debug = debugConfig;
        window.CONFIG.themeColors = themeColors;
        window.CONFIG.images = images;
        window.CONFIG.strategies = strategies;
        window.CONFIG.faqs = faqs;
        window.CONFIG.performanceCharts = performanceCharts;
        window.CONFIG.strategyCards = strategyCards;        // Imposta lingua e tema di default
        window.CONFIG.currentLanguage = settings.features.defaultLanguage || 'it';
        window.CONFIG.currentTheme = settings.features.defaultTheme || 'dark';
        
        debugLog('success', 'Configurazioni caricate con successo');
        
        return true;
    } catch (error) {
        debugLog('error', 'Errore nel caricamento delle configurazioni', error);
        return false;
    }
}

/**
 * Carica le traduzioni per una lingua specifica
 * @param {string} lang - Codice lingua (it, en)
 */
async function loadTranslations(lang) {
    try {
        debugLog('info', `Caricamento traduzioni per lingua: ${lang}`);
        
        const translations = await fetch(`config/translations-${lang}.json`).then(r => r.json());
        window.CONFIG.translations[lang] = translations;
        
        debugLog('success', `Traduzioni ${lang} caricate`);
        return translations;
    } catch (error) {
        debugLog('error', `Errore caricamento traduzioni ${lang}`, error);
        return null;
    }
}

/**
 * Ottiene un valore di traduzione
 * @param {string} key - Chiave di traduzione
 * @param {string} lang - Lingua (opzionale, usa quella corrente se non specificata)
 */
function getTranslation(key, lang = null) {
    const language = lang || window.CONFIG.currentLanguage;
    
    if (!window.CONFIG.translations[language]) {
        debugLog('warning', `Traduzioni non disponibili per lingua: ${language}`);
        return key;
    }
    
    return window.CONFIG.translations[language][key] || key;
}

/**
 * Ottiene un valore dalle impostazioni
 * @param {string} path - Percorso del valore (es: 'site.title')
 */
function getSetting(path) {
    if (!window.CONFIG.settings) {
        debugLog('warning', 'Configurazioni non ancora caricate');
        return null;
    }
    
    const keys = path.split('.');
    let value = window.CONFIG.settings;
    
    for (const key of keys) {
        if (value[key] === undefined) {
            return null;
        }
        value = value[key];
    }
    
    return value;
}

/**
 * Aggiorna un valore nelle impostazioni
 * @param {string} path - Percorso del valore
 * @param {any} newValue - Nuovo valore
 */
function updateSetting(path, newValue) {
    if (!window.CONFIG.settings) {
        debugLog('error', 'Impossibile aggiornare: configurazioni non caricate');
        return false;
    }
    
    const keys = path.split('.');
    let obj = window.CONFIG.settings;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) {
            obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = newValue;
    debugLog('info', `Impostazione aggiornata: ${path} = ${newValue}`);
    
    return true;
}

/**
 * Salva le configurazioni (solo per admin)
 * Nota: richiede implementazione server-side
 */
async function saveConfigs() {
    try {
        debugLog('info', 'Salvataggio configurazioni...');
        
        // Qui andrebbe implementata la logica di salvataggio server-side
        // Per ora simuliamo un salvataggio in localStorage per il pannello admin
        
        localStorage.setItem('config_settings', JSON.stringify(window.CONFIG.settings));
        localStorage.setItem('config_debug', JSON.stringify(window.CONFIG.debug));
        localStorage.setItem('config_themeColors', JSON.stringify(window.CONFIG.themeColors));
        localStorage.setItem('config_strategies', JSON.stringify(window.CONFIG.strategies));
        
        debugLog('success', 'Configurazioni salvate localmente');
        return true;
    } catch (error) {
        debugLog('error', 'Errore nel salvataggio delle configurazioni', error);
        return false;
    }
}

/**
 * Carica configurazioni da localStorage (per admin)
 */
function loadConfigsFromLocalStorage() {
    try {
        const savedSettings = localStorage.getItem('config_settings');
        const savedDebug = localStorage.getItem('config_debug');
        const savedThemeColors = localStorage.getItem('config_themeColors');
        const savedStrategies = localStorage.getItem('config_strategies');
        
        if (savedSettings) window.CONFIG.settings = JSON.parse(savedSettings);
        if (savedDebug) window.CONFIG.debug = JSON.parse(savedDebug);
        if (savedThemeColors) window.CONFIG.themeColors = JSON.parse(savedThemeColors);
        if (savedStrategies) window.CONFIG.strategies = JSON.parse(savedStrategies);
        
        debugLog('info', 'Configurazioni caricate da localStorage');
    } catch (error) {
        debugLog('error', 'Errore caricamento da localStorage', error);
    }
}

// Funzione di utilità per il debug (definita qui per evitare dipendenze circolari)
function debugLog(level, message, data = null) {
    if (!window.CONFIG.debug || !window.CONFIG.debug.enabled) {
        return;
    }
    
    if (!window.CONFIG.debug.levels[level]) {
        return;
    }
    
    const timestamp = window.CONFIG.debug.showTimestamps ? `[${new Date().toISOString()}]` : '';
    const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    if (window.CONFIG.debug.consoleOutput) {
        const consoleMethod = {
            'info': 'log',
            'warning': 'warn',
            'error': 'error',
            'debug': 'debug',
            'success': 'log'
        }[level] || 'log';
        
        if (data) {
            console[consoleMethod](logMessage, data);
        } else {
            console[consoleMethod](logMessage);
        }
    }
}

// Export per uso in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadAllConfigs,
        loadTranslations,
        getTranslation,
        getSetting,
        updateSetting,
        saveConfigs,
        loadConfigsFromLocalStorage
    };
}
