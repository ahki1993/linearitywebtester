# GUIDA RAPIDA - Linearity Web Server

## 🚀 Come avviare il server

### Opzione 1: PowerShell (Consigliato per Windows)
```powershell
.\start-server.ps1
```

### Opzione 2: Prompt dei comandi
```cmd
start-server.bat
```

### Opzione 3: Manuale
```bash
# 1. Crea ambiente virtuale (solo prima volta)
python -m venv venv

# 2. Attiva ambiente virtuale
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# 3. Installa dipendenze (solo prima volta)
pip install -r requirements.txt

# 4. Avvia il server
python server.py
```

## 🌐 Accesso alle pagine

Dopo aver avviato il server:

- **Landing Page**: http://localhost:5000/
- **Pannello Admin**: http://localhost:5000/admin

## 📡 API Disponibili

### Configurazioni
- `GET /api/config/settings` - Ottieni impostazioni
- `POST /api/config/settings` - Aggiorna impostazioni
- `GET /api/config/translations/it` - Traduzioni italiano
- `GET /api/config/translations/en` - Traduzioni inglese
- `POST /api/config/translations/<lang>` - Aggiorna traduzioni
- `GET /api/config/theme-colors` - Colori temi
- `POST /api/config/theme-colors` - Aggiorna colori
- `GET /api/config/strategies` - Strategie trading
- `POST /api/config/strategies` - Aggiorna strategie

### MyFxBook
- `GET /api/myfxbook/test` - Test connessione
- `GET /api/myfxbook/stats` - Statistiche trading

### Form
- `POST /api/contact` - Invio form contatti
- `POST /api/newsletter` - Iscrizione newsletter

### Utilità
- `GET /api/health` - Health check server
- `GET /api/ip` - Info IP client

## 🛑 Fermare il server

Premi `CTRL+C` nel terminale dove è in esecuzione il server.

## ⚙️ Configurazione

Il server:
- Gira su porta **5000**
- Modalità **debug** attiva (auto-reload)
- **CORS** abilitato per sviluppo
- Accessibile da **tutti gli indirizzi** (0.0.0.0)

## 🔧 Troubleshooting

### Porta già in uso
```bash
# Cambia porta nel file server.py, riga finale:
app.run(port=8000)  # Usa 8000 invece di 5000
```

### Errore dipendenze
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Permessi PowerShell
Se ricevi errore eseguendo script .ps1:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Note

- Il server salva le modifiche direttamente nei file JSON
- I log delle richieste appaiono nel terminale
- Messaggi form di contatto vengono stampati nella console
- Modalità debug permette modifiche al codice senza riavvio

## 🔒 Sicurezza

**IMPORTANTE**: Questo è un server di **SVILUPPO**.
Per produzione:
- Disabilita modalità debug
- Implementa autenticazione per API
- Usa un web server production-ready (Gunicorn, uWSGI)
- Configura HTTPS
- Proteggi il pannello admin
