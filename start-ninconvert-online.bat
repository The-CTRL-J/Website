@echo off
setlocal EnableExtensions EnableDelayedExpansion

title NinConvert Online (Backend + Cloudflare Tunnel)

set "ROOT=%~dp0"
set "BACKEND_BAT=%ROOT%start-ninconvert-backend.bat"

if not exist "%BACKEND_BAT%" (
  echo ERREUR: start-ninconvert-backend.bat introuvable.
  echo Chemin attendu: %BACKEND_BAT%
  echo.
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

set "CF_BIN="
where cloudflared >nul 2>nul
if not errorlevel 1 (
  for /f "delims=" %%P in ('where cloudflared') do (
    set "CF_BIN=%%P"
    goto :cf_found
  )
)

for /d %%D in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Cloudflare.cloudflared_*") do (
  if exist "%%D\cloudflared.exe" (
    set "CF_BIN=%%D\cloudflared.exe"
    goto :cf_found
  )
)

if exist "C:\Program Files\cloudflared\cloudflared.exe" set "CF_BIN=C:\Program Files\cloudflared\cloudflared.exe"
if exist "C:\Program Files\Cloudflare\Cloudflared\cloudflared.exe" set "CF_BIN=C:\Program Files\Cloudflare\Cloudflared\cloudflared.exe"

:cf_found
if "%CF_BIN%"=="" (
  echo ERREUR: cloudflared introuvable.
  echo Installe-le via winget puis relance:
  echo winget install Cloudflare.cloudflared
  echo.
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

echo [1/3] Cloudflared detecte:
echo %CF_BIN%
"%CF_BIN%" --version
if errorlevel 1 (
  echo ERREUR: impossible d'executer cloudflared.
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)
echo.

echo [2/3] Demarrage backend NinConvert dans une nouvelle fenetre...
start "NinConvert Backend" cmd /k ""%BACKEND_BAT%""

echo Attente du backend sur http://localhost:8787/health ...
set "READY=0"
for /l %%I in (1,1,30) do (
  curl -sS http://localhost:8787/health >nul 2>nul
  if not errorlevel 1 (
    set "READY=1"
    goto :backend_ready
  )
  timeout /t 1 >nul
)

:backend_ready
if "%READY%"=="1" (
  echo Backend pret.
) else (
  echo ATTENTION: backend non detecte apres 30s.
  echo Le tunnel va quand meme se lancer.
)
echo.

echo [3/3] Lancement Cloudflare Tunnel temporaire (sans domaine)...
echo URL backend local:  http://localhost:8787
echo URL publique:       cherche la ligne "https://...trycloudflare.com" ci-dessous.
echo Arret tunnel:       Ctrl + C
echo.
"%CF_BIN%" tunnel --url http://localhost:8787
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if not "%EXIT_CODE%"=="0" (
  echo Le tunnel s'est arrete avec le code %EXIT_CODE%.
) else (
  echo Tunnel arrete.
)
echo Appuie sur une touche pour fermer.
pause >nul
exit /b %EXIT_CODE%
