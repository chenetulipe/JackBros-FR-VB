@echo off
chcp 65001 > nul
echo ==============================================================
echo       Jack Bros VB Translation Tool - Demarrage
echo ==============================================================
echo.

echo Nettoyage des anciens processus sur le port 8000...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| find ":8000" ^| find "LISTENING"') DO taskkill /F /PID %%a 2>nul

echo Verification des dependances Python...
python -m pip install -r tool\requirements.txt --quiet

echo.
echo Lancement du serveur...
cd /d "%~dp0"
python tool\server.py

echo.
echo Le serveur s'est arrete.
pause
