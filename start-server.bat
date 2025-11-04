@echo off
REM ========================================
REM Linearity Web - Server Flask
REM Avvio con Python Embedded
REM ========================================

echo.
echo ========================================
echo  LINEARITY WEB - SERVER FLASK
echo ========================================
echo.

REM Percorso Python Embedded
set PYTHON_EMBED=C:\Users\rosan\Desktop\Nino\VS Project\HybridAITrader\python_embed\python.exe

REM Verifica se Python Embedded esiste
if not exist "%PYTHON_EMBED%" (
    echo [ERRORE] Python Embedded non trovato in:
    echo %PYTHON_EMBED%
    echo.
    echo Verifica che il percorso sia corretto.
    pause
    exit /b 1
)

echo [OK] Python Embedded trovato
echo Percorso: %PYTHON_EMBED%
echo.

REM Ottieni il percorso della cartella corrente (dove si trova il .bat)
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [INFO] Directory progetto: %PROJECT_DIR%
echo.

REM Verifica se Flask è installato
echo [INFO] Verifica installazione Flask...
"%PYTHON_EMBED%" -m pip show flask >nul 2>&1
if errorlevel 1 (
    echo [AVVISO] Flask non trovato. Installazione in corso...
    echo.
    "%PYTHON_EMBED%" -m pip install flask flask-cors
    if errorlevel 1 (
        echo [ERRORE] Impossibile installare Flask
        pause
        exit /b 1
    )
    echo [OK] Flask installato con successo
    echo.
) else (
    echo [OK] Flask già installato
    echo.
)

REM Verifica se esiste server.py
if not exist "server.py" (
    echo [ERRORE] File server.py non trovato nella directory corrente
    pause
    exit /b 1
)

echo [INFO] Avvio server Flask...
echo.
echo ========================================
echo  SERVER IN ESECUZIONE
echo ========================================
echo.
echo Landing Page: http://localhost:5000
echo Pannello Admin: http://localhost:5000/admin
echo.
echo Premi CTRL+C per fermare il server
echo ========================================
echo.

REM Avvia il server Flask
"%PYTHON_EMBED%" server.py

REM Se il server si chiude, attendi prima di chiudere la finestra
if errorlevel 1 (
    echo.
    echo [ERRORE] Il server si è chiuso con un errore
    pause
)
