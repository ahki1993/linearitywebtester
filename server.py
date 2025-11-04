"""
LINEARITY WEB - Flask Development Server
Server di sviluppo per testare la landing page con tutti i collegamenti
"""

from flask import Flask, render_template, send_from_directory, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime

app = Flask(__name__, 
            static_folder='.',
            template_folder='.')
CORS(app)

# Configurazione
CONFIG_DIR = 'config'
UPLOAD_FOLDER = 'uploads/strategies'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Crea la cartella uploads se non esiste
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max 16MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Landing page principale"""
    return send_from_directory('.', 'index.html')

@app.route('/admin')
def admin():
    """Pannello di controllo admin"""
    return send_from_directory('admin', 'index.html')

# ========== API Routes per configurazioni ==========

@app.route('/api/config/settings', methods=['GET'])
def get_settings():
    """Ottieni le impostazioni generali"""
    try:
        with open(os.path.join(CONFIG_DIR, 'settings.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/settings', methods=['POST'])
def update_settings():
    """Aggiorna le impostazioni generali"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'settings.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Impostazioni aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/translations/<lang>', methods=['GET'])
def get_translations(lang):
    """Ottieni le traduzioni per una lingua"""
    try:
        filename = f'translations-{lang}.json'
        with open(os.path.join(CONFIG_DIR, filename), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/translations/<lang>', methods=['POST'])
def update_translations(lang):
    """Aggiorna le traduzioni per una lingua"""
    try:
        data = request.json
        filename = f'translations-{lang}.json'
        with open(os.path.join(CONFIG_DIR, filename), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': f'Traduzioni {lang} aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/theme-colors', methods=['GET'])
def get_theme_colors():
    """Ottieni i colori del tema"""
    try:
        with open(os.path.join(CONFIG_DIR, 'theme-colors.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/theme-colors', methods=['POST'])
def update_theme_colors():
    """Aggiorna i colori del tema"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'theme-colors.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Colori tema aggiornati'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/strategies', methods=['GET'])
def get_strategies():
    """Ottieni le strategie"""
    try:
        with open(os.path.join(CONFIG_DIR, 'strategies.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/strategies', methods=['POST'])
def update_strategies():
    """Aggiorna le strategie"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'strategies.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Strategie aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/debug', methods=['GET'])
def get_debug():
    """Ottieni configurazione debug"""
    try:
        with open(os.path.join(CONFIG_DIR, 'debug.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/debug', methods=['POST'])
def update_debug():
    """Aggiorna configurazione debug"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'debug.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Configurazione debug aggiornata'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/agents-benefits', methods=['GET'])
def get_agents_benefits():
    """Ottieni le benefit cards degli agenti"""
    try:
        with open(os.path.join(CONFIG_DIR, 'agents-benefits.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/agents-benefits', methods=['POST'])
def update_agents_benefits():
    """Aggiorna le benefit cards degli agenti"""
    try:
        data = request.json
        # Limita a massimo 6 cards
        if len(data) > 6:
            return jsonify({'success': False, 'error': 'Massimo 6 benefit cards consentite'}), 400
        
        with open(os.path.join(CONFIG_DIR, 'agents-benefits.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Benefit cards aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config/agents-settings', methods=['GET'])
def get_agents_settings():
    """Ottieni le impostazioni della sezione agenti"""
    try:
        with open(os.path.join(CONFIG_DIR, 'agents-settings.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/config/agents-settings', methods=['POST'])
def update_agents_settings():
    """Aggiorna le impostazioni della sezione agenti"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'agents-settings.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Impostazioni agenti aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config/contact-settings', methods=['GET'])
def get_contact_settings():
    """Ottieni le impostazioni della sezione contatti"""
    try:
        with open(os.path.join(CONFIG_DIR, 'contact-settings.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/config/contact-settings', methods=['POST'])
def update_contact_settings():
    """Aggiorna le impostazioni della sezione contatti"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'contact-settings.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Impostazioni contatti aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config/about-settings', methods=['GET'])
def get_about_settings():
    """Ottieni le impostazioni della sezione about"""
    try:
        with open(os.path.join(CONFIG_DIR, 'about-settings.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/config/about-settings', methods=['POST'])
def update_about_settings():
    """Aggiorna le impostazioni della sezione about"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'about-settings.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Impostazioni about aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config/hero-settings', methods=['GET'])
def get_hero_settings():
    """Ottieni le impostazioni della sezione hero"""
    try:
        with open(os.path.join(CONFIG_DIR, 'hero-settings.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/config/hero-settings', methods=['POST'])
def update_hero_settings():
    """Aggiorna le impostazioni della sezione hero"""
    try:
        data = request.json
        with open(os.path.join(CONFIG_DIR, 'hero-settings.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'message': 'Impostazioni hero aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config/faqs', methods=['GET'])
def get_faqs():
    """Ottieni le FAQ (IT/EN)"""
    try:
        with open(os.path.join(CONFIG_DIR, 'faqs.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/config/faqs', methods=['POST'])
def update_faqs():
    """Aggiorna le FAQ (limite massimo 10 items per lingua)"""
    try:
        data = request.json
        # Data expected to be object with 'it' and 'en'
        if not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Formato JSON non valido'}), 400

        for lang in ('it', 'en'):
            items = data.get(lang, {}).get('items', [])
            if len(items) > 10:
                return jsonify({'success': False, 'error': f'Massimo 10 FAQ consentite per lingua ({lang})'}), 400

        with open(os.path.join(CONFIG_DIR, 'faqs.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Print di log in italiano
        try:
            print('\n' + '='*40)
            print('FAQ aggiornate:')
            for lang in ('it', 'en'):
                items = data.get(lang, {}).get('items', [])
                print(f"Lingua: {lang} - {len(items)} domande")
            print('='*40 + '\n')
        except Exception:
            pass

        return jsonify({'success': True, 'message': 'FAQ aggiornate'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config/performance-charts', methods=['GET'])
def get_performance_charts():
    """Ottieni configurazione grafici performance"""
    try:
        with open(os.path.join(CONFIG_DIR, 'performance-charts.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/config/performance-charts', methods=['POST'])
def update_performance_charts():
    """Aggiorna configurazione grafici performance"""
    try:
        data = request.json
        
        # Validazione base
        if not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Formato JSON non valido'}), 400
        
        # Limita a massimo 3 grafici
        charts = data.get('charts', [])
        if len(charts) > 3:
            return jsonify({'success': False, 'error': 'Massimo 3 grafici consentiti'}), 400
        
        with open(os.path.join(CONFIG_DIR, 'performance-charts.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Print di log in italiano
        try:
            print('\n' + '='*50)
            print('📊 Grafici Performance aggiornati:')
            print(f"   Numero grafici: {len(charts)}")
            print(f"   Grafici visibili: {data.get('settings', {}).get('visibleCharts', 0)}")
            for chart in charts:
                if chart.get('enabled'):
                    title = chart.get('title', {}).get('it', 'Senza titolo')
                    profit = chart.get('totalProfit', 0)
                    percentage = chart.get('totalPercentage', 0)
                    print(f"   • {title}: +{profit}€ (+{percentage}%)")
            print('='*50 + '\n')
        except Exception:
            pass
        
        return jsonify({'success': True, 'message': 'Grafici performance aggiornati'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== API MyFxBook Simulation ==========

@app.route('/api/myfxbook/test', methods=['GET'])
def test_myfxbook():
    """Testa la connessione MyFxBook (simulata)"""
    return jsonify({
        'success': True,
        'message': 'Connessione simulata con successo',
        'data': {
            'account_id': '12345',
            'profit': '+127.5%',
            'trades': 1234,
            'win_rate': '87.3%'
        }
    })

@app.route('/api/myfxbook/stats', methods=['GET'])
def get_myfxbook_stats():
    """Ottieni statistiche MyFxBook (simulate)"""
    return jsonify({
        'success': True,
        'data': {
            'weekly': {
                'profit': 12.4,
                'trades': 45,
                'win_rate': 88.9
            },
            'monthly': {
                'profit': 38.7,
                'trades': 189,
                'win_rate': 87.3
            },
            'yearly': {
                'profit': 127.5,
                'trades': 2134,
                'win_rate': 86.5
            }
        }
    })

# ========== API per Strategy Cards ==========

@app.route('/api/config/strategy-cards', methods=['GET'])
def get_strategy_cards():
    """Ottieni le strategy cards per overlay"""
    try:
        with open(os.path.join(CONFIG_DIR, 'strategy-cards.json'), 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/strategy-cards', methods=['POST'])
def update_strategy_cards():
    """Aggiorna le strategy cards"""
    try:
        data = request.json
        
        # Validazione: max 5 cards per lingua
        for lang in ['it', 'en']:
            if lang in data and 'cards' in data[lang]:
                if len(data[lang]['cards']) > 5:
                    return jsonify({
                        'success': False,
                        'error': f'⚠️ Massimo 5 cards consentite per {lang.upper()}'
                    }), 400
        
        with open(os.path.join(CONFIG_DIR, 'strategy-cards.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Strategy cards aggiornate con successo!")
        
        return jsonify({
            'success': True,
            'message': '✅ Strategy cards salvate!'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ========== API per Form Contact ==========

@app.route('/api/contact', methods=['POST'])
def contact_form():
    """Gestisce l'invio del form di contatto"""
    try:
        data = request.json
        print(f"\n{'='*50}")
        print("NUOVO MESSAGGIO DI CONTATTO")
        print(f"{'='*50}")
        print(f"Nome: {data.get('name')}")
        print(f"Email: {data.get('email')}")
        print(f"Messaggio: {data.get('message')}")
        print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*50}\n")
        
        # In produzione, qui invieresti l'email o salveresti nel database
        
        return jsonify({
            'success': True,
            'message': 'Messaggio ricevuto con successo!'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/newsletter', methods=['POST'])
def newsletter_subscribe():
    """Gestisce l'iscrizione alla newsletter"""
    try:
        data = request.json
        email = data.get('email')
        print(f"\n✉️ Nuova iscrizione newsletter: {email}")
        
        # In produzione, qui salveresti nel database o invieresti a servizio email
        
        return jsonify({
            'success': True,
            'message': 'Iscrizione completata!'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ========== Serve static files ==========

@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve file CSS"""
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve file JavaScript"""
    return send_from_directory('js', filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    """Serve immagini"""
    return send_from_directory('images', filename)

@app.route('/config/<path:filename>')
def serve_config(filename):
    """Serve file di configurazione"""
    return send_from_directory('config', filename)

@app.route('/admin/<path:filename>')
def serve_admin(filename):
    """Serve file admin"""
    return send_from_directory('admin', filename)

# ========== Error Handlers ==========

@app.errorhandler(404)
def not_found(e):
    """Gestisce errori 404"""
    return jsonify({'error': 'Risorsa non trovata'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Gestisce errori 500"""
    return jsonify({'error': 'Errore interno del server'}), 500

# ========== Utility Routes ==========

@app.route('/api/health')
def health_check():
    """Health check del server"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/ip')
def get_client_ip():
    """Ottieni IP del client (per test geolocalizzazione)"""
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    return jsonify({
        'ip': ip,
        'user_agent': request.headers.get('User-Agent')
    })

# ========== File Upload Routes ==========

@app.route('/attachments/<filename>')
def serve_attachment(filename):
    """Servi file allegato con URL pulito"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'File non trovato'}), 404

@app.route('/api/upload/strategy-attachment', methods=['POST'])
def upload_strategy_attachment():
    """Upload file allegato per strategia"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Nessun file caricato'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nessun file selezionato'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False, 
                'error': 'Formato file non consentito. Usa: PDF, JPG, JPEG, PNG, GIF, BMP'
            }), 400
        
        # Sanitizza il nome del file
        filename = secure_filename(file.filename)
        
        # Aggiungi timestamp per evitare sovrascritture
        name, ext = os.path.splitext(filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{name}_{timestamp}{ext}"
        
        # Salva il file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Ritorna path pulito usando /attachments/
        clean_path = f"/attachments/{unique_filename}"
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'filepath': clean_path,
            'message': 'File caricato con successo'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/delete/strategy-attachment', methods=['POST'])
def delete_strategy_attachment():
    """Elimina file allegato strategia"""
    try:
        data = request.json
        filepath = data.get('filepath', '')
        
        if not filepath:
            return jsonify({'success': False, 'error': 'Percorso file non specificato'}), 400
        
        # Estrai il filename dal path (gestisce sia /attachments/file.pdf che uploads/strategies/file.pdf)
        if filepath.startswith('/attachments/'):
            filename = filepath.replace('/attachments/', '')
        elif filepath.startswith('uploads/strategies/'):
            filename = filepath.replace('uploads/strategies/', '')
        else:
            filename = os.path.basename(filepath)
        
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if os.path.exists(full_path):
            os.remove(full_path)
            return jsonify({'success': True, 'message': 'File eliminato con successo'})
        else:
            return jsonify({'success': False, 'error': 'File non trovato'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ========== Main ==========

if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║          🚀 LINEARITY WEB - Development Server 🚀          ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    
    📍 Server avviato su: http://localhost:5000
    
    🌐 Pagine disponibili:
       • Landing Page:        http://localhost:5000/
       • Pannello Admin:      http://localhost:5000/admin
    
    🔧 API disponibili:
       • GET  /api/config/settings
       • POST /api/config/settings
       • GET  /api/config/translations/<lang>
       • POST /api/config/translations/<lang>
       • GET  /api/config/theme-colors
       • POST /api/config/theme-colors
       • GET  /api/config/strategies
       • POST /api/config/strategies
       • GET  /api/myfxbook/stats
       • POST /api/contact
       • POST /api/newsletter
    
    ℹ️  Premi CTRL+C per fermare il server
    
    ════════════════════════════════════════════════════════════
    """)
    
    # Avvia il server
    app.run(
        host='0.0.0.0',  # Accessibile da tutti gli indirizzi
        port=5000,
        debug=True,      # Modalità debug con auto-reload
        use_reloader=True
    )
