/**
 * FAQs Manager - render FAQ section and accordion behavior
 */
class FAQsManager {
    constructor() {
        this.containerId = 'faq-container';
    }

    async init() {
        // Render iniziale
        this.render();

        // Rerender quando cambia la lingua
        document.addEventListener('languageChanged', () => this.render());
        document.addEventListener('languageChanged', () => console.log('Lingua cambiata - FAQ rerender'));
    }

    getLang() {
        return (window.Translations && window.Translations.currentLang) ? window.Translations.currentLang : (window.CONFIG && window.CONFIG.currentLanguage) || 'it';
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const lang = this.getLang();
        const data = (window.CONFIG && window.CONFIG.faqs && window.CONFIG.faqs[lang]) ? window.CONFIG.faqs[lang] : null;

        // Aggiorna titoli
        const titleEl = document.getElementById('faq-title');
        const subtitleEl = document.getElementById('faq-subtitle');
        if (data) {
            if (titleEl) titleEl.textContent = data.sectionTitle || 'FAQ';
            if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
        }

        container.innerHTML = '';
        if (!data || !data.items || data.items.length === 0) {
            container.innerHTML = '<p class="muted">Nessuna FAQ disponibile</p>';
            return;
        }

        data.items.forEach(item => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';

            const q = document.createElement('div');
            q.className = 'faq-question';
            q.innerHTML = `<h4>${item.question}</h4><div class="chev"><i class="fas fa-chevron-down"></i></div>`;

            const a = document.createElement('div');
            a.className = 'faq-answer';
            a.innerHTML = `<p>${item.answer}</p>`;

            q.addEventListener('click', () => {
                const isOpen = faqItem.classList.contains('open');
                // chiudi tutte
                document.querySelectorAll('.faq-item.open').forEach(el => {
                    el.classList.remove('open');
                    const ans = el.querySelector('.faq-answer');
                    if (ans) ans.style.maxHeight = null;
                });

                if (!isOpen) {
                    faqItem.classList.add('open');
                    a.style.maxHeight = a.scrollHeight + 'px';
                }
            });

            faqItem.appendChild(q);
            faqItem.appendChild(a);
            container.appendChild(faqItem);
        });
    }
}

window.FAQsManager = new FAQsManager();

// Auto init quando il DOM è pronto
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.CONFIG || !window.CONFIG.faqs) {
        // se CONFIG non è pronto, prova a ricaricare dopo un breve delay
        setTimeout(() => window.FAQsManager.init(), 200);
    } else {
        window.FAQsManager.init();
    }
});
