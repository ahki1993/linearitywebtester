/**
 * FORMS MANAGER
 * Gestione form e validazione
 */

class FormsManager {
    constructor() {
        this.forms = [];
    }
    
    init() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            this.setupForm(contactForm);
        }
        
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => this.setupForm(form));
        
        if (window.Debug) window.Debug.log('info', 'Forms manager inizializzato');
    }
    
    setupForm(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(form);
        });
        
        this.forms.push(form);
    }
    
    async handleSubmit(form) {
        if (!this.validateForm(form)) return;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            // Simula invio form
            await this.submitForm(data);
            this.showNotification('success', 'Messaggio inviato con successo!');
            form.reset();
        } catch (error) {
            this.showNotification('error', 'Errore nell\'invio del messaggio. Riprova.');
            if (window.Debug) window.Debug.log('error', 'Errore invio form', error);
        }
    }
    
    validateForm(form) {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showInputError(input, 'Campo obbligatorio');
                isValid = false;
            } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
                this.showInputError(input, 'Email non valida');
                isValid = false;
            } else {
                this.clearInputError(input);
            }
        });
        
        return isValid;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showInputError(input, message) {
        input.style.borderColor = 'var(--error-color)';
        
        let errorEl = input.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains('error-message')) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.style.cssText = 'color: var(--error-color); font-size: 0.875rem; margin-top: 0.25rem; display: block;';
            input.parentNode.insertBefore(errorEl, input.nextSibling);
        }
        errorEl.textContent = message;
    }
    
    clearInputError(input) {
        input.style.borderColor = '';
        const errorEl = input.nextElementSibling;
        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.remove();
        }
    }
    
    async submitForm(data) {
        // Simulazione invio - in produzione implementare chiamata API reale
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data:', data);
                resolve();
            }, 1000);
        });
    }
    
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

window.Forms = new FormsManager();
