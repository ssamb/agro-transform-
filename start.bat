@echo off
echo ====================================
echo   AgroTransform - Démarrage
echo ====================================
echo.
echo [1/2] Démarrage du Backend (Port 5000)...
echo.
start "AgroTransform Backend" cmd /k "cd backend && node dist/index.js"
timeout /t 3 /nobreak >nul

echo [2/2] Démarrage du Frontend (Port 3001)...
echo.
start "AgroTransform Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ====================================
echo   Serveurs démarrés !
echo ====================================
echo.
echo Backend :  http://localhost:5000
echo Frontend : http://localhost:3001
echo.
echo Appuyez sur une touche pour ouvrir le frontend...
pause >nul
start http://localhost:3001
