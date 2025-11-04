/**
 * DEBUG SYSTEM
 * Sistema centralizzato di debug e logging
 * Gestisce tutti i log, errori e informazioni di debug
 */

class DebugSystem {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.enabled = false;
        this.levels = {
            info: true,
            warning: true,
            error: true,
            debug: false
        };
        this.visualIndicators = false;
    }
    
    /**
     * Inizializza il sistema di debug
     */
    init() {
        if (window.CONFIG && window.CONFIG.debug) {
            this.enabled = window.CONFIG.debug.enabled;
            this.levels = window.CONFIG.debug.levels;
            this.visualIndicators = window.CONFIG.debug.visualIndicators;
        }
        
        // Intercetta gli errori globali
        window.addEventListener('error', (event) => {
            this.log('error', 'Errore JavaScript', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Intercetta le promise rejection non gestite
        window.addEventListener('unhandledrejection', (event) => {
            this.log('error', 'Promise Rejection non gestita', {
                reason: event.reason
            });
        });
        
        if (this.enabled) {
            this.log('info', 'Sistema di debug inizializzato');
        }
        
        // Aggiungi classe debug al body se visualIndicators è attivo
        if (this.visualIndicators) {
            document.body.classList.add('debug-mode');
        }
    }
    
    /**
     * Log un messaggio
     * @param {string} level - Livello: info, warning, error, debug
     * @param {string} message - Messaggio
     * @param {*} data - Dati aggiuntivi
     */
    log(level, message, data = null) {
        if (!this.enabled || !this.levels[level]) {
            return;
        }
        
        const logEntry = {
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        // Aggiungi ai log
        this.logs.push(logEntry);
        
        // Mantieni solo gli ultimi maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Output su console se abilitato
        if (window.CONFIG.debug && window.CONFIG.debug.consoleOutput) {
            this._consoleOutput(logEntry);
        }
        
        // Mostra indicatore visivo se abilitato
        if (this.visualIndicators && (level === 'error' || level === 'warning')) {
            this._showVisualIndicator(logEntry);
        }
    }
    
    /**
     * Output su console
     */
    _consoleOutput(logEntry) {
        const timestamp = window.CONFIG.debug.showTimestamps ? 
            `[${new Date(logEntry.timestamp).toLocaleTimeString()}]` : '';
        const message = `${timestamp} [${logEntry.level.toUpperCase()}] ${logEntry.message}`;
        
        const consoleMethod = {
            'info': 'log',
            'warning': 'warn',
            'error': 'error',
            'debug': 'debug'
        }[logEntry.level] || 'log';
        
        if (logEntry.data) {
            console[consoleMethod](message, logEntry.data);
        } else {
            console[consoleMethod](message);
        }
    }
    
    /**
     * Mostra indicatore visivo
     */
    _showVisualIndicator(logEntry) {
        const indicator = document.createElement('div');
        indicator.className = `debug-indicator debug-${logEntry.level}`;
        indicator.textContent = logEntry.message;
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${logEntry.level === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => indicator.remove(), 300);
        }, 3000);
    }
    
    /**
     * Ottieni tutti i log
     */
    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return this.logs;
    }
    
    /**
     * Pulisci i log
     */
    clearLogs() {
        this.logs = [];
        this.log('info', 'Log puliti');
    }
    
    /**
     * Esporta i log
     */
    exportLogs() {
        const logsJson = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-logs-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('info', 'Log esportati');
    }
    
    /**
     * Misura le performance di una funzione
     */
    measurePerformance(name, func) {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        const duration = end - start;
        
        this.log('debug', `Performance: ${name}`, {
            duration: `${duration.toFixed(2)}ms`
        });
        
        return result;
    }
    
    /**
     * Traccia una chiamata API
     */
    trackApiCall(url, method, response) {
        if (window.CONFIG.debug && window.CONFIG.debug.performance.trackApiCalls) {
            this.log('debug', `API Call: ${method} ${url}`, {
                status: response.status,
                statusText: response.statusText
            });
        }
    }
}

// Istanza globale
window.Debug = new DebugSystem();

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.Debug.init());
} else {
    window.Debug.init();
}
