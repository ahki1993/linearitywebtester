/**
 * ADMIN PANEL
 * Pannello di controllo per gestione contenuti
 */

class AdminPanel {
    constructor() {
        this.currentSection = 'general';
        this.currentLang = 'it';
        this.currentTheme = 'dark';
        this.currentStrategy = 'low';
        this.hasUnsavedChanges = false;
    }
    
    async init() {
        // Carica configurazioni prima di inizializzare il resto
        await this.loadConfigurations();
        
        this.setupNavigation();
        this.setupTabs();
        this.setupForms();
        this.setupSaveButtons();
        this.setupPreview();
        this.setupContextMenu();
        this.setupRenameModal();
        this.setupRichTextEditors();
        this.loadSectionData();
        
        console.log('Admin Panel inizializzato');
    }
    
    async loadConfigurations() {
        try {
            // Inizializza CONFIG se non esiste
            if (!window.CONFIG) {
                window.CONFIG = {
                    settings: null,
                    translations: { it: {}, en: {} },
                    strategies: null,
                    themeColors: null,
                    debug: null,
                    images: null,
                    agentsBenefits: [],
                    agentsSettings: null,
                    contactSettings: null,
                    aboutSettings: null,
                    faqs: { it: { items: [] }, en: { items: [] } },
                    performanceCharts: null
                };
            }
            
            // Carica tutte le configurazioni dal server
            const responses = await Promise.all([
                fetch('/api/config/settings').then(r => r.json()),
                fetch('/api/config/translations/it').then(r => r.json()),
                fetch('/api/config/translations/en').then(r => r.json()),
                fetch('/api/config/strategies').then(r => r.json()),
                fetch('/api/config/theme-colors').then(r => r.json()),
                fetch('/api/config/debug').then(r => r.json()),
                fetch('/api/config/agents-benefits').then(r => r.json()),
                fetch('/api/config/agents-settings').then(r => r.json()),
                fetch('/api/config/contact-settings').then(r => r.json()),
                fetch('/api/config/about-settings').then(r => r.json()),
                fetch('/api/config/hero-settings').then(r => r.json()),
                fetch('/api/config/faqs').then(r => r.json()),
                fetch('/api/config/performance-charts').then(r => r.json()),
                fetch('/api/config/strategy-cards').then(r => r.json())
            ]);
            
            window.CONFIG.settings = responses[0];
            window.CONFIG.translations.it = responses[1];
            window.CONFIG.translations.en = responses[2];
            window.CONFIG.strategies = responses[3];
            window.CONFIG.themeColors = responses[4];
            window.CONFIG.debug = responses[5];
            window.CONFIG.agentsBenefits = responses[6];
            window.CONFIG.agentsSettings = responses[7];
            window.CONFIG.contactSettings = responses[8];
            window.CONFIG.aboutSettings = responses[9];
            window.CONFIG.heroSettings = responses[10];
            window.CONFIG.faqs = responses[11];
            window.CONFIG.performanceCharts = responses[12];
            window.CONFIG.strategyCards = responses[13];
            
            console.log('Configurazioni caricate:', window.CONFIG);
            
        } catch (error) {
            console.error('Errore caricamento configurazioni:', error);
            this.showNotification('error', 'Errore caricamento configurazioni dal server');
        }
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                
                // Se è un parent, toggle del submenu
                if (item.classList.contains('nav-parent')) {
                    e.preventDefault();
                    const submenu = item.nextElementSibling;
                    
                    if (submenu && submenu.classList.contains('nav-submenu')) {
                        // Toggle expanded
                        item.classList.toggle('expanded');
                        submenu.classList.toggle('expanded');
                    }
                } else {
                    // Navigazione normale
                    this.navigateToSection(section);
                }
            });
        });
    }
    
    navigateToSection(sectionId) {
        // Rimuovi active da tutte le sezioni e nav items
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item:not(.nav-parent)').forEach(n => n.classList.remove('active'));
        
        // Aggiungi active alla sezione selezionata
        const section = document.getElementById(`section-${sectionId}`);
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (section) section.classList.add('active');
        if (navItem && !navItem.classList.contains('nav-parent')) {
            navItem.classList.add('active');
            
            // Se è un child, espandi il parent
            const submenu = navItem.closest('.nav-submenu');
            if (submenu) {
                const parent = submenu.previousElementSibling;
                if (parent && parent.classList.contains('nav-parent')) {
                    parent.classList.add('expanded');
                    submenu.classList.add('expanded');
                }
            }
        }
        
        this.currentSection = sectionId;
        this.loadSectionData();
    }
    
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const parent = btn.parentElement;
                parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Gestisci cambio lingua
                if (btn.hasAttribute('data-lang')) {
                    this.currentLang = btn.getAttribute('data-lang');
                    this.loadTranslationEditor();
                    // Ricarica anche l'editor FAQ se presente
                    if (typeof this.loadFAQEditor === 'function') this.loadFAQEditor();
                }
                
                // Gestisci cambio tema
                if (btn.hasAttribute('data-theme')) {
                    this.currentTheme = btn.getAttribute('data-theme');
                    this.loadThemeColors();
                }
                
                // Gestisci cambio strategia
                if (btn.hasAttribute('data-strategy')) {
                    this.currentStrategy = btn.getAttribute('data-strategy');
                    this.loadStrategyData();
                }
            });
        });
        
        // Setup Admin Tabs (nuove tabs per sezioni)
        const adminTabs = document.querySelectorAll('.admin-tab');
        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Rimuovi active da tutti i tab e content
                const parent = tab.parentElement;
                parent.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                
                const section = parent.closest('.admin-section');
                section.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Aggiungi active al tab e content selezionati
                tab.classList.add('active');
                const targetContent = section.querySelector(`#tab-${tabId}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // Carica i dati se è la tab delle impostazioni generali agenti
                if (tabId === 'agents-general') {
                    this.loadAgentsSettings();
                }
            });
        });
    }
    
    setupForms() {
        const inputs = document.querySelectorAll('.form-control');
        
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.hasUnsavedChanges = true;
            });
        });
    }
    
    setupSaveButtons() {
        const saveAllBtn = document.getElementById('save-all-btn');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => this.saveAll());
        }
    }
    
    setupPreview() {
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                window.open('../index.html', '_blank');
            });
        }
    }
    
    loadSectionData() {
        switch (this.currentSection) {
            case 'general':
                this.loadGeneralSettings();
                break;
            case 'translations':
                this.loadTranslationEditor();
                break;
            case 'theme':
                this.loadThemeColors();
                break;
            case 'strategies':
                this.loadStrategyData();
                break;
            case 'performance':
                this.loadPerformanceData();
                break;
            case 'hero':
                loadHeroSettings();
                break;
            case 'agents':
                this.loadAgentsBenefits();
                break;
            case 'contact':
                loadContactSettings();
                break;
            case 'about':
                loadAboutSettings();
                break;
            case 'charts':
                this.loadPerformanceChartsEditor();
                break;
            case 'faq':
                this.loadFAQEditor();
                break;
            case 'strategy-cards':
                this.loadStrategyCardsEditor();
                break;
            case 'debug':
                this.loadDebugSettings();
                break;
        }
    }
    
    loadGeneralSettings() {
        if (!window.CONFIG.settings) return;
        
        const settings = window.CONFIG.settings;
        
        this.setValue('site-title', settings.site.title);
        this.setValue('site-description', settings.site.description);
        this.setValue('site-keywords', settings.site.keywords);
        this.setValue('contact-email', settings.site.email);
        this.setValue('contact-phone', settings.site.phone);
        this.setValue('contact-telegram', settings.site.telegram);
        this.setValue('social-facebook', settings.social.facebook);
        this.setValue('social-twitter', settings.social.twitter);
        this.setValue('social-instagram', settings.social.instagram);
        this.setValue('social-linkedin', settings.social.linkedin);
    }
    
    loadTranslationEditor() {
        const editor = document.getElementById('translation-editor');
        if (!editor) return;
        
        const translations = window.CONFIG.translations[this.currentLang];
        if (!translations) return;
        
        editor.innerHTML = '';
        
        Object.keys(translations).forEach(key => {
            const item = document.createElement('div');
            item.className = 'translation-item';
            item.innerHTML = `
                <div class="translation-key">${key}</div>
                <input type="text" class="form-control" value="${translations[key]}" 
                       data-translation-key="${key}" data-lang="${this.currentLang}">
            `;
            editor.appendChild(item);
        });
        
        // Setup event listeners
        editor.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.getAttribute('data-translation-key');
                const lang = e.target.getAttribute('data-lang');
                window.CONFIG.translations[lang][key] = e.target.value;
                this.hasUnsavedChanges = true;
            });
        });
    }
    
    loadThemeColors() {
        if (!window.CONFIG.themeColors) return;
        
        const theme = window.CONFIG.themeColors[this.currentTheme];
        // Implementare caricamento colori
    }
    
    loadStrategyData() {
        if (!window.CONFIG.strategies) return;
        
        const strategy = window.CONFIG.strategies[this.currentStrategy];
        const editor = document.getElementById('strategy-editor');
        
        if (!editor || !strategy) return;
        
        this.setFormValue(editor, 'name-it', strategy.name.it);
        this.setFormValue(editor, 'name-en', strategy.name.en);
        
        // Carica stile titolo
        const titleStyle = strategy.titleStyle || {
            fontSize: '36px',
            align: 'center',
            bold: false,
            italic: false,
            underline: false,
            marginBottom: '20px'
        };
        
        this.setFormValue(editor, 'title-font-size', titleStyle.fontSize);
        this.setFormValue(editor, 'title-margin-bottom', titleStyle.marginBottom);
        
        // Imposta pulsanti allineamento
        editor.querySelectorAll('.alignment-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-value') === titleStyle.align);
        });
        
        // Imposta pulsanti stile
        editor.querySelector('.style-btn[data-field="title-bold"]')?.classList.toggle('active', titleStyle.bold);
        editor.querySelector('.style-btn[data-field="title-italic"]')?.classList.toggle('active', titleStyle.italic);
        editor.querySelector('.style-btn[data-field="title-underline"]')?.classList.toggle('active', titleStyle.underline);
        
        this.setFormValue(editor, 'tagline-it', strategy.tagline.it);
        this.setFormValue(editor, 'tagline-en', strategy.tagline.en);
        this.setFormValue(editor, 'risk-label-it', strategy.riskLabel?.it || '');
        this.setFormValue(editor, 'risk-label-en', strategy.riskLabel?.en || '');
        this.setFormValue(editor, 'return', strategy.return);
        this.setFormValue(editor, 'drawdown', strategy.drawdown);
        this.setFormValue(editor, 'description-it', strategy.description.it);
        this.setFormValue(editor, 'description-en', strategy.description.en);
        
        // Carica attachments
        const attachments = strategy.attachments || {
            enabled: true,
            title: { it: 'Documenti e Allegati', en: 'Documents and Attachments' },
            titleStyle: { fontSize: '24px', bold: true, italic: false, underline: false, align: 'left', marginBottom: '15px' },
            files: []
        };
        
        document.getElementById('strategy-attachments-enabled').checked = attachments.enabled !== false;
        this.setFormValue(editor, 'attachments-title-it', attachments.title?.it || 'Documenti e Allegati');
        this.setFormValue(editor, 'attachments-title-en', attachments.title?.en || 'Documents and Attachments');
        this.setFormValue(editor, 'attachments-title-fontsize', attachments.titleStyle?.fontSize || '24px');
        this.setFormValue(editor, 'attachments-title-margin', attachments.titleStyle?.marginBottom?.replace('px', '') || '15');
        
        // Imposta stili titolo attachments
        editor.querySelector('.style-btn[data-field="attachments-title-bold"]')?.classList.toggle('active', attachments.titleStyle?.bold !== false);
        editor.querySelector('.style-btn[data-field="attachments-title-italic"]')?.classList.toggle('active', attachments.titleStyle?.italic === true);
        editor.querySelector('.style-btn[data-field="attachments-title-underline"]')?.classList.toggle('active', attachments.titleStyle?.underline === true);
        
        // Imposta allineamento attachments
        editor.querySelectorAll('.alignment-btn[data-field="attachments-title-align"]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-value') === (attachments.titleStyle?.align || 'left'));
        });
        
        // Carica files attachments
        strategyAttachmentsData[this.currentStrategy] = attachments.files || [];
        if (strategyAttachmentsData[this.currentStrategy].length > 0) {
            nextAttachmentId = Math.max(...strategyAttachmentsData[this.currentStrategy].map(a => a.id)) + 1;
        }
        renderStrategyAttachments();
        
        document.getElementById('strategy-attachments-container').style.display = attachments.enabled !== false ? 'block' : 'none';
    }
    
    saveCurrentStrategyData() {
        if (!window.CONFIG.strategies) return;
        
        const strategy = window.CONFIG.strategies[this.currentStrategy];
        const editor = document.getElementById('strategy-editor');
        
        if (!editor || !strategy) return;
        
        // Leggi i valori dai campi (inclusi rich text editors)
        const getFieldValue = (field) => {
            const el = editor.querySelector(`[data-field="${field}"]`);
            if (!el) return '';
            return el.hasAttribute('contenteditable') ? el.innerHTML : el.value;
        };
        
        const getStyleState = (field) => {
            const el = editor.querySelector(`.style-btn[data-field="${field}"]`);
            return el ? el.classList.contains('active') : false;
        };
        
        const getAlignValue = (field) => {
            const activeBtn = editor.querySelector(`.alignment-btn[data-field="${field}"].active`);
            return activeBtn ? activeBtn.dataset.value : 'center';
        };
        
        strategy.name.it = getFieldValue('name-it');
        strategy.name.en = getFieldValue('name-en');
        
        // Salva stile titolo
        if (!strategy.titleStyle) {
            strategy.titleStyle = {};
        }
        
        strategy.titleStyle.fontSize = getFieldValue('title-font-size');
        strategy.titleStyle.align = editor.querySelector('.alignment-btn.active')?.getAttribute('data-value') || 'center';
        strategy.titleStyle.bold = editor.querySelector('.style-btn[data-field="title-bold"]')?.classList.contains('active') || false;
        strategy.titleStyle.italic = editor.querySelector('.style-btn[data-field="title-italic"]')?.classList.contains('active') || false;
        strategy.titleStyle.underline = editor.querySelector('.style-btn[data-field="title-underline"]')?.classList.contains('active') || false;
        strategy.titleStyle.marginBottom = getFieldValue('title-margin-bottom');
        
        strategy.tagline.it = getFieldValue('tagline-it');
        strategy.tagline.en = getFieldValue('tagline-en');
        
        // Assicurati che riskLabel esista
        if (!strategy.riskLabel) {
            strategy.riskLabel = { it: '', en: '' };
        }
        strategy.riskLabel.it = getFieldValue('risk-label-it');
        strategy.riskLabel.en = getFieldValue('risk-label-en');
        
        strategy.return = getFieldValue('return');
        strategy.drawdown = getFieldValue('drawdown');
        strategy.description.it = getFieldValue('description-it');
        strategy.description.en = getFieldValue('description-en');
        
        // Salva attachments
        if (!strategy.attachments) {
            strategy.attachments = {};
        }
        
        strategy.attachments.enabled = document.getElementById('strategy-attachments-enabled').checked;
        strategy.attachments.title = {
            it: getFieldValue('attachments-title-it'),
            en: getFieldValue('attachments-title-en')
        };
        strategy.attachments.titleStyle = {
            fontSize: getFieldValue('attachments-title-fontsize'),
            bold: getStyleState('attachments-title-bold'),
            italic: getStyleState('attachments-title-italic'),
            underline: getStyleState('attachments-title-underline'),
            align: getAlignValue('attachments-title-align'),
            marginBottom: getFieldValue('attachments-title-margin') + 'px'
        };
        strategy.attachments.files = strategyAttachmentsData[this.currentStrategy] || [];
    }
    
    loadPerformanceData() {
        if (!window.CONFIG.settings || !window.CONFIG.settings.performance) return;
        
        const perf = window.CONFIG.settings.performance;
        
        this.setValue('perf-week', perf.weeklyProfit);
        this.setValue('perf-month', perf.monthlyProfit);
        this.setValue('perf-year', perf.yearlyProfit);
        this.setValue('stat-subscribers', perf.totalSubscribers);
        this.setValue('stat-profit', perf.totalProfit);
        this.setValue('stat-trades', perf.totalTrades);
        this.setValue('stat-success', perf.successRate);
    }
    
    loadDebugSettings() {
        if (!window.CONFIG.debug) return;
        
        const debug = window.CONFIG.debug;
        
        this.setChecked('debug-enabled', debug.enabled);
        this.setChecked('console-log-enabled', debug.consoleOutput);
        this.setChecked('visual-debug-enabled', debug.visualIndicators);
        
        document.querySelectorAll('.debug-level').forEach(checkbox => {
            const level = checkbox.value;
            checkbox.checked = debug.levels[level];
        });
    }
    
    setValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }
    
    setFormValue(parent, field, value) {
        const el = parent.querySelector(`[data-field="${field}"]`);
        if (!el) return;
        
        // Se è un rich text editor (contenteditable), usa innerHTML
        if (el.hasAttribute('contenteditable')) {
            el.innerHTML = value || '';
        } else {
            el.value = value || '';
        }
    }
    
    setChecked(id, checked) {
        const el = document.getElementById(id);
        if (el) el.checked = checked;
    }
    
    async saveAll() {
        try {
            this.showNotification('info', 'Salvataggio in corso...');
            
            // Verifica che CONFIG sia caricato
            if (!window.CONFIG) {
                throw new Error('Configurazioni non caricate');
            }

            // Salva i dati dalle strategie (inclusi rich text editors)
            this.saveCurrentStrategyData();

            // Leggi eventuali campi FAQ dall'editor e aggiornali in CONFIG prima del salvataggio
            try {
                const titleEl = document.getElementById('faq-section-title');
                const subtitleEl = document.getElementById('faq-section-subtitle');
                const lang = this.currentLang || 'it';
                if (window.CONFIG.faqs && window.CONFIG.faqs[lang]) {
                    if (titleEl) window.CONFIG.faqs[lang].sectionTitle = titleEl.value;
                    if (subtitleEl) window.CONFIG.faqs[lang].subtitle = subtitleEl.value;
                }
            } catch (e) {
                // non fondamentale, prosegui
                console.warn('Errore aggiornamento campi FAQ prima del salvataggio', e);
            }
            
            // Salva su server tramite API
            const promises = [];
            
            // Salva impostazioni generali
            if (window.CONFIG.settings) {
                promises.push(
                    fetch('/api/config/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.settings)
                    })
                );
            }
            
            // Salva traduzioni IT
            if (window.CONFIG.translations && window.CONFIG.translations.it) {
                promises.push(
                    fetch('/api/config/translations/it', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.translations.it)
                    })
                );
            }
            
            // Salva traduzioni EN
            if (window.CONFIG.translations && window.CONFIG.translations.en) {
                promises.push(
                    fetch('/api/config/translations/en', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.translations.en)
                    })
                );
            }
            
            // Salva colori tema
            if (window.CONFIG.themeColors) {
                promises.push(
                    fetch('/api/config/theme-colors', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.themeColors)
                    })
                );
            }
            
            // Salva strategie
            if (window.CONFIG.strategies) {
                promises.push(
                    fetch('/api/config/strategies', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.strategies)
                    })
                );
            }
            
            // Salva debug config
            if (window.CONFIG.debug) {
                promises.push(
                    fetch('/api/config/debug', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.debug)
                    })
                );
            }
            
            // Salva benefit cards agenti
            if (window.CONFIG.agentsBenefits) {
                promises.push(
                    fetch('/api/config/agents-benefits', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.agentsBenefits)
                    })
                );
            }

            // Salva FAQ
            if (window.CONFIG.faqs) {
                promises.push(
                    fetch('/api/config/faqs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.faqs)
                    })
                );
            }
            
            // Salva grafici performance
            if (window.CONFIG.performanceCharts) {
                promises.push(
                    fetch('/api/config/performance-charts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.performanceCharts)
                    })
                );
            }
            
            // Salva strategy cards
            if (window.CONFIG.strategyCards) {
                // Aggiorna titolo overlay prima del salvataggio
                const titleEl = document.getElementById('strategy-overlay-title');
                const lang = this.currentLang || 'it';
                if (titleEl && window.CONFIG.strategyCards[lang]) {
                    window.CONFIG.strategyCards[lang].overlayTitle = titleEl.value;
                }
                
                promises.push(
                    fetch('/api/config/strategy-cards', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(window.CONFIG.strategyCards)
                    })
                );
            }
            
            // Verifica che ci siano richieste da fare
            if (promises.length === 0) {
                throw new Error('Nessuna configurazione da salvare');
            }
            
            // Attendi tutte le richieste
            const results = await Promise.all(promises);
            
            // Controlla se ci sono stati errori
            const errors = [];
            for (const result of results) {
                if (!result.ok) {
                    const data = await result.json().catch(() => ({ error: 'Errore sconosciuto' }));
                    errors.push(data.error || `HTTP ${result.status}`);
                }
            }
            
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }
            
            // Salva anche in localStorage come backup
            if (window.CONFIG.translations) {
                if (window.CONFIG.translations.it) {
                    localStorage.setItem('translations_it', JSON.stringify(window.CONFIG.translations.it));
                }
                if (window.CONFIG.translations.en) {
                    localStorage.setItem('translations_en', JSON.stringify(window.CONFIG.translations.en));
                }
            }
            if (window.CONFIG.settings) {
                localStorage.setItem('config_settings', JSON.stringify(window.CONFIG.settings));
            }
            
            this.hasUnsavedChanges = false;
            this.showNotification('success', 'Tutte le modifiche sono state salvate!');
            
        } catch (error) {
            console.error('Errore salvataggio:', error);
            this.showNotification('error', 'Errore durante il salvataggio: ' + error.message);
        }
    }
    
    loadAgentsBenefits() {
        const container = document.getElementById('benefits-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!window.CONFIG.agentsBenefits || window.CONFIG.agentsBenefits.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d;">Nessuna benefit card presente. Clicca su "Aggiungi Card" per iniziare.</p>';
            return;
        }
        
        // Aggiorna il pulsante di aggiunta
        const addBtn = document.getElementById('add-benefit-btn');
        if (addBtn) {
            if (window.CONFIG.agentsBenefits.length >= 6) {
                addBtn.disabled = true;
                addBtn.innerHTML = '<i class="fas fa-lock"></i> Limite Raggiunto (6/6)';
            } else {
                addBtn.disabled = false;
                addBtn.innerHTML = `<i class="fas fa-plus"></i> Aggiungi Card (${window.CONFIG.agentsBenefits.length}/6)`;
            }
        }
        
        // Renderizza ogni benefit card
        window.CONFIG.agentsBenefits.forEach((benefit, index) => {
            const card = this.createBenefitCardEditor(benefit, index);
            container.appendChild(card);
        });
        
        console.log('Benefit cards caricate nel pannello admin');
    }
    
    createBenefitCardEditor(benefit, index) {
        const card = document.createElement('div');
        card.className = 'benefit-card-editor';
        card.setAttribute('data-benefit-id', benefit.id);
        if (!benefit.enabled) {
            card.classList.add('disabled');
        }
        
        // Lista icone disponibili
        const availableIcons = [
            'fas fa-percentage', 'fas fa-chart-line', 'fas fa-tools', 'fas fa-headset',
            'fas fa-gift', 'fas fa-rocket', 'fas fa-star', 'fas fa-trophy',
            'fas fa-users', 'fas fa-clock', 'fas fa-shield-alt', 'fas fa-bolt',
            'fas fa-heart', 'fas fa-thumbs-up', 'fas fa-medal', 'fas fa-crown'
        ];
        
        card.innerHTML = `
            <div class="benefit-card-header">
                <h4>
                    <i class="${benefit.icon}"></i>
                    Card #${index + 1}
                </h4>
                <div class="benefit-card-actions">
                    <button class="btn-toggle ${benefit.enabled ? '' : 'disabled'}" onclick="toggleBenefitCard(${benefit.id})">
                        <i class="fas fa-${benefit.enabled ? 'eye' : 'eye-slash'}"></i>
                        ${benefit.enabled ? 'Disabilita' : 'Abilita'}
                    </button>
                    <button class="btn-danger" onclick="removeBenefitCard(${benefit.id})">
                        <i class="fas fa-trash"></i>
                        Rimuovi
                    </button>
                </div>
            </div>
            
            <div class="benefit-card-fields">
                <div class="form-group full-width">
                    <label>Icona</label>
                    <div class="icon-selector" id="icon-selector-${benefit.id}">
                        ${availableIcons.map(icon => `
                            <div class="icon-option ${icon === benefit.icon ? 'selected' : ''}" 
                                 onclick="selectIcon(${benefit.id}, '${icon}')">
                                <i class="${icon}"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Titolo (Italiano)</label>
                    <input type="text" class="form-control" 
                           value="${benefit.title.it}" 
                           onchange="updateBenefitField(${benefit.id}, 'title', 'it', this.value)">
                </div>
                
                <div class="form-group">
                    <label>Titolo (Inglese)</label>
                    <input type="text" class="form-control" 
                           value="${benefit.title.en}" 
                           onchange="updateBenefitField(${benefit.id}, 'title', 'en', this.value)">
                </div>
                
                <div class="form-group">
                    <label>Descrizione (Italiano)</label>
                    <textarea class="form-control" rows="2" 
                              onchange="updateBenefitField(${benefit.id}, 'description', 'it', this.value)">${benefit.description.it}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Descrizione (Inglese)</label>
                    <textarea class="form-control" rows="2" 
                              onchange="updateBenefitField(${benefit.id}, 'description', 'en', this.value)">${benefit.description.en}</textarea>
                </div>
            </div>
        `;
        
        return card;
    }

    loadFAQEditor() {
        const container = document.getElementById('faq-editor');
        if (!container) return;

        const lang = this.currentLang || 'it';
        const data = (window.CONFIG.faqs && window.CONFIG.faqs[lang]) ? window.CONFIG.faqs[lang] : { sectionTitle: 'FAQ', subtitle: '', items: [] };

        // Titolo e sottotitolo
        const titleEl = document.getElementById('faq-section-title');
        const subtitleEl = document.getElementById('faq-section-subtitle');
        if (titleEl) titleEl.value = data.sectionTitle || '';
        if (subtitleEl) subtitleEl.value = data.subtitle || '';

        // Lista domande
        const listEl = document.getElementById('faq-items-list');
        listEl.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-secondary)">Nessuna FAQ presente. Aggiungi una nuova domanda.</p>';
            return;
        }

        data.items.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'faq-item-editor';
            row.innerHTML = `
                <div class="form-group">
                    <label>Domanda</label>
                    <input type="text" class="form-control" value="${item.question}" onchange="updateFAQField(${item.id}, 'question', '${lang}', this.value)">
                </div>
                <div class="form-group">
                    <label>Risposta</label>
                    <textarea class="form-control" rows="3" onchange="updateFAQField(${item.id}, 'answer', '${lang}', this.value)">${item.answer}</textarea>
                </div>
                <div style="text-align: right; margin-bottom: 10px;">
                    <button class="btn btn-danger" onclick="removeFAQItem(${item.id})"><i class="fas fa-trash"></i> Rimuovi</button>
                </div>
            `;
            listEl.appendChild(row);
        });

        // Aggiorna pulsante di aggiunta
        const addBtn = document.getElementById('add-faq-btn');
        if (addBtn) {
            const count = data.items ? data.items.length : 0;
            addBtn.disabled = count >= 10;
            addBtn.innerHTML = `<i class="fas fa-plus"></i> Aggiungi Domanda (${count}/10)`;
        }
    }

    async loadAgentsSettings() {
        try {
            const response = await fetch('/api/config/agents-settings');
            const data = await response.json();
            
            window.CONFIG.agentsSettings = data;
            
            const section = document.getElementById('tab-agents-general');
            if (!section) return;
            
            // Carica titolo
            this.setFormValue(section, 'agents-title-it', data.title.it);
            this.setFormValue(section, 'agents-title-en', data.title.en);
            this.setFormValue(section, 'agents-title-font-size', data.title.fontSize);
            section.querySelector('.style-btn[data-field="agents-title-bold"]')?.classList.toggle('active', data.title.bold);
            section.querySelector('.style-btn[data-field="agents-title-italic"]')?.classList.toggle('active', data.title.italic);
            section.querySelector('.style-btn[data-field="agents-title-underline"]')?.classList.toggle('active', data.title.underline);
            
            // Carica sottotitolo
            this.setFormValue(section, 'agents-subtitle-it', data.subtitle.it);
            this.setFormValue(section, 'agents-subtitle-en', data.subtitle.en);
            this.setFormValue(section, 'agents-subtitle-font-size', data.subtitle.fontSize);
            section.querySelector('.style-btn[data-field="agents-subtitle-bold"]')?.classList.toggle('active', data.subtitle.bold);
            section.querySelector('.style-btn[data-field="agents-subtitle-italic"]')?.classList.toggle('active', data.subtitle.italic);
            section.querySelector('.style-btn[data-field="agents-subtitle-underline"]')?.classList.toggle('active', data.subtitle.underline);
            
            // Carica CTA
            this.setFormValue(section, 'agents-cta-title-it', data.cta.title.it);
            this.setFormValue(section, 'agents-cta-title-en', data.cta.title.en);
            this.setFormValue(section, 'agents-cta-title-font-size', data.cta.title.fontSize);
            section.querySelector('.style-btn[data-field="agents-cta-title-bold"]')?.classList.toggle('active', data.cta.title.bold);
            section.querySelector('.style-btn[data-field="agents-cta-title-italic"]')?.classList.toggle('active', data.cta.title.italic);
            section.querySelector('.style-btn[data-field="agents-cta-title-underline"]')?.classList.toggle('active', data.cta.title.underline);
            
            this.setFormValue(section, 'agents-cta-desc-it', data.cta.description.it);
            this.setFormValue(section, 'agents-cta-desc-en', data.cta.description.en);
            this.setFormValue(section, 'agents-cta-desc-font-size', data.cta.description.fontSize);
            section.querySelector('.style-btn[data-field="agents-cta-desc-bold"]')?.classList.toggle('active', data.cta.description.bold);
            section.querySelector('.style-btn[data-field="agents-cta-desc-italic"]')?.classList.toggle('active', data.cta.description.italic);
            section.querySelector('.style-btn[data-field="agents-cta-desc-underline"]')?.classList.toggle('active', data.cta.description.underline);
            
            this.setFormValue(section, 'agents-cta-btn-it', data.cta.button.it);
            this.setFormValue(section, 'agents-cta-btn-en', data.cta.button.en);
            this.setFormValue(section, 'agents-cta-btn-link', data.cta.button.link);
            
            console.log('Impostazioni agenti caricate');
        } catch (error) {
            console.error('Errore caricamento impostazioni agenti:', error);
        }
    }
    
    loadPerformanceChartsEditor() {
        if (!window.CONFIG.performanceCharts) return;
        
        const config = window.CONFIG.performanceCharts;
        
        // Carica impostazioni generali
        const visibleCount = document.getElementById('charts-visible-count');
        const autoRotate = document.getElementById('charts-auto-rotate');
        const rotationInterval = document.getElementById('charts-rotation-interval');
        
        if (visibleCount) visibleCount.value = config.settings.visibleCharts || 3;
        if (autoRotate) autoRotate.checked = config.settings.autoRotate || false;
        if (rotationInterval) rotationInterval.value = config.settings.rotationInterval || 5000;
        
        // Aggiungi event listeners per salvare nelle impostazioni
        if (visibleCount) {
            visibleCount.addEventListener('change', (e) => {
                window.CONFIG.performanceCharts.settings.visibleCharts = parseInt(e.target.value);
                this.hasUnsavedChanges = true;
            });
        }
        if (autoRotate) {
            autoRotate.addEventListener('change', (e) => {
                window.CONFIG.performanceCharts.settings.autoRotate = e.target.checked;
                this.hasUnsavedChanges = true;
            });
        }
        if (rotationInterval) {
            rotationInterval.addEventListener('change', (e) => {
                window.CONFIG.performanceCharts.settings.rotationInterval = parseInt(e.target.value);
                this.hasUnsavedChanges = true;
            });
        }
        
        // Setup tabs per i grafici
        const tabs = document.querySelectorAll('[data-chart-id]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const chartId = parseInt(tab.getAttribute('data-chart-id'));
                this.loadChartEditor(chartId);
            });
        });
        
        // Carica il primo grafico
        this.loadChartEditor(1);
    }
    
    loadChartEditor(chartId) {
        const container = document.getElementById('chart-editor-container');
        if (!container) return;
        
        const chart = window.CONFIG.performanceCharts.charts.find(c => c.id === chartId);
        if (!chart) {
            container.innerHTML = '<p>Grafico non trovato</p>';
            return;
        }
        
        const lang = this.currentLang || 'it';
        
        container.innerHTML = `
            <div class="card">
                <h3>Grafico ${chartId}</h3>
                
                <div class="form-group">
                    <label class="toggle-label">
                        <input type="checkbox" id="chart-${chartId}-enabled" class="toggle-input" ${chart.enabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span>Grafico abilitato</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label>Titolo (Italiano)</label>
                    <input type="text" id="chart-${chartId}-title-it" class="form-control" value="${chart.title.it}">
                </div>
                
                <div class="form-group">
                    <label>Titolo (Inglese)</label>
                    <input type="text" id="chart-${chartId}-title-en" class="form-control" value="${chart.title.en}">
                </div>
                
                <div class="form-group">
                    <label>Profitto Totale</label>
                    <input type="number" id="chart-${chartId}-profit" class="form-control" value="${chart.totalProfit}" step="10">
                </div>
                
                <div class="form-group">
                    <label>Percentuale Totale</label>
                    <input type="number" id="chart-${chartId}-percentage" class="form-control" value="${chart.totalPercentage}" step="0.1">
                </div>
                
                <div class="form-group">
                    <label>Valuta</label>
                    <input type="text" id="chart-${chartId}-currency" class="form-control" value="${chart.currency}" maxlength="3">
                </div>
                
                <div class="form-group">
                    <label>Data Inizio (YYYY-MM-DD)</label>
                    <input type="date" id="chart-${chartId}-start-date" class="form-control" value="${chart.startDate}">
                </div>
                
                <h4>Dati Mensili</h4>
                <div style="margin-bottom: 10px;">
                    <button class="btn btn-success" onclick="addChartDataPoint(${chartId})">
                        <i class="fas fa-plus"></i> Aggiungi Mese
                    </button>
                </div>
                <div id="chart-${chartId}-data-list" class="chart-data-list">
                    ${chart.data.map((point, idx) => `
                        <div class="chart-data-point">
                            <div class="form-group">
                                <label>Mese (YYYY-MM)</label>
                                <input type="month" class="form-control" value="${point.month}" 
                                       onchange="updateChartDataPoint(${chartId}, ${idx}, 'month', this.value)">
                            </div>
                            <div class="form-group">
                                <label>Valore (${chart.currency})</label>
                                <input type="number" class="form-control" value="${point.value}" step="10"
                                       onchange="updateChartDataPoint(${chartId}, ${idx}, 'value', parseFloat(this.value))">
                            </div>
                            <button class="btn-danger" onclick="removeChartDataPoint(${chartId}, ${idx})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Event listeners per i campi principali
        const enabled = document.getElementById(`chart-${chartId}-enabled`);
        const titleIt = document.getElementById(`chart-${chartId}-title-it`);
        const titleEn = document.getElementById(`chart-${chartId}-title-en`);
        const profit = document.getElementById(`chart-${chartId}-profit`);
        const percentage = document.getElementById(`chart-${chartId}-percentage`);
        const currency = document.getElementById(`chart-${chartId}-currency`);
        const startDate = document.getElementById(`chart-${chartId}-start-date`);
        
        if (enabled) enabled.addEventListener('change', (e) => {
            chart.enabled = e.target.checked;
            this.hasUnsavedChanges = true;
        });
        
        if (titleIt) titleIt.addEventListener('change', (e) => {
            chart.title.it = e.target.value;
            this.hasUnsavedChanges = true;
        });
        
        if (titleEn) titleEn.addEventListener('change', (e) => {
            chart.title.en = e.target.value;
            this.hasUnsavedChanges = true;
        });
        
        if (profit) profit.addEventListener('change', (e) => {
            chart.totalProfit = parseFloat(e.target.value);
            this.hasUnsavedChanges = true;
        });
        
        if (percentage) percentage.addEventListener('change', (e) => {
            chart.totalPercentage = parseFloat(e.target.value);
            this.hasUnsavedChanges = true;
        });
        
        if (currency) currency.addEventListener('change', (e) => {
            chart.currency = e.target.value;
            this.hasUnsavedChanges = true;
        });
        
        if (startDate) startDate.addEventListener('change', (e) => {
            chart.startDate = e.target.value;
            this.hasUnsavedChanges = true;
        });
    }
    
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        const area = document.getElementById('notification-area');
        area.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Funzioni globali per i pulsanti
function saveSection(sectionName) {
    if (window.adminPanel) {
        window.adminPanel.saveAll();
    }
}

function testMyFxBook() {
    const resultEl = document.getElementById('myfxbook-test-result');
    resultEl.className = 'test-result success';
    resultEl.style.display = 'block';
    resultEl.textContent = 'Connessione simulata con successo. Implementare logica reale.';
}

// Funzioni per gestione benefit cards
function addBenefitCard() {
    if (!window.CONFIG.agentsBenefits) {
        window.CONFIG.agentsBenefits = [];
    }
    
    // Controlla limite massimo
    if (window.CONFIG.agentsBenefits.length >= 6) {
        alert('Massimo 6 benefit cards consentite');
        return;
    }
    
    // Trova il prossimo ID disponibile
    const maxId = window.CONFIG.agentsBenefits.reduce((max, b) => Math.max(max, b.id), 0);
    
    // Crea nuova benefit card
    const newBenefit = {
        id: maxId + 1,
        icon: 'fas fa-star',
        title: {
            it: 'Nuovo Benefit',
            en: 'New Benefit'
        },
        description: {
            it: 'Descrizione del benefit',
            en: 'Benefit description'
        },
        enabled: true
    };
    
    window.CONFIG.agentsBenefits.push(newBenefit);
    window.adminPanel.hasUnsavedChanges = true;
    window.adminPanel.loadAgentsBenefits();
    
    console.log('Nuova benefit card aggiunta:', newBenefit);
}

function removeBenefitCard(id) {
    if (!confirm('Sei sicuro di voler rimuovere questa benefit card?')) {
        return;
    }
    
    const index = window.CONFIG.agentsBenefits.findIndex(b => b.id === id);
    if (index !== -1) {
        window.CONFIG.agentsBenefits.splice(index, 1);
        window.adminPanel.hasUnsavedChanges = true;
        window.adminPanel.loadAgentsBenefits();
        console.log('Benefit card rimossa, ID:', id);
    }
}

function toggleBenefitCard(id) {
    const benefit = window.CONFIG.agentsBenefits.find(b => b.id === id);
    if (benefit) {
        benefit.enabled = !benefit.enabled;
        window.adminPanel.hasUnsavedChanges = true;
        window.adminPanel.loadAgentsBenefits();
        console.log(`Benefit card ${id} ${benefit.enabled ? 'abilitata' : 'disabilitata'}`);
    }
}

function selectIcon(benefitId, iconClass) {
    const benefit = window.CONFIG.agentsBenefits.find(b => b.id === benefitId);
    if (benefit) {
        benefit.icon = iconClass;
        window.adminPanel.hasUnsavedChanges = true;
        
        // Aggiorna la selezione visuale
        const selector = document.getElementById(`icon-selector-${benefitId}`);
        if (selector) {
            selector.querySelectorAll('.icon-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
        }
        
        console.log(`Icona aggiornata per benefit ${benefitId}:`, iconClass);
    }
}

function updateBenefitField(benefitId, field, lang, value) {
    const benefit = window.CONFIG.agentsBenefits.find(b => b.id === benefitId);
    if (benefit) {
        if (lang) {
            benefit[field][lang] = value;
        } else {
            benefit[field] = value;
        }
        window.adminPanel.hasUnsavedChanges = true;
        console.log(`Campo ${field} aggiornato per benefit ${benefitId}`);
    }
}

// Funzioni per gestione FAQ nel pannello admin
function addFAQItem() {
    if (!window.CONFIG.faqs) window.CONFIG.faqs = { it: { items: [] }, en: { items: [] } };
    const lang = window.adminPanel ? window.adminPanel.currentLang : 'it';
    const items = window.CONFIG.faqs[lang].items || [];
    if (items.length >= 10) {
        alert('Massimo 10 FAQ consentite');
        return;
    }

    const maxId = items.reduce((max, it) => Math.max(max, it.id || 0), 0);
    const newItem = { id: maxId + 1, question: 'Nuova Domanda', answer: 'Risposta...' };
    items.push(newItem);
    window.CONFIG.faqs[lang].items = items;
    window.adminPanel.hasUnsavedChanges = true;
    window.adminPanel.loadFAQEditor();
}

function removeFAQItem(id) {
    if (!confirm('Sei sicuro di voler rimuovere questa FAQ?')) return;
    const lang = window.adminPanel ? window.adminPanel.currentLang : 'it';
    const items = window.CONFIG.faqs[lang].items || [];
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
        items.splice(idx, 1);
        window.CONFIG.faqs[lang].items = items;
        window.adminPanel.hasUnsavedChanges = true;
        window.adminPanel.loadFAQEditor();
    }
}

function updateFAQField(id, field, lang, value) {
    if (!window.CONFIG.faqs || !window.CONFIG.faqs[lang]) return;
    const items = window.CONFIG.faqs[lang].items || [];
    const item = items.find(i => i.id === id);
    if (item) {
        item[field] = value;
        window.adminPanel.hasUnsavedChanges = true;
    }
}

// Funzioni globali per gestione grafici performance
function addChartDataPoint(chartId) {
    const chart = window.CONFIG.performanceCharts.charts.find(c => c.id === chartId);
    if (!chart) return;
    
    // Trova l'ultimo mese
    const lastPoint = chart.data[chart.data.length - 1];
    const lastDate = lastPoint ? new Date(lastPoint.month + '-01') : new Date(chart.startDate);
    
    // Aggiungi un mese
    lastDate.setMonth(lastDate.getMonth() + 1);
    const newMonth = lastDate.toISOString().substring(0, 7);
    
    // Aggiungi il nuovo punto
    chart.data.push({
        month: newMonth,
        value: lastPoint ? lastPoint.value + 100 : 100
    });
    
    window.adminPanel.hasUnsavedChanges = true;
    window.adminPanel.loadChartEditor(chartId);
}

function removeChartDataPoint(chartId, index) {
    if (!confirm('Rimuovere questo punto dati?')) return;
    
    const chart = window.CONFIG.performanceCharts.charts.find(c => c.id === chartId);
    if (!chart) return;
    
    chart.data.splice(index, 1);
    window.adminPanel.hasUnsavedChanges = true;
    window.adminPanel.loadChartEditor(chartId);
}

function updateChartDataPoint(chartId, index, field, value) {
    const chart = window.CONFIG.performanceCharts.charts.find(c => c.id === chartId);
    if (!chart || !chart.data[index]) return;
    
    chart.data[index][field] = value;
    window.adminPanel.hasUnsavedChanges = true;
}

// ========== STRATEGY CARDS FUNCTIONS ==========

function loadStrategyCardsEditor() {
    const container = document.getElementById('strategy-cards-editor');
    if (!container) return;

    const lang = window.adminPanel.currentLang || 'it';
    const data = (window.CONFIG.strategyCards && window.CONFIG.strategyCards[lang]) 
        ? window.CONFIG.strategyCards[lang] 
        : { overlayTitle: '', cards: [] };

    // Titolo overlay
    const titleEl = document.getElementById('strategy-overlay-title');
    if (titleEl) titleEl.value = data.overlayTitle || '';

    // Lista cards
    const listEl = document.getElementById('strategy-cards-list');
    listEl.innerHTML = '';

    if (!data.cards || data.cards.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-secondary)">Nessuna card presente. Aggiungi una nuova strategy card.</p>';
        return;
    }

    data.cards.forEach((card, idx) => {
        const cardEl = createStrategyCardEditor(card, idx, lang);
        listEl.appendChild(cardEl);
    });

    // Aggiorna pulsante di aggiunta
    const addBtn = document.getElementById('add-strategy-card-btn');
    if (addBtn) {
        addBtn.disabled = data.cards.length >= 5;
        addBtn.title = data.cards.length >= 5 ? 'Massimo 5 cards raggiunto' : 'Aggiungi nuova card';
    }
}

function createStrategyCardEditor(card, index, lang) {
    const div = document.createElement('div');
    div.className = 'strategy-card-editor-item';
    div.style.cssText = 'border: 2px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #f9f9f9;';
    
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: #333;">
                <i class="fas fa-layer-group"></i> Card ${index + 1}: ${card.title || 'Nuova Card'}
            </h4>
            <button class="btn btn-danger" onclick="removeStrategyCard('${card.id}')">
                <i class="fas fa-trash"></i> Rimuovi
            </button>
        </div>

        <div class="form-group">
            <label>Titolo Card</label>
            <input type="text" class="form-control" value="${card.title || ''}" 
                   onchange="updateStrategyCardField('${card.id}', 'title', '${lang}', this.value)">
        </div>

        <div class="form-group">
            <label>Descrizione (HTML con Rich Text Editor)</label>
            
            <!-- Rich Text Toolbar -->
            <div class="rich-text-toolbar" style="background: #fff; padding: 8px; border: 1px solid #ddd; border-radius: 4px 4px 0 0; display: flex; gap: 5px; flex-wrap: wrap;">
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'bold')" title="Grassetto">
                    <i class="fas fa-bold"></i>
                </button>
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'italic')" title="Corsivo">
                    <i class="fas fa-italic"></i>
                </button>
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'underline')" title="Sottolineato">
                    <i class="fas fa-underline"></i>
                </button>
                <span style="width: 1px; background: #ddd; margin: 0 5px;"></span>
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'alignLeft')" title="Allinea Sinistra">
                    <i class="fas fa-align-left"></i>
                </button>
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'alignCenter')" title="Allinea Centro">
                    <i class="fas fa-align-center"></i>
                </button>
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'alignRight')" title="Allinea Destra">
                    <i class="fas fa-align-right"></i>
                </button>
                <span style="width: 1px; background: #ddd; margin: 0 5px;"></span>
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'insertUnorderedList')" title="Elenco Puntato">
                    <i class="fas fa-list-ul"></i>
                </button>
                <button type="button" class="toolbar-btn" onclick="formatText('${card.id}', 'insertOrderedList')" title="Elenco Numerato">
                    <i class="fas fa-list-ol"></i>
                </button>
                <span style="width: 1px; background: #ddd; margin: 0 5px;"></span>
                <button type="button" class="toolbar-btn" onclick="clearFormatting('${card.id}')" title="Rimuovi Formattazione">
                    <i class="fas fa-eraser"></i>
                </button>
            </div>
            
            <!-- Contenteditable Rich Text Area -->
            <div id="editor-${card.id}" class="rich-text-editor" contenteditable="true"
                 style="min-height: 150px; padding: 12px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 4px 4px; background: #fff; font-family: inherit; font-size: 14px; line-height: 1.6;"
                 oninput="updateStrategyCardDescription('${card.id}', '${lang}', this.innerHTML)">${card.description || '<p>Inserisci la descrizione...</p>'}</div>
            
            <small style="color: #666; margin-top: 5px; display: block;">
                Usa i pulsanti sopra per formattare il testo. Supporta HTML: &lt;strong&gt;, &lt;em&gt;, &lt;u&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;p&gt;
            </small>
        </div>

        <div class="form-group">
            <label>Testo Pulsante</label>
            <input type="text" class="form-control" value="${card.buttonText || 'Inizia Ora'}" 
                   onchange="updateStrategyCardField('${card.id}', 'buttonText', '${lang}', this.value)">
        </div>

        <div class="form-group">
            <label>Link Pulsante</label>
            <input type="url" class="form-control" value="${card.buttonLink || ''}" 
                   placeholder="https://t.me/linearitytrading"
                   onchange="updateStrategyCardField('${card.id}', 'buttonLink', '${lang}', this.value)">
        </div>
    `;

    return div;
}

function addStrategyCard() {
    const lang = window.adminPanel.currentLang || 'it';
    if (!window.CONFIG.strategyCards) window.CONFIG.strategyCards = { it: { cards: [] }, en: { cards: [] } };
    if (!window.CONFIG.strategyCards[lang]) window.CONFIG.strategyCards[lang] = { overlayTitle: '', cards: [] };
    
    const cards = window.CONFIG.strategyCards[lang].cards;
    
    if (cards.length >= 5) {
        alert('Massimo 5 strategy cards consentite!');
        return;
    }

    const newCard = {
        id: `card-${Date.now()}`,
        title: `Nuova Strategia ${cards.length + 1}`,
        description: '<p>Descrivi la strategia qui...</p>',
        buttonText: 'Inizia Ora',
        buttonLink: 'https://t.me/linearitytrading'
    };

    cards.push(newCard);
    window.adminPanel.hasUnsavedChanges = true;
    loadStrategyCardsEditor();
}

function removeStrategyCard(cardId) {
    if (!confirm('Rimuovere questa strategy card?')) return;

    const lang = window.adminPanel.currentLang || 'it';
    if (!window.CONFIG.strategyCards || !window.CONFIG.strategyCards[lang]) return;

    const cards = window.CONFIG.strategyCards[lang].cards;
    const index = cards.findIndex(c => c.id === cardId);
    
    if (index !== -1) {
        cards.splice(index, 1);
        window.adminPanel.hasUnsavedChanges = true;
        loadStrategyCardsEditor();
    }
}

function updateStrategyCardField(cardId, field, lang, value) {
    if (!window.CONFIG.strategyCards || !window.CONFIG.strategyCards[lang]) return;
    
    const card = window.CONFIG.strategyCards[lang].cards.find(c => c.id === cardId);
    if (card) {
        card[field] = value;
        window.adminPanel.hasUnsavedChanges = true;
        
        // Aggiorna titolo nella UI se è cambiato
        if (field === 'title') {
            loadStrategyCardsEditor();
        }
    }
}

function updateStrategyCardDescription(cardId, lang, htmlContent) {
    if (!window.CONFIG.strategyCards || !window.CONFIG.strategyCards[lang]) return;
    
    const card = window.CONFIG.strategyCards[lang].cards.find(c => c.id === cardId);
    if (card) {
        card.description = htmlContent;
        window.adminPanel.hasUnsavedChanges = true;
    }
}

// Rich Text Editor Functions
function formatText(cardId, command) {
    const editor = document.getElementById(`editor-${cardId}`);
    if (!editor) return;
    
    editor.focus();
    
    // Gestisci comandi speciali di allineamento
    if (command.startsWith('align')) {
        const alignment = command.replace('align', '').toLowerCase();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;
        
        // Trova il paragrafo genitore
        let block = parentElement;
        while (block && block !== editor && block.tagName !== 'P' && block.tagName !== 'DIV') {
            block = block.parentElement;
        }
        
        if (block && block !== editor) {
            block.style.textAlign = alignment;
        }
    } else {
        // Esegui comando standard
        document.execCommand(command, false, null);
    }
    
    // Aggiorna il contenuto
    const lang = window.adminPanel.currentLang || 'it';
    updateStrategyCardDescription(cardId, lang, editor.innerHTML);
}

function clearFormatting(cardId) {
    const editor = document.getElementById(`editor-${cardId}`);
    if (!editor) return;
    
    editor.focus();
    document.execCommand('removeFormat', false, null);
    
    const lang = window.adminPanel.currentLang || 'it';
    updateStrategyCardDescription(cardId, lang, editor.innerHTML);
}

// Aggiungi le strategy cards al sistema di salvataggio
AdminPanel.prototype.loadStrategyCardsEditor = loadStrategyCardsEditor;

/**
 * CONTEXT MENU - Rinominazione Sezioni
 */
AdminPanel.prototype.setupContextMenu = function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contextMenu = document.getElementById('nav-context-menu');
    let currentTargetNav = null;
    
    // Nascondi context menu quando si clicca altrove
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
    
    navItems.forEach(item => {
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            currentTargetNav = item;
            
            // Posiziona il context menu
            contextMenu.style.display = 'block';
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
        });
    });
    
    // Click su "Rinomina"
    document.getElementById('context-rename').addEventListener('click', () => {
        if (currentTargetNav) {
            this.openRenameModal(currentTargetNav);
        }
        contextMenu.style.display = 'none';
    });
};

/**
 * MODAL RINOMINAZIONE
 */
AdminPanel.prototype.setupRenameModal = function() {
    const modal = document.getElementById('rename-modal');
    const closeBtn = document.getElementById('close-rename-modal');
    const cancelBtn = document.getElementById('cancel-rename');
    const saveBtn = document.getElementById('save-rename');
    const input = document.getElementById('rename-input');
    
    let currentNavItem = null;
    
    // Chiudi modal
    const closeModal = () => {
        modal.style.display = 'none';
        input.value = '';
        currentNavItem = null;
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Click fuori dal modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Salva rinominazione
    saveBtn.addEventListener('click', () => {
        const newName = input.value.trim();
        
        if (!newName) {
            this.showNotification('error', 'Inserisci un nome valido');
            return;
        }
        
        if (currentNavItem) {
            const span = currentNavItem.querySelector('span');
            if (span) {
                span.textContent = newName;
                this.showNotification('success', `Sezione rinominata in "${newName}"`);
                this.hasUnsavedChanges = true;
            }
        }
        
        closeModal();
    });
    
    // Salva con Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
    
    // Memorizza la funzione per aprire il modal
    this.openRenameModal = (navItem) => {
        currentNavItem = navItem;
        const span = navItem.querySelector('span');
        const currentName = span ? span.textContent : '';
        
        input.value = currentName;
        modal.style.display = 'flex';
        
        // Focus e selezione del testo
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    };
};

/**
 * RICH TEXT EDITORS - Strategie
 */
AdminPanel.prototype.setupRichTextEditors = function() {
    const toolbars = document.querySelectorAll('.rich-text-toolbar');
    
    toolbars.forEach(toolbar => {
        const target = toolbar.getAttribute('data-target');
        const buttons = toolbar.querySelectorAll('.toolbar-btn');
        const fontSelect = toolbar.querySelector('.toolbar-select[data-command="fontSize"]');
        const lineHeightSelect = toolbar.querySelector('.toolbar-select[data-command="lineHeight"]');
        
        // Handler per i pulsanti della toolbar
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.getAttribute('data-command');
                
                // Trova l'editor corrispondente
                const editor = document.querySelector(`[data-field="${target}"]`);
                if (!editor) return;
                
                editor.focus();
                
                // Per gli elenchi, usa un approccio diverso per garantire la compatibilità
                if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
                    document.execCommand(command, false, null);
                    // Forza lo stato attivo del pulsante
                    btn.classList.toggle('active');
                } else {
                    document.execCommand(command, false, null);
                }
                
                // Visual feedback
                if (!btn.classList.contains('list-btn')) {
                    btn.classList.add('active');
                    setTimeout(() => btn.classList.remove('active'), 200);
                }
            });
        });
        
        // Handler per il selettore font size
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                const size = e.target.value;
                if (!size) return;
                
                const editor = document.querySelector(`[data-field="${target}"]`);
                if (!editor) return;
                
                editor.focus();
                document.execCommand('fontSize', false, size);
                
                // Reset select
                setTimeout(() => e.target.value = '', 100);
            });
        }
        
        // Handler per il selettore interlinea
        if (lineHeightSelect) {
            lineHeightSelect.addEventListener('change', (e) => {
                const lineHeight = e.target.value;
                if (!lineHeight) return;
                
                const editor = document.querySelector(`[data-field="${target}"]`);
                if (!editor) return;
                
                editor.focus();
                
                // Mappa valori a classi CSS
                const classMap = {
                    '1': 'lh-1',
                    '1.15': 'lh-115',
                    '1.5': 'lh-15',
                    '1.8': 'lh-18',
                    '2': 'lh-2',
                    '2.5': 'lh-25'
                };
                
                const className = classMap[lineHeight];
                if (!className) return;
                
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const selectedText = range.toString();
                    
                    if (selectedText) {
                        // Applica a selezione
                        const span = document.createElement('span');
                        span.className = className;
                        try {
                            range.surroundContents(span);
                        } catch (err) {
                            // Se fallisce, usa un approccio diverso
                            const contents = range.extractContents();
                            span.appendChild(contents);
                            range.insertNode(span);
                        }
                    } else {
                        // Applica a tutto l'editor
                        editor.className = 'rich-text-editor ' + className;
                    }
                }
                
                // Reset select
                setTimeout(() => e.target.value = '', 100);
            });
        }
    });
    
    // Handler per i pulsanti di allineamento del titolo
    const alignmentButtons = document.querySelectorAll('.alignment-btn');
    alignmentButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Rimuovi active da tutti i pulsanti dello stesso gruppo
            const group = btn.parentElement;
            group.querySelectorAll('.alignment-btn').forEach(b => b.classList.remove('active'));
            
            // Aggiungi active al pulsante cliccato
            btn.classList.add('active');
            
            this.hasUnsavedChanges = true;
        });
    });
    
    // Handler per i pulsanti di stile del titolo (bold, italic, underline)
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle active
            btn.classList.toggle('active');
            
            this.hasUnsavedChanges = true;
        });
    });
};

// Funzione globale per salvare le impostazioni agenti
async function saveAgentsSettings() {
    const section = document.getElementById('tab-agents-general');
    if (!section) return;
    
    const getFieldValue = (field) => {
        const el = section.querySelector(`[data-field="${field}"]`);
        return el ? (el.value || el.textContent) : '';
    };
    
    const getStyleState = (field) => {
        const el = section.querySelector(`.style-btn[data-field="${field}"]`);
        return el ? el.classList.contains('active') : false;
    };
    
    const data = {
        title: {
            it: getFieldValue('agents-title-it'),
            en: getFieldValue('agents-title-en'),
            fontSize: getFieldValue('agents-title-font-size'),
            bold: getStyleState('agents-title-bold'),
            italic: getStyleState('agents-title-italic'),
            underline: getStyleState('agents-title-underline')
        },
        subtitle: {
            it: getFieldValue('agents-subtitle-it'),
            en: getFieldValue('agents-subtitle-en'),
            fontSize: getFieldValue('agents-subtitle-font-size'),
            bold: getStyleState('agents-subtitle-bold'),
            italic: getStyleState('agents-subtitle-italic'),
            underline: getStyleState('agents-subtitle-underline')
        },
        cta: {
            title: {
                it: getFieldValue('agents-cta-title-it'),
                en: getFieldValue('agents-cta-title-en'),
                fontSize: getFieldValue('agents-cta-title-font-size'),
                bold: getStyleState('agents-cta-title-bold'),
                italic: getStyleState('agents-cta-title-italic'),
                underline: getStyleState('agents-cta-title-underline')
            },
            description: {
                it: getFieldValue('agents-cta-desc-it'),
                en: getFieldValue('agents-cta-desc-en'),
                fontSize: getFieldValue('agents-cta-desc-font-size'),
                bold: getStyleState('agents-cta-desc-bold'),
                italic: getStyleState('agents-cta-desc-italic'),
                underline: getStyleState('agents-cta-desc-underline')
            },
            button: {
                it: getFieldValue('agents-cta-btn-it'),
                en: getFieldValue('agents-cta-btn-en'),
                link: getFieldValue('agents-cta-btn-link')
            }
        }
    };
    
    try {
        const response = await fetch('/api/config/agents-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.CONFIG.agentsSettings = data;
            window.adminPanel.showNotification('success', 'Impostazioni agenti salvate con successo!');
            window.adminPanel.hasUnsavedChanges = false;
        } else {
            window.adminPanel.showNotification('error', 'Errore salvataggio: ' + result.error);
        }
    } catch (error) {
        console.error('Errore salvataggio impostazioni agenti:', error);
        window.adminPanel.showNotification('error', 'Errore di rete durante il salvataggio');
    }
}

// ==================== CONTACT SECTION MANAGEMENT ====================

let contactItemsData = [];
let nextContactItemId = 1;

// Carica le impostazioni contatti
async function loadContactSettings() {
    try {
        const response = await fetch('/api/config/contact-settings');
        const data = await response.json();
        
        const section = document.getElementById('section-contact');
        if (!section) return;
        
        // Carica titolo
        window.adminPanel.setFormValue(section, 'contact-title-it', data.title.it);
        window.adminPanel.setFormValue(section, 'contact-title-en', data.title.en);
        window.adminPanel.setFormValue(section, 'contact-title-font-size', data.title.fontSize);
        section.querySelector('.style-btn[data-field="contact-title-bold"]')?.classList.toggle('active', data.title.bold);
        section.querySelector('.style-btn[data-field="contact-title-italic"]')?.classList.toggle('active', data.title.italic);
        section.querySelector('.style-btn[data-field="contact-title-underline"]')?.classList.toggle('active', data.title.underline);
        
        // Carica sottotitolo
        window.adminPanel.setFormValue(section, 'contact-subtitle-it', data.subtitle.it);
        window.adminPanel.setFormValue(section, 'contact-subtitle-en', data.subtitle.en);
        window.adminPanel.setFormValue(section, 'contact-subtitle-font-size', data.subtitle.fontSize);
        section.querySelector('.style-btn[data-field="contact-subtitle-bold"]')?.classList.toggle('active', data.subtitle.bold);
        section.querySelector('.style-btn[data-field="contact-subtitle-italic"]')?.classList.toggle('active', data.subtitle.italic);
        section.querySelector('.style-btn[data-field="contact-subtitle-underline"]')?.classList.toggle('active', data.subtitle.underline);
        
        // Carica contact items
        contactItemsData = data.contactItems || [];
        if (contactItemsData.length > 0) {
            nextContactItemId = Math.max(...contactItemsData.map(item => item.id)) + 1;
        }
        renderContactItems();
        
        // Carica form settings
        const formEnabled = data.contactForm?.enabled !== false;
        document.getElementById('contact-form-enabled').checked = formEnabled;
        
        window.adminPanel.setFormValue(section, 'contact-form-name-it', data.contactForm?.nameLabel?.it || 'Nome');
        window.adminPanel.setFormValue(section, 'contact-form-name-en', data.contactForm?.nameLabel?.en || 'Name');
        window.adminPanel.setFormValue(section, 'contact-form-email-it', data.contactForm?.emailLabel?.it || 'Email');
        window.adminPanel.setFormValue(section, 'contact-form-email-en', data.contactForm?.emailLabel?.en || 'Email');
        window.adminPanel.setFormValue(section, 'contact-form-message-it', data.contactForm?.messageLabel?.it || 'Messaggio');
        window.adminPanel.setFormValue(section, 'contact-form-message-en', data.contactForm?.messageLabel?.en || 'Message');
        window.adminPanel.setFormValue(section, 'contact-form-submit-it', data.contactForm?.submitButton?.it || 'Invia Messaggio');
        window.adminPanel.setFormValue(section, 'contact-form-submit-en', data.contactForm?.submitButton?.en || 'Send Message');
        
        // Setup form toggle
        document.getElementById('contact-form-enabled').addEventListener('change', (e) => {
            document.getElementById('contact-form-settings').style.display = e.target.checked ? 'block' : 'none';
        });
        
        document.getElementById('contact-form-settings').style.display = formEnabled ? 'block' : 'none';
        
    } catch (error) {
        console.error('Errore caricamento impostazioni contatti:', error);
    }
}

// Icone disponibili per i contact items
const contactIcons = [
    'envelope', 'phone', 'mobile', 'telegram', 'whatsapp', 
    'instagram', 'facebook', 'twitter', 'linkedin', 'youtube',
    'tiktok', 'discord', 'map-marker', 'clock', 'globe',
    'link', 'briefcase', 'building', 'fax'
];

// Rende tutti i contact items
function renderContactItems() {
    const container = document.getElementById('contact-items-list');
    if (!container) return;
    
    container.innerHTML = contactItemsData.map((item, index) => `
        <div class="contact-item-editor ${!item.enabled ? 'disabled' : ''}" data-item-id="${item.id}">
            <div class="contact-item-header">
                <h4>
                    <i class="${getContactIconClass(item.icon)}"></i>
                    Contact Item #${index + 1}
                </h4>
                <div class="contact-item-actions">
                    <button class="btn-toggle ${!item.enabled ? 'disabled' : ''}" onclick="toggleContactItem(${item.id})">
                        <i class="fas fa-${item.enabled ? 'eye' : 'eye-slash'}"></i>
                        ${item.enabled ? 'Abilitato' : 'Disabilitato'}
                    </button>
                    <button class="btn-danger" onclick="removeContactItem(${item.id})">
                        <i class="fas fa-trash"></i> Elimina
                    </button>
                </div>
            </div>
            
            <div class="contact-item-fields">
                <!-- Icona -->
                <div class="form-group full-width">
                    <label>Icona</label>
                    <div class="icon-selector">
                        ${contactIcons.map(icon => `
                            <div class="icon-option ${item.icon === icon ? 'selected' : ''}" 
                                 onclick="selectContactIcon(${item.id}, '${icon}')">
                                <i class="${getContactIconClass(icon)}"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Titolo IT/EN -->
                <div class="form-group">
                    <label>Titolo (IT)</label>
                    <input type="text" class="form-control" value="${item.title.it}" 
                           oninput="updateContactItem(${item.id}, 'title.it', this.value)">
                </div>
                <div class="form-group">
                    <label>Titolo (EN)</label>
                    <input type="text" class="form-control" value="${item.title.en}" 
                           oninput="updateContactItem(${item.id}, 'title.en', this.value)">
                </div>
                
                <!-- Contenuto -->
                <div class="form-group full-width">
                    <label>Contenuto Visualizzato</label>
                    <input type="text" class="form-control" value="${item.content}" 
                           oninput="updateContactItem(${item.id}, 'content', this.value)"
                           placeholder="Es: info@example.com, +39 123 456 789, @username">
                </div>
                
                <!-- Link Type -->
                <div class="form-group">
                    <label>Tipo di Link</label>
                    <select class="form-control" onchange="updateContactItem(${item.id}, 'linkType', this.value)">
                        <option value="email" ${item.linkType === 'email' ? 'selected' : ''}>Email (mailto:)</option>
                        <option value="phone" ${item.linkType === 'phone' ? 'selected' : ''}>Telefono (tel:)</option>
                        <option value="url" ${item.linkType === 'url' ? 'selected' : ''}>URL (https://)</option>
                    </select>
                </div>
                
                <!-- Link -->
                <div class="form-group">
                    <label>Link</label>
                    <input type="text" class="form-control" value="${item.link}" 
                           oninput="updateContactItem(${item.id}, 'link', this.value)"
                           placeholder="${getLinkPlaceholder(item.linkType)}">
                </div>
            </div>
        </div>
    `).join('');
}

// Helper per ottenere il placeholder del link
function getLinkPlaceholder(linkType) {
    switch (linkType) {
        case 'email': return 'mailto:info@example.com';
        case 'phone': return 'tel:+390123456789';
        case 'url': return 'https://t.me/username';
        default: return '';
    }
}

// Helper per ottenere la classe dell'icona
function getContactIconClass(iconName) {
    const iconMap = {
        'envelope': 'fas fa-envelope',
        'phone': 'fas fa-phone',
        'mobile': 'fas fa-mobile-alt',
        'telegram': 'fab fa-telegram',
        'whatsapp': 'fab fa-whatsapp',
        'instagram': 'fab fa-instagram',
        'facebook': 'fab fa-facebook',
        'twitter': 'fab fa-twitter',
        'linkedin': 'fab fa-linkedin',
        'youtube': 'fab fa-youtube',
        'tiktok': 'fab fa-tiktok',
        'discord': 'fab fa-discord',
        'map-marker': 'fas fa-map-marker-alt',
        'clock': 'fas fa-clock',
        'globe': 'fas fa-globe',
        'link': 'fas fa-link',
        'briefcase': 'fas fa-briefcase',
        'building': 'fas fa-building',
        'fax': 'fas fa-fax'
    };
    return iconMap[iconName] || 'fas fa-circle';
}

// Aggiungi un nuovo contact item
function addContactItem() {
    const newItem = {
        id: nextContactItemId++,
        enabled: true,
        icon: 'envelope',
        title: {
            it: 'Nuovo Contatto',
            en: 'New Contact'
        },
        content: '',
        link: '',
        linkType: 'email'
    };
    
    contactItemsData.push(newItem);
    renderContactItems();
    window.adminPanel.hasUnsavedChanges = true;
}

// Rimuovi un contact item
function removeContactItem(id) {
    if (!confirm('Sei sicuro di voler eliminare questo contact item?')) return;
    
    contactItemsData = contactItemsData.filter(item => item.id !== id);
    renderContactItems();
    window.adminPanel.hasUnsavedChanges = true;
}

// Toggle visibilità contact item
function toggleContactItem(id) {
    const item = contactItemsData.find(i => i.id === id);
    if (item) {
        item.enabled = !item.enabled;
        renderContactItems();
        window.adminPanel.hasUnsavedChanges = true;
    }
}

// Aggiorna un campo del contact item
function updateContactItem(id, field, value) {
    const item = contactItemsData.find(i => i.id === id);
    if (!item) return;
    
    const fields = field.split('.');
    if (fields.length === 2) {
        item[fields[0]][fields[1]] = value;
    } else {
        item[field] = value;
    }
    
    window.adminPanel.hasUnsavedChanges = true;
}

// Seleziona icona per contact item
function selectContactIcon(id, icon) {
    const item = contactItemsData.find(i => i.id === id);
    if (item) {
        item.icon = icon;
        renderContactItems();
        window.adminPanel.hasUnsavedChanges = true;
    }
}

// Salva le impostazioni contatti
async function saveContactSettings() {
    const section = document.getElementById('section-contact');
    if (!section) return;
    
    const getFieldValue = (field) => {
        const el = section.querySelector(`[data-field="${field}"]`);
        return el ? (el.value || el.textContent) : '';
    };
    
    const getStyleState = (field) => {
        const el = section.querySelector(`.style-btn[data-field="${field}"]`);
        return el ? el.classList.contains('active') : false;
    };
    
    const data = {
        title: {
            it: getFieldValue('contact-title-it'),
            en: getFieldValue('contact-title-en'),
            fontSize: getFieldValue('contact-title-font-size'),
            bold: getStyleState('contact-title-bold'),
            italic: getStyleState('contact-title-italic'),
            underline: getStyleState('contact-title-underline')
        },
        subtitle: {
            it: getFieldValue('contact-subtitle-it'),
            en: getFieldValue('contact-subtitle-en'),
            fontSize: getFieldValue('contact-subtitle-font-size'),
            bold: getStyleState('contact-subtitle-bold'),
            italic: getStyleState('contact-subtitle-italic'),
            underline: getStyleState('contact-subtitle-underline')
        },
        contactItems: contactItemsData,
        contactForm: {
            enabled: document.getElementById('contact-form-enabled').checked,
            nameLabel: {
                it: getFieldValue('contact-form-name-it'),
                en: getFieldValue('contact-form-name-en')
            },
            emailLabel: {
                it: getFieldValue('contact-form-email-it'),
                en: getFieldValue('contact-form-email-en')
            },
            messageLabel: {
                it: getFieldValue('contact-form-message-it'),
                en: getFieldValue('contact-form-message-en')
            },
            submitButton: {
                it: getFieldValue('contact-form-submit-it'),
                en: getFieldValue('contact-form-submit-en')
            }
        }
    };
    
    try {
        const response = await fetch('/api/config/contact-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.CONFIG.contactSettings = data;
            window.adminPanel.showNotification('success', 'Impostazioni contatti salvate con successo!');
            window.adminPanel.hasUnsavedChanges = false;
        } else {
            window.adminPanel.showNotification('error', 'Errore salvataggio: ' + result.error);
        }
    } catch (error) {
        console.error('Errore salvataggio impostazioni contatti:', error);
        window.adminPanel.showNotification('error', 'Errore di rete durante il salvataggio');
    }
}

// ==================== ABOUT SECTION MANAGEMENT ====================

let aboutFeaturesData = [];
let nextAboutFeatureId = 1;

// Icone disponibili per le features
const featureIcons = [
    'check-circle', 'check', 'star', 'shield-alt', 'rocket',
    'chart-line', 'users', 'trophy', 'lock', 'clock',
    'bolt', 'heart', 'thumbs-up', 'award', 'gem',
    'crown', 'fire', 'lightbulb', 'medal', 'flag'
];

// Carica le impostazioni about
async function loadAboutSettings() {
    try {
        const response = await fetch('/api/config/about-settings');
        const data = await response.json();
        
        const section = document.getElementById('section-about');
        if (!section) return;
        
        // Carica titolo
        window.adminPanel.setFormValue(section, 'about-title-it', data.title.it);
        window.adminPanel.setFormValue(section, 'about-title-en', data.title.en);
        window.adminPanel.setFormValue(section, 'about-title-font-size', data.title.fontSize);
        section.querySelector('.style-btn[data-field="about-title-bold"]')?.classList.toggle('active', data.title.bold);
        section.querySelector('.style-btn[data-field="about-title-italic"]')?.classList.toggle('active', data.title.italic);
        section.querySelector('.style-btn[data-field="about-title-underline"]')?.classList.toggle('active', data.title.underline);
        setAlignmentButton(section, 'about-title-align', data.title.align || 'left');
        window.adminPanel.setFormValue(section, 'about-title-margin-bottom', data.title.marginBottom || '20');
        
        // Carica descrizione
        window.adminPanel.setFormValue(section, 'about-desc-it', data.description.it);
        window.adminPanel.setFormValue(section, 'about-desc-en', data.description.en);
        window.adminPanel.setFormValue(section, 'about-desc-font-size', data.description.fontSize);
        section.querySelector('.style-btn[data-field="about-desc-bold"]')?.classList.toggle('active', data.description.bold);
        section.querySelector('.style-btn[data-field="about-desc-italic"]')?.classList.toggle('active', data.description.italic);
        section.querySelector('.style-btn[data-field="about-desc-underline"]')?.classList.toggle('active', data.description.underline);
        setAlignmentButton(section, 'about-desc-align', data.description.align || 'left');
        window.adminPanel.setFormValue(section, 'about-desc-lineheight', data.description.lineHeight || '1.6');
        
        // Carica features
        window.adminPanel.setFormValue(section, 'about-features-position', data.featuresPosition || 'bottom');
        aboutFeaturesData = data.features || [];
        if (aboutFeaturesData.length > 0) {
            nextAboutFeatureId = Math.max(...aboutFeaturesData.map(f => f.id)) + 1;
        }
        renderAboutFeatures();
        
        // Carica impostazioni immagine
        const imageEnabled = data.image?.enabled !== false;
        document.getElementById('about-image-enabled').checked = imageEnabled;
        
        window.adminPanel.setFormValue(section, 'about-image-src', data.image?.src || 'images/about-visual.jpg');
        window.adminPanel.setFormValue(section, 'about-image-alt', data.image?.alt || 'Trading');
        window.adminPanel.setFormValue(section, 'about-image-position', data.image?.position || 'right');
        window.adminPanel.setFormValue(section, 'about-image-width', data.image?.width || '100');
        window.adminPanel.setFormValue(section, 'about-image-opacity', data.image?.opacity || '100');
        
        // Bordo
        const borderEnabled = data.image?.border?.enabled || false;
        document.getElementById('about-image-border-enabled').checked = borderEnabled;
        window.adminPanel.setFormValue(section, 'about-image-border-color', data.image?.border?.color || '#ffffff');
        window.adminPanel.setFormValue(section, 'about-image-border-width', data.image?.border?.width || '2');
        document.getElementById('about-image-border-settings').style.display = borderEnabled ? 'block' : 'none';
        
        // Ombra
        const shadowEnabled = data.image?.shadow?.enabled || false;
        document.getElementById('about-image-shadow-enabled').checked = shadowEnabled;
        window.adminPanel.setFormValue(section, 'about-image-shadow-blur', data.image?.shadow?.blur || '20');
        window.adminPanel.setFormValue(section, 'about-image-shadow-color', data.image?.shadow?.color || '#000000');
        document.getElementById('about-image-shadow-settings').style.display = shadowEnabled ? 'block' : 'none';
        
        // Bagliore
        const glowEnabled = data.image?.glow?.enabled || false;
        document.getElementById('about-image-glow-enabled').checked = glowEnabled;
        window.adminPanel.setFormValue(section, 'about-image-glow-blur', data.image?.glow?.blur || '20');
        window.adminPanel.setFormValue(section, 'about-image-glow-color', data.image?.glow?.color || '#C8A25E');
        document.getElementById('about-image-glow-settings').style.display = glowEnabled ? 'block' : 'none';
        
        document.getElementById('about-image-settings').style.display = imageEnabled ? 'block' : 'none';
        
        // Carica CTA
        const ctaEnabled = data.cta?.enabled !== false;
        document.getElementById('about-cta-enabled').checked = ctaEnabled;
        window.adminPanel.setFormValue(section, 'about-cta-text-it', data.cta?.text?.it || 'Inizia Ora');
        window.adminPanel.setFormValue(section, 'about-cta-text-en', data.cta?.text?.en || 'Start Now');
        window.adminPanel.setFormValue(section, 'about-cta-link', data.cta?.link || '#contact');
        window.adminPanel.setFormValue(section, 'about-cta-align', data.cta?.align || 'left');
        document.getElementById('about-cta-overlay').checked = data.cta?.openStrategyOverlay !== false;
        document.getElementById('about-cta-settings').style.display = ctaEnabled ? 'block' : 'none';
        
        // Setup toggles
        setupAboutToggles();
        
    } catch (error) {
        console.error('Errore caricamento impostazioni about:', error);
    }
}

function setupAboutToggles() {
    // Toggle immagine
    document.getElementById('about-image-enabled')?.addEventListener('change', (e) => {
        document.getElementById('about-image-settings').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Toggle bordo
    document.getElementById('about-image-border-enabled')?.addEventListener('change', (e) => {
        document.getElementById('about-image-border-settings').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Toggle ombra
    document.getElementById('about-image-shadow-enabled')?.addEventListener('change', (e) => {
        document.getElementById('about-image-shadow-settings').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Toggle bagliore
    document.getElementById('about-image-glow-enabled')?.addEventListener('change', (e) => {
        document.getElementById('about-image-glow-settings').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Toggle CTA
    document.getElementById('about-cta-enabled')?.addEventListener('change', (e) => {
        document.getElementById('about-cta-settings').style.display = e.target.checked ? 'block' : 'none';
    });
}

function setupHeroToggles() {
    // Toggle visual
    document.getElementById('hero-visual-enabled')?.addEventListener('change', (e) => {
        document.getElementById('hero-visual-settings').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Toggle CTA
    document.getElementById('hero-cta-enabled')?.addEventListener('change', (e) => {
        document.getElementById('hero-cta-settings').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Toggle Attachments
    document.getElementById('strategy-attachments-enabled')?.addEventListener('change', (e) => {
        document.getElementById('strategy-attachments-container').style.display = e.target.checked ? 'block' : 'none';
    });
}

function setAlignmentButton(section, fieldName, value) {
    const buttons = section.querySelectorAll(`.alignment-btn[data-field="${fieldName}"]`);
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
}

// Rende tutte le features
function renderAboutFeatures() {
    const container = document.getElementById('about-features-list');
    if (!container) return;
    
    container.innerHTML = aboutFeaturesData.map((feature, index) => `
        <div class="about-feature-editor ${!feature.enabled ? 'disabled' : ''}" data-feature-id="${feature.id}">
            <div class="about-feature-header">
                <h4>
                    <i class="${getFeatureIconClass(feature.icon)}"></i>
                    Feature #${index + 1}
                </h4>
                <div class="about-feature-actions">
                    <button class="btn-toggle ${!feature.enabled ? 'disabled' : ''}" onclick="toggleAboutFeature(${feature.id})">
                        <i class="fas fa-${feature.enabled ? 'eye' : 'eye-slash'}"></i>
                        ${feature.enabled ? 'Abilitata' : 'Disabilitata'}
                    </button>
                    <button class="btn-danger" onclick="removeAboutFeature(${feature.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="about-feature-fields">
                <!-- Icona -->
                <div class="form-group">
                    <label>Icona</label>
                    <select class="form-control" onchange="updateAboutFeature(${feature.id}, 'icon', this.value)">
                        ${featureIcons.map(icon => `
                            <option value="${icon}" ${feature.icon === icon ? 'selected' : ''}>
                                ${icon}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Testo IT -->
                <div class="form-group">
                    <label>Testo (IT)</label>
                    <input type="text" class="form-control" value="${feature.text.it}" 
                           oninput="updateAboutFeature(${feature.id}, 'text.it', this.value)">
                </div>
                
                <!-- Testo EN -->
                <div class="form-group">
                    <label>Testo (EN)</label>
                    <input type="text" class="form-control" value="${feature.text.en}" 
                           oninput="updateAboutFeature(${feature.id}, 'text.en', this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

function getFeatureIconClass(iconName) {
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

// Aggiungi feature
function addAboutFeature() {
    const newFeature = {
        id: nextAboutFeatureId++,
        enabled: true,
        icon: 'check-circle',
        text: {
            it: 'Nuova caratteristica',
            en: 'New feature'
        }
    };
    
    aboutFeaturesData.push(newFeature);
    renderAboutFeatures();
    window.adminPanel.hasUnsavedChanges = true;
}

// Rimuovi feature
function removeAboutFeature(id) {
    if (!confirm('Sei sicuro di voler eliminare questa feature?')) return;
    
    aboutFeaturesData = aboutFeaturesData.filter(f => f.id !== id);
    renderAboutFeatures();
    window.adminPanel.hasUnsavedChanges = true;
}

// Toggle feature
function toggleAboutFeature(id) {
    const feature = aboutFeaturesData.find(f => f.id === id);
    if (feature) {
        feature.enabled = !feature.enabled;
        renderAboutFeatures();
        window.adminPanel.hasUnsavedChanges = true;
    }
}

// Aggiorna feature
function updateAboutFeature(id, field, value) {
    const feature = aboutFeaturesData.find(f => f.id === id);
    if (!feature) return;
    
    const fields = field.split('.');
    if (fields.length === 2) {
        feature[fields[0]][fields[1]] = value;
    } else {
        feature[field] = value;
    }
    
    window.adminPanel.hasUnsavedChanges = true;
}

// Salva le impostazioni about
async function saveAboutSettings() {
    const section = document.getElementById('section-about');
    if (!section) return;
    
    const getFieldValue = (field) => {
        const el = section.querySelector(`[data-field="${field}"]`);
        return el ? (el.value || el.textContent) : '';
    };
    
    const getStyleState = (field) => {
        const el = section.querySelector(`.style-btn[data-field="${field}"]`);
        return el ? el.classList.contains('active') : false;
    };
    
    const getAlignValue = (field) => {
        const activeBtn = section.querySelector(`.alignment-btn[data-field="${field}"].active`);
        return activeBtn ? activeBtn.dataset.value : 'left';
    };
    
    const data = {
        title: {
            it: getFieldValue('about-title-it'),
            en: getFieldValue('about-title-en'),
            fontSize: getFieldValue('about-title-font-size'),
            bold: getStyleState('about-title-bold'),
            italic: getStyleState('about-title-italic'),
            underline: getStyleState('about-title-underline'),
            align: getAlignValue('about-title-align'),
            marginBottom: getFieldValue('about-title-margin-bottom')
        },
        description: {
            it: getFieldValue('about-desc-it'),
            en: getFieldValue('about-desc-en'),
            fontSize: getFieldValue('about-desc-font-size'),
            bold: getStyleState('about-desc-bold'),
            italic: getStyleState('about-desc-italic'),
            underline: getStyleState('about-desc-underline'),
            align: getAlignValue('about-desc-align'),
            lineHeight: getFieldValue('about-desc-lineheight')
        },
        features: aboutFeaturesData,
        featuresPosition: getFieldValue('about-features-position'),
        image: {
            enabled: document.getElementById('about-image-enabled').checked,
            src: getFieldValue('about-image-src'),
            alt: getFieldValue('about-image-alt'),
            position: getFieldValue('about-image-position'),
            width: getFieldValue('about-image-width'),
            opacity: getFieldValue('about-image-opacity'),
            border: {
                enabled: document.getElementById('about-image-border-enabled').checked,
                color: getFieldValue('about-image-border-color'),
                width: getFieldValue('about-image-border-width')
            },
            shadow: {
                enabled: document.getElementById('about-image-shadow-enabled').checked,
                blur: getFieldValue('about-image-shadow-blur'),
                color: getFieldValue('about-image-shadow-color')
            },
            glow: {
                enabled: document.getElementById('about-image-glow-enabled').checked,
                blur: getFieldValue('about-image-glow-blur'),
                color: getFieldValue('about-image-glow-color')
            }
        },
        cta: {
            enabled: document.getElementById('about-cta-enabled').checked,
            text: {
                it: getFieldValue('about-cta-text-it'),
                en: getFieldValue('about-cta-text-en')
            },
            link: getFieldValue('about-cta-link'),
            align: getFieldValue('about-cta-align'),
            openStrategyOverlay: document.getElementById('about-cta-overlay').checked
        }
    };
    
    try {
        const response = await fetch('/api/config/about-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.CONFIG.aboutSettings = data;
            window.adminPanel.showNotification('success', 'Impostazioni about salvate con successo!');
            window.adminPanel.hasUnsavedChanges = false;
        } else {
            window.adminPanel.showNotification('error', 'Errore salvataggio: ' + result.error);
        }
    } catch (error) {
        console.error('Errore salvataggio impostazioni about:', error);
        window.adminPanel.showNotification('error', 'Errore di rete durante il salvataggio');
    }
}

// ===========================================
// HERO SECTION MANAGEMENT
// ===========================================

let heroStatsData = [];
let nextHeroStatId = 1;

// Hero CTA Buttons Management
let ctaButtonsData = [];
let nextCTAButtonId = 1;

// Carica le impostazioni hero
async function loadHeroSettings() {
    try {
        const response = await fetch('/api/config/hero-settings');
        const data = await response.json();
        
        const section = document.getElementById('section-hero');
        if (!section) return;
        
        // Carica titolo
        window.adminPanel.setFormValue(section, 'hero-title-it', data.title.it);
        window.adminPanel.setFormValue(section, 'hero-title-en', data.title.en);
        window.adminPanel.setFormValue(section, 'hero-title-font-size', data.title.fontSize);
        section.querySelector('.style-btn[data-field="hero-title-bold"]')?.classList.toggle('active', data.title.bold);
        section.querySelector('.style-btn[data-field="hero-title-italic"]')?.classList.toggle('active', data.title.italic);
        section.querySelector('.style-btn[data-field="hero-title-underline"]')?.classList.toggle('active', data.title.underline);
        setAlignmentButton(section, 'hero-title-align', data.title.align || 'center');
        window.adminPanel.setFormValue(section, 'hero-title-lineheight', data.title.lineHeight || '110');
        window.adminPanel.setFormValue(section, 'hero-title-margin-bottom', data.title.marginBottom || '20');
        
        // Carica sottotitolo
        window.adminPanel.setFormValue(section, 'hero-subtitle-it', data.subtitle.it);
        window.adminPanel.setFormValue(section, 'hero-subtitle-en', data.subtitle.en);
        window.adminPanel.setFormValue(section, 'hero-subtitle-font-size', data.subtitle.fontSize);
        section.querySelector('.style-btn[data-field="hero-subtitle-bold"]')?.classList.toggle('active', data.subtitle.bold);
        section.querySelector('.style-btn[data-field="hero-subtitle-italic"]')?.classList.toggle('active', data.subtitle.italic);
        section.querySelector('.style-btn[data-field="hero-subtitle-underline"]')?.classList.toggle('active', data.subtitle.underline);
        setAlignmentButton(section, 'hero-subtitle-align', data.subtitle.align || 'center');
        window.adminPanel.setFormValue(section, 'hero-subtitle-lineheight', data.subtitle.lineHeight || '140');
        window.adminPanel.setFormValue(section, 'hero-subtitle-margin-top', data.subtitle.marginTop || '10');
        
        // Carica stats settings
        const statsSettings = data.statsSettings || {};
        window.adminPanel.setFormValue(section, 'hero-stats-number-size', statsSettings.numberFontSize || '30');
        section.querySelector('.style-btn[data-field="hero-stats-number-bold"]')?.classList.toggle('active', statsSettings.numberBold !== false);
        section.querySelector('.style-btn[data-field="hero-stats-number-italic"]')?.classList.toggle('active', statsSettings.numberItalic === true);
        section.querySelector('.style-btn[data-field="hero-stats-number-underline"]')?.classList.toggle('active', statsSettings.numberUnderline === true);
        
        window.adminPanel.setFormValue(section, 'hero-stats-label-size', statsSettings.labelFontSize || '14');
        section.querySelector('.style-btn[data-field="hero-stats-label-bold"]')?.classList.toggle('active', statsSettings.labelBold === true);
        section.querySelector('.style-btn[data-field="hero-stats-label-italic"]')?.classList.toggle('active', statsSettings.labelItalic === true);
        section.querySelector('.style-btn[data-field="hero-stats-label-underline"]')?.classList.toggle('active', statsSettings.labelUnderline === true);
        
        window.adminPanel.setFormValue(section, 'hero-stats-gap', statsSettings.gap || '24');
        window.adminPanel.setFormValue(section, 'hero-stats-layout', statsSettings.layout || 'grid');
        
        // Carica stats
        heroStatsData = data.stats || [];
        if (heroStatsData.length > 0) {
            nextHeroStatId = Math.max(...heroStatsData.map(s => s.id)) + 1;
        }
        renderHeroStats();
        
        // Carica visual settings
        const visualEnabled = data.visual?.enabled !== false;
        document.getElementById('hero-visual-enabled').checked = visualEnabled;
        window.adminPanel.setFormValue(section, 'hero-visual-position', data.visual?.position || 'right');
        document.getElementById('hero-visual-integrate-editor').checked = data.visual?.integratePerformanceEditor !== false;
        document.getElementById('hero-visual-settings').style.display = visualEnabled ? 'block' : 'none';
        
        // Carica CTA settings
        const ctaSettings = data.ctaSettings || {};
        const ctaEnabled = ctaSettings.enabled !== false;
        document.getElementById('hero-cta-enabled').checked = ctaEnabled;
        setAlignmentButton(section, 'hero-cta-align', ctaSettings.align || 'center');
        window.adminPanel.setFormValue(section, 'hero-cta-gap', ctaSettings.gap || '16');
        document.getElementById('hero-cta-settings').style.display = ctaEnabled ? 'block' : 'none';
        
        // Carica CTA buttons
        ctaButtonsData = data.ctaButtons || [];
        if (ctaButtonsData.length > 0) {
            nextCTAButtonId = Math.max(...ctaButtonsData.map(c => c.id)) + 1;
        }
        renderCTAButtons();
        
        // Setup toggles
        setupHeroToggles();
        
        console.log('Hero settings loaded');
    } catch (error) {
        console.error('Errore caricamento hero settings:', error);
        window.adminPanel.showNotification('error', 'Errore caricamento impostazioni hero');
    }
}

// Render hero stats list
function renderHeroStats() {
    const container = document.getElementById('hero-stats-list');
    if (!container) return;
    
    if (heroStatsData.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:2rem;">Nessuna statistica aggiunta. Clicca su "Aggiungi Stat" per iniziare.</p>';
        document.getElementById('add-hero-stat-btn').disabled = false;
        return;
    }
    
    // Disabilita il pulsante se abbiamo già 4 stats
    const addBtn = document.getElementById('add-hero-stat-btn');
    if (addBtn) {
        addBtn.disabled = heroStatsData.length >= 4;
    }
    
    container.innerHTML = heroStatsData.map((stat, index) => `
        <div class="stat-item ${stat.enabled ? '' : 'disabled'}" data-stat-id="${stat.id}">
            <div class="stat-header">
                <div class="stat-info">
                    <span class="stat-number-badge">#${index + 1}</span>
                    <strong>${stat.number || '---'}</strong>
                    <span class="stat-label-preview">${stat.label?.it || '(Nessuna label)'}</span>
                </div>
                <div class="stat-actions">
                    <button class="btn-icon" onclick="toggleHeroStat(${stat.id})" title="${stat.enabled ? 'Disabilita' : 'Abilita'}">
                        <i class="fas fa-${stat.enabled ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="removeHeroStat(${stat.id})" title="Rimuovi">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="stat-content">
                <div class="form-row">
                    <div class="form-group" style="width: 150px;">
                        <label>Numero/Valore</label>
                        <input type="text" class="form-control" 
                               value="${stat.number || ''}" 
                               onchange="updateHeroStat(${stat.id}, 'number', this.value)"
                               placeholder="+120">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Etichetta (IT)</label>
                        <input type="text" class="form-control" 
                               value="${stat.label?.it || ''}" 
                               onchange="updateHeroStat(${stat.id}, 'label.it', this.value)"
                               placeholder="Strategie">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Etichetta (EN)</label>
                        <input type="text" class="form-control" 
                               value="${stat.label?.en || ''}" 
                               onchange="updateHeroStat(${stat.id}, 'label.en', this.value)"
                               placeholder="Strategies">
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Aggiungi hero stat
function addHeroStat() {
    if (heroStatsData.length >= 4) {
        window.adminPanel.showNotification('warning', 'Massimo 4 statistiche consentite');
        return;
    }
    
    const newStat = {
        id: nextHeroStatId++,
        enabled: true,
        number: '+100',
        label: {
            it: 'Nuova Stat',
            en: 'New Stat'
        }
    };
    
    heroStatsData.push(newStat);
    renderHeroStats();
    window.adminPanel.hasUnsavedChanges = true;
}

// Rimuovi hero stat
function removeHeroStat(id) {
    if (!confirm('Sei sicuro di voler rimuovere questa statistica?')) return;
    
    heroStatsData = heroStatsData.filter(s => s.id !== id);
    renderHeroStats();
    window.adminPanel.hasUnsavedChanges = true;
}

// Toggle hero stat
function toggleHeroStat(id) {
    const stat = heroStatsData.find(s => s.id === id);
    if (stat) {
        stat.enabled = !stat.enabled;
        renderHeroStats();
        window.adminPanel.hasUnsavedChanges = true;
    }
}

// Aggiorna hero stat
function updateHeroStat(id, field, value) {
    const stat = heroStatsData.find(s => s.id === id);
    if (!stat) return;
    
    const fields = field.split('.');
    if (fields.length === 2) {
        if (!stat[fields[0]]) stat[fields[0]] = {};
        stat[fields[0]][fields[1]] = value;
    } else {
        stat[field] = value;
    }
    
    renderHeroStats();
    window.adminPanel.hasUnsavedChanges = true;
}

// === CTA Buttons Management ===

function renderCTAButtons() {
    const container = document.getElementById('hero-cta-buttons-list');
    if (!container) return;
    
    if (ctaButtonsData.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:2rem;">Nessun pulsante aggiunto. Clicca su "Aggiungi Pulsante" per iniziare.</p>';
        document.getElementById('add-hero-cta-btn').disabled = false;
        return;
    }
    
    // Disabilita il pulsante se abbiamo già 3 pulsanti
    const addBtn = document.getElementById('add-hero-cta-btn');
    if (addBtn) {
        addBtn.disabled = ctaButtonsData.length >= 3;
    }
    
    container.innerHTML = ctaButtonsData.map((cta, index) => `
        <div class="cta-item ${cta.enabled ? '' : 'disabled'}" data-cta-id="${cta.id}">
            <div class="cta-header">
                <div class="cta-info">
                    <div class="cta-preview ${cta.style} ${cta.size === 'large' ? 'large' : ''}">
                        <i class="fas fa-arrow-right"></i>
                        ${cta.text?.it || '(Testo non impostato)'}
                    </div>
                    ${cta.link ? `<span class="cta-link-badge">${cta.link}</span>` : ''}
                </div>
                <div class="cta-actions">
                    <button class="btn-icon" onclick="toggleHeroCTA(${cta.id})" title="${cta.enabled ? 'Disabilita' : 'Abilita'}">
                        <i class="fas fa-${cta.enabled ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="removeHeroCTA(${cta.id})" title="Rimuovi">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="cta-content">
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label>Testo Pulsante (IT)</label>
                        <input type="text" class="form-control" 
                               value="${cta.text?.it || ''}" 
                               onchange="updateHeroCTA(${cta.id}, 'text.it', this.value)"
                               placeholder="Scopri le Strategie">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Testo Pulsante (EN)</label>
                        <input type="text" class="form-control" 
                               value="${cta.text?.en || ''}" 
                               onchange="updateHeroCTA(${cta.id}, 'text.en', this.value)"
                               placeholder="Discover Strategies">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label>Link</label>
                        <input type="text" class="form-control" 
                               value="${cta.link || ''}" 
                               onchange="updateHeroCTA(${cta.id}, 'link', this.value)"
                               placeholder="#strategies">
                        <small class="form-text">URL o ancora interna (es: #about, https://example.com)</small>
                    </div>
                    <div class="form-group" style="width: 150px;">
                        <label>Stile</label>
                        <select class="form-control" onchange="updateHeroCTA(${cta.id}, 'style', this.value)">
                            <option value="primary" ${cta.style === 'primary' ? 'selected' : ''}>Primary</option>
                            <option value="secondary" ${cta.style === 'secondary' ? 'selected' : ''}>Secondary</option>
                        </select>
                    </div>
                    <div class="form-group" style="width: 150px;">
                        <label>Dimensione</label>
                        <select class="form-control" onchange="updateHeroCTA(${cta.id}, 'size', this.value)">
                            <option value="normal" ${cta.size === 'normal' ? 'selected' : ''}>Normale</option>
                            <option value="large" ${cta.size === 'large' ? 'selected' : ''}>Grande</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function addHeroCTA() {
    if (ctaButtonsData.length >= 3) {
        window.adminPanel.showNotification('warning', 'Massimo 3 pulsanti CTA consentiti');
        return;
    }
    
    const newCTA = {
        id: nextCTAButtonId++,
        enabled: true,
        text: {
            it: 'Nuovo Pulsante',
            en: 'New Button'
        },
        link: '#',
        style: 'primary',
        size: 'large'
    };
    
    ctaButtonsData.push(newCTA);
    renderCTAButtons();
    window.adminPanel.hasUnsavedChanges = true;
}

function removeHeroCTA(id) {
    if (!confirm('Sei sicuro di voler rimuovere questo pulsante?')) return;
    
    ctaButtonsData = ctaButtonsData.filter(c => c.id !== id);
    renderCTAButtons();
    window.adminPanel.hasUnsavedChanges = true;
}

function toggleHeroCTA(id) {
    const cta = ctaButtonsData.find(c => c.id === id);
    if (cta) {
        cta.enabled = !cta.enabled;
        renderCTAButtons();
        window.adminPanel.hasUnsavedChanges = true;
    }
}

function updateHeroCTA(id, field, value) {
    const cta = ctaButtonsData.find(c => c.id === id);
    if (!cta) return;
    
    const fields = field.split('.');
    if (fields.length === 2) {
        if (!cta[fields[0]]) cta[fields[0]] = {};
        cta[fields[0]][fields[1]] = value;
    } else {
        cta[field] = value;
    }
    
    renderCTAButtons();
    window.adminPanel.hasUnsavedChanges = true;
}

// Salva le impostazioni hero
async function saveHeroSettings() {
    const section = document.getElementById('section-hero');
    if (!section) return;
    
    const getFieldValue = (field) => {
        const el = section.querySelector(`[data-field="${field}"]`);
        return el ? (el.value || el.textContent) : '';
    };
    
    const getStyleState = (field) => {
        const el = section.querySelector(`.style-btn[data-field="${field}"]`);
        return el ? el.classList.contains('active') : false;
    };
    
    const getAlignValue = (field) => {
        const activeBtn = section.querySelector(`.alignment-btn[data-field="${field}"].active`);
        return activeBtn ? activeBtn.dataset.value : 'center';
    };
    
    const data = {
        title: {
            it: getFieldValue('hero-title-it'),
            en: getFieldValue('hero-title-en'),
            fontSize: getFieldValue('hero-title-font-size'),
            bold: getStyleState('hero-title-bold'),
            italic: getStyleState('hero-title-italic'),
            underline: getStyleState('hero-title-underline'),
            align: getAlignValue('hero-title-align'),
            lineHeight: getFieldValue('hero-title-lineheight'),
            marginBottom: getFieldValue('hero-title-margin-bottom')
        },
        subtitle: {
            it: getFieldValue('hero-subtitle-it'),
            en: getFieldValue('hero-subtitle-en'),
            fontSize: getFieldValue('hero-subtitle-font-size'),
            bold: getStyleState('hero-subtitle-bold'),
            italic: getStyleState('hero-subtitle-italic'),
            underline: getStyleState('hero-subtitle-underline'),
            align: getAlignValue('hero-subtitle-align'),
            lineHeight: getFieldValue('hero-subtitle-lineheight'),
            marginTop: getFieldValue('hero-subtitle-margin-top')
        },
        statsSettings: {
            numberFontSize: getFieldValue('hero-stats-number-size'),
            numberBold: getStyleState('hero-stats-number-bold'),
            numberItalic: getStyleState('hero-stats-number-italic'),
            numberUnderline: getStyleState('hero-stats-number-underline'),
            labelFontSize: getFieldValue('hero-stats-label-size'),
            labelBold: getStyleState('hero-stats-label-bold'),
            labelItalic: getStyleState('hero-stats-label-italic'),
            labelUnderline: getStyleState('hero-stats-label-underline'),
            gap: getFieldValue('hero-stats-gap'),
            layout: getFieldValue('hero-stats-layout')
        },
        stats: heroStatsData,
        visual: {
            enabled: document.getElementById('hero-visual-enabled').checked,
            position: getFieldValue('hero-visual-position'),
            integratePerformanceEditor: document.getElementById('hero-visual-integrate-editor').checked
        },
        ctaSettings: {
            enabled: document.getElementById('hero-cta-enabled').checked,
            align: getAlignValue('hero-cta-align'),
            gap: getFieldValue('hero-cta-gap')
        },
        ctaButtons: ctaButtonsData
    };
    
    try {
        const response = await fetch('/api/config/hero-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.adminPanel.showNotification('success', 'Impostazioni Hero salvate con successo!');
            window.adminPanel.hasUnsavedChanges = false;
        } else {
            window.adminPanel.showNotification('error', result.error || 'Errore durante il salvataggio');
        }
    } catch (error) {
        console.error('Errore salvataggio impostazioni hero:', error);
        window.adminPanel.showNotification('error', 'Errore di rete durante il salvataggio');
    }
}

// === STRATEGY ATTACHMENTS MANAGEMENT ===

let strategyAttachmentsData = {};
let nextAttachmentId = 1;

function renderStrategyAttachments() {
    const currentStrategy = window.adminPanel?.currentStrategy || 'low';
    const container = document.getElementById('strategy-attachments-list');
    if (!container) return;
    
    const attachments = strategyAttachmentsData[currentStrategy] || [];
    
    if (attachments.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:2rem;">Nessun file allegato. Clicca su "Aggiungi File" per caricare.</p>';
        return;
    }
    
    container.innerHTML = attachments.map((file, index) => {
        const iconClass = getAttachmentIcon(file.icon || file.fileType);
        
        return `
            <div class="attachment-item ${file.enabled ? '' : 'disabled'}" data-attachment-id="${file.id}">
                <div class="attachment-header">
                    <div class="attachment-info">
                        <div class="attachment-file-icon">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="attachment-file-name">
                            ${file.title?.it || '(Senza titolo)'}
                            ${file.filePath ? `<br><small style="color: #888; font-weight: normal;">${file.filePath.split('/').pop()}</small>` : ''}
                        </div>
                    </div>
                    <div class="attachment-actions">
                        <button class="btn-icon" onclick="toggleStrategyAttachment(${file.id})" title="${file.enabled ? 'Disabilita' : 'Abilita'}">
                            <i class="fas fa-${file.enabled ? 'eye' : 'eye-slash'}"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="removeStrategyAttachment(${file.id})" title="Rimuovi">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="attachment-content">
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Titolo (IT)</label>
                            <input type="text" class="form-control" 
                                   value="${file.title?.it || ''}" 
                                   onchange="updateStrategyAttachment(${file.id}, 'title.it', this.value)"
                                   placeholder="Guida Strategia">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Titolo (EN)</label>
                            <input type="text" class="form-control" 
                                   value="${file.title?.en || ''}" 
                                   onchange="updateStrategyAttachment(${file.id}, 'title.en', this.value)"
                                   placeholder="Strategy Guide">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Descrizione (IT)</label>
                            <textarea class="form-control" rows="2"
                                      onchange="updateStrategyAttachment(${file.id}, 'description.it', this.value)"
                                      placeholder="Breve descrizione del documento">${file.description?.it || ''}</textarea>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Descrizione (EN)</label>
                            <textarea class="form-control" rows="2"
                                      onchange="updateStrategyAttachment(${file.id}, 'description.en', this.value)"
                                      placeholder="Brief description of the document">${file.description?.en || ''}</textarea>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="width: 200px;">
                            <label>Icona</label>
                            <select class="form-control" onchange="updateStrategyAttachment(${file.id}, 'icon', this.value)">
                                <option value="file-pdf" ${file.icon === 'file-pdf' ? 'selected' : ''}>📄 File PDF</option>
                                <option value="file-image" ${file.icon === 'file-image' ? 'selected' : ''}>🖼️ Immagine</option>
                                <option value="file-chart-line" ${file.icon === 'file-chart-line' ? 'selected' : ''}>📊 Grafico</option>
                                <option value="file-contract" ${file.icon === 'file-contract' ? 'selected' : ''}>📋 Contratto</option>
                                <option value="certificate" ${file.icon === 'certificate' ? 'selected' : ''}>🏆 Certificato</option>
                                <option value="book" ${file.icon === 'book' ? 'selected' : ''}>📚 Manuale</option>
                                <option value="shield-alt" ${file.icon === 'shield-alt' ? 'selected' : ''}>🛡️ Sicurezza</option>
                            </select>
                        </div>
                        <div class="form-group" style="width: 150px;">
                            <label>Font Size Desc.</label>
                            <select class="form-control" onchange="updateStrategyAttachment(${file.id}, 'descriptionStyle.fontSize', this.value)">
                                <option value="12px" ${file.descriptionStyle?.fontSize === '12px' ? 'selected' : ''}>12px</option>
                                <option value="14px" ${file.descriptionStyle?.fontSize === '14px' ? 'selected' : ''}>14px</option>
                                <option value="16px" ${file.descriptionStyle?.fontSize === '16px' ? 'selected' : ''}>16px</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Stili Descrizione</label>
                            <div class="button-group">
                                <button type="button" class="style-btn ${file.descriptionStyle?.bold ? 'active' : ''}" 
                                        onclick="toggleAttachmentDescStyle(${file.id}, 'bold')">
                                    <i class="fas fa-bold"></i>
                                </button>
                                <button type="button" class="style-btn ${file.descriptionStyle?.italic ? 'active' : ''}" 
                                        onclick="toggleAttachmentDescStyle(${file.id}, 'italic')">
                                    <i class="fas fa-italic"></i>
                                </button>
                                <button type="button" class="style-btn ${file.descriptionStyle?.underline ? 'active' : ''}" 
                                        onclick="toggleAttachmentDescStyle(${file.id}, 'underline')">
                                    <i class="fas fa-underline"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>File Caricato</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" class="form-control" value="${file.filePath || 'Nessun file'}" readonly>
                                <label class="btn btn-outline" style="margin: 0; cursor: pointer;">
                                    <i class="fas fa-upload"></i>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp" 
                                           onchange="uploadAttachmentFile(this, ${file.id})" 
                                           style="display: none;">
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getAttachmentIcon(iconOrType) {
    const iconMap = {
        'pdf': 'fa-file-pdf',
        'jpg': 'fa-file-image',
        'jpeg': 'fa-file-image',
        'png': 'fa-file-image',
        'gif': 'fa-file-image',
        'bmp': 'fa-file-image',
        'file-pdf': 'fa-file-pdf',
        'file-image': 'fa-file-image',
        'file-chart-line': 'fa-chart-line',
        'file-contract': 'fa-file-contract',
        'certificate': 'fa-certificate',
        'book': 'fa-book',
        'shield-alt': 'fa-shield-alt'
    };
    return iconMap[iconOrType] || 'fa-file';
}

function addStrategyAttachment() {
    const currentStrategy = window.adminPanel?.currentStrategy || 'low';
    
    if (!strategyAttachmentsData[currentStrategy]) {
        strategyAttachmentsData[currentStrategy] = [];
    }
    
    const newAttachment = {
        id: nextAttachmentId++,
        enabled: true,
        title: { it: 'Nuovo Documento', en: 'New Document' },
        description: { it: '', en: '' },
        descriptionStyle: { fontSize: '14px', bold: false, italic: false, underline: false },
        icon: 'file-pdf',
        filePath: '',
        fileType: 'pdf'
    };
    
    strategyAttachmentsData[currentStrategy].push(newAttachment);
    renderStrategyAttachments();
    window.adminPanel.hasUnsavedChanges = true;
}

function removeStrategyAttachment(id) {
    if (!confirm('Sei sicuro di voler rimuovere questo allegato?')) return;
    
    const currentStrategy = window.adminPanel?.currentStrategy || 'low';
    const attachment = strategyAttachmentsData[currentStrategy]?.find(a => a.id === id);
    
    // Se ha un file, eliminalo dal server
    if (attachment?.filePath) {
        fetch('/api/delete/strategy-attachment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filepath: attachment.filePath })
        }).catch(err => console.error('Errore eliminazione file:', err));
    }
    
    strategyAttachmentsData[currentStrategy] = strategyAttachmentsData[currentStrategy].filter(a => a.id !== id);
    renderStrategyAttachments();
    window.adminPanel.hasUnsavedChanges = true;
}

function toggleStrategyAttachment(id) {
    const currentStrategy = window.adminPanel?.currentStrategy || 'low';
    const attachment = strategyAttachmentsData[currentStrategy]?.find(a => a.id === id);
    
    if (attachment) {
        attachment.enabled = !attachment.enabled;
        renderStrategyAttachments();
        window.adminPanel.hasUnsavedChanges = true;
    }
}

function updateStrategyAttachment(id, field, value) {
    const currentStrategy = window.adminPanel?.currentStrategy || 'low';
    const attachment = strategyAttachmentsData[currentStrategy]?.find(a => a.id === id);
    
    if (!attachment) return;
    
    const fields = field.split('.');
    if (fields.length === 2) {
        if (!attachment[fields[0]]) attachment[fields[0]] = {};
        attachment[fields[0]][fields[1]] = value;
    } else {
        attachment[field] = value;
    }
    
    renderStrategyAttachments();
    window.adminPanel.hasUnsavedChanges = true;
}

function toggleAttachmentDescStyle(id, style) {
    const currentStrategy = window.adminPanel?.currentStrategy || 'low';
    const attachment = strategyAttachmentsData[currentStrategy]?.find(a => a.id === id);
    
    if (attachment) {
        if (!attachment.descriptionStyle) {
            attachment.descriptionStyle = { fontSize: '14px', bold: false, italic: false, underline: false };
        }
        attachment.descriptionStyle[style] = !attachment.descriptionStyle[style];
        renderStrategyAttachments();
        window.adminPanel.hasUnsavedChanges = true;
    }
}

async function uploadAttachmentFile(input, id) {
    const file = input.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload/strategy-attachment', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Aggiorna il percorso del file
            const currentStrategy = window.adminPanel?.currentStrategy || 'low';
            const attachment = strategyAttachmentsData[currentStrategy]?.find(a => a.id === id);
            
            if (attachment) {
                attachment.filePath = result.filepath;
                attachment.fileType = file.name.split('.').pop().toLowerCase();
                renderStrategyAttachments();
                window.adminPanel.hasUnsavedChanges = true;
                window.adminPanel.showNotification('success', 'File caricato con successo!');
            }
        } else {
            window.adminPanel.showNotification('error', result.error || 'Errore durante il caricamento');
        }
    } catch (error) {
        console.error('Errore upload:', error);
        window.adminPanel.showNotification('error', 'Errore di rete durante il caricamento');
    }
    
    // Reset input
    input.value = '';
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
    window.adminPanel.init();
});

