# Script PowerShell per avviare il server Flask
# Linearity Web Development Server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " LINEARITY WEB - Server Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Controlla se Python è installato
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python trovato: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python non trovato!" -ForegroundColor Red
    Write-Host "  Installa Python da: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Premi un tasto per chiudere"
    exit
}

Write-Host ""

# Controlla se esiste un ambiente virtuale
if (-not (Test-Path "venv")) {
    Write-Host "Creazione ambiente virtuale..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Ambiente virtuale creato" -ForegroundColor Green
}

Write-Host ""
Write-Host "Attivazione ambiente virtuale..." -ForegroundColor Yellow

# Attiva l'ambiente virtuale
& ".\venv\Scripts\Activate.ps1"

Write-Host "✓ Ambiente virtuale attivato" -ForegroundColor Green
Write-Host ""

# Installa le dipendenze
Write-Host "Installazione dipendenze..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

Write-Host "✓ Dipendenze installate" -ForegroundColor Green
Write-Host ""

# Avvia il server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Avvio server Flask..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python server.py
