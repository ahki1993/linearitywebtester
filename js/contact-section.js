/**
 * ContactSectionManager
 * Gestisce la visualizzazione dinamica della sezione contatti
 */
class ContactSectionManager {
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
        
        console.log('ContactSection: Sezione contatti personalizzata applicata');
    }

    async loadSettings() {
        try {
            const response = await fetch('config/contact-settings.json');
            if (!response.ok) throw new Error('Errore nel caricamento delle impostazioni contatti');
            this.settings = await response.json();
        } catch (error) {
            console.error('ContactSection: Errore nel caricamento:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    applySettings() {
        if (!this.settings) return;

        this.currentLang = localStorage.getItem('language') || 'it';
        
        // Applica titolo e sottotitolo
        this.applyTitle();
        this.applySubtitle();
        
        // Applica contact items
        this.applyContactItems();
        
        // Applica/nascondi form
        this.applyContactForm();
    }

    applyTitle() {
        const titleEl = document.querySelector('.contact-section .section-title');
        if (!titleEl) return;

        titleEl.textContent = this.settings.title[this.currentLang];
        titleEl.style.cssText = this.applyStyles(this.settings.title);
    }

    applySubtitle() {
        const subtitleEl = document.querySelector('.contact-section .section-subtitle');
        if (!subtitleEl) return;

        subtitleEl.textContent = this.settings.subtitle[this.currentLang];
        subtitleEl.style.cssText = this.applyStyles(this.settings.subtitle);
    }

    applyContactItems() {
        const container = document.querySelector('.contact-info');
        if (!container) return;

        // Filtra solo gli items abilitati
        const enabledItems = this.settings.contactItems.filter(item => item.enabled);
        
        if (enabledItems.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'grid';
        container.innerHTML = '';

        enabledItems.forEach(item => {
            const itemEl = this.createContactItem(item);
            container.appendChild(itemEl);
        });
    }

    createContactItem(item) {
        const div = document.createElement('div');
        div.className = 'contact-item';

        // Determina la classe dell'icona
        const iconClass = this.getIconClass(item.icon);
        
        div.innerHTML = `
            <i class="${iconClass}"></i>
            <div>
                <h4>${item.title[this.currentLang]}</h4>
                <a href="${item.link}" ${item.linkType === 'url' ? 'target="_blank" rel="noopener noreferrer"' : ''}>${item.content}</a>
            </div>
        `;

        return div;
    }

    getIconClass(iconName) {
        // Mappa delle icone con i loro prefix corretti
        const iconMap = {
            // Email & Phone
            'envelope': 'fas fa-envelope',
            'phone': 'fas fa-phone',
            'mobile': 'fas fa-mobile-alt',
            
            // Social Media
            'telegram': 'fab fa-telegram',
            'whatsapp': 'fab fa-whatsapp',
            'instagram': 'fab fa-instagram',
            'facebook': 'fab fa-facebook',
            'twitter': 'fab fa-twitter',
            'linkedin': 'fab fa-linkedin',
            'youtube': 'fab fa-youtube',
            'tiktok': 'fab fa-tiktok',
            'discord': 'fab fa-discord',
            
            // Location & Others
            'map-marker': 'fas fa-map-marker-alt',
            'clock': 'fas fa-clock',
            'globe': 'fas fa-globe',
            'link': 'fas fa-link',
            
            // Business
            'briefcase': 'fas fa-briefcase',
            'building': 'fas fa-building',
            'fax': 'fas fa-fax',
            
            // General
            'star': 'fas fa-star',
            'heart': 'fas fa-heart',
            'chart-line': 'fas fa-chart-line',
            'trophy': 'fas fa-trophy',
            'shield': 'fas fa-shield-alt',
            'rocket': 'fas fa-rocket',
            'users': 'fas fa-users'
        };

        return iconMap[iconName] || 'fas fa-circle';
    }

    applyContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        if (!this.settings.contactForm.enabled) {
            form.style.display = 'none';
            // Se anche contact-info è nascosto, nascondi tutto il content
            const contactInfo = document.querySelector('.contact-info');
            if (contactInfo && contactInfo.style.display === 'none') {
                document.querySelector('.contact-content').style.display = 'none';
            }
            return;
        }

        form.style.display = 'block';
        
        // Aggiorna i placeholder e labels
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const messageTextarea = form.querySelector('textarea');
        const submitBtn = form.querySelector('button[type="submit"]');

        if (nameInput) nameInput.placeholder = this.settings.contactForm.nameLabel[this.currentLang];
        if (emailInput) emailInput.placeholder = this.settings.contactForm.emailLabel[this.currentLang];
        if (messageTextarea) messageTextarea.placeholder = this.settings.contactForm.messageLabel[this.currentLang];
        if (submitBtn) submitBtn.textContent = this.settings.contactForm.submitButton[this.currentLang];
    }

    applyStyles(config) {
        let styles = '';
        if (config.fontSize) styles += `font-size: ${config.fontSize}px;`;
        if (config.bold) styles += 'font-weight: bold;';
        if (config.italic) styles += 'font-style: italic;';
        if (config.underline) styles += 'text-decoration: underline;';
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
                it: "Contattaci",
                en: "Contact Us",
                fontSize: "36",
                bold: true,
                italic: false,
                underline: false
            },
            subtitle: {
                it: "Siamo qui per rispondere a tutte le tue domande",
                en: "We're here to answer all your questions",
                fontSize: "18",
                bold: false,
                italic: false,
                underline: false
            },
            contactItems: [],
            contactForm: {
                enabled: true,
                nameLabel: { it: "Nome", en: "Name" },
                emailLabel: { it: "Email", en: "Email" },
                messageLabel: { it: "Messaggio", en: "Message" },
                submitButton: { it: "Invia Messaggio", en: "Send Message" }
            }
        };
    }
}

// Auto-inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ContactSectionManager = new ContactSectionManager();
    });
} else {
    window.ContactSectionManager = new ContactSectionManager();
}
