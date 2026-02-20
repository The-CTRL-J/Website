@echo off
setlocal EnableExtensions EnableDelayedExpansion

title NinConvert Auto Sync (Backend + Tunnel + Git)

set "ROOT=%~dp0"
set "BACKEND_BAT=%ROOT%start-ninconvert-backend.bat"
set "CONFIG_FILE=%ROOT%public\assets\config\ninconvert-api.json"
set "LOG_FILE=%TEMP%\ninconvert-tunnel.log"
set "TUNNEL_URL="
set "CF_BIN="

if not exist "%BACKEND_BAT%" (
  echo ERREUR: start-ninconvert-backend.bat introuvable.
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

if not exist "%CONFIG_FILE%" (
  echo ERREUR: fichier config introuvable:
  echo %CONFIG_FILE%
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

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
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

echo [1/6] Demarrage backend...
start "NinConvert Backend" cmd /k ""%BACKEND_BAT%""

echo Attente backend health...
set "READY=0"
for /l %%I in (1,1,60) do (
  curl.exe -sS http://localhost:8787/health >nul 2>nul
  if not errorlevel 1 (
    set "READY=1"
    goto :backend_ready
  )
  timeout /t 1 >nul
)

:backend_ready
if not "%READY%"=="1" (
  echo ERREUR: backend non detecte sur http://localhost:8787/health
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

echo [2/6] Backend pret.

echo [3/6] Lancement tunnel Cloudflare temporaire...
if exist "%LOG_FILE%" del /f /q "%LOG_FILE%" >nul 2>nul
start "NinConvert Tunnel" cmd /c ""%CF_BIN%" tunnel --url http://localhost:8787 > "%LOG_FILE%" 2>&1"

echo Attente URL trycloudflare...
for /l %%I in (1,1,90) do (
  for /f "delims=" %%U in ('powershell -NoProfile -Command "$p='%LOG_FILE%'; if (Test-Path $p) { $m=[regex]::Match((Get-Content $p -Raw), 'https://[a-zA-Z0-9.-]+trycloudflare.com'); if($m.Success){$m.Value} }"') do (
    set "TUNNEL_URL=%%U"
  )
  if defined TUNNEL_URL goto :url_ready
  timeout /t 1 >nul
)

echo ERREUR: URL Cloudflare non detectee.
echo Consulte le log: %LOG_FILE%
echo Appuie sur une touche pour fermer.
pause >nul
exit /b 1

:url_ready
echo [4/6] URL detectee: %TUNNEL_URL%

echo [5/6] Mise a jour config API...
powershell -NoProfile -Command "$path='%CONFIG_FILE%'; $url='%TUNNEL_URL%'; $json = @{ apiBaseUrl=$url; updatedAt=(Get-Date).ToString('o') } | ConvertTo-Json; Set-Content -Path $path -Value $json -Encoding UTF8"

echo [6/6] Commit/push si changement...
cd /d "%ROOT%"
git add "%CONFIG_FILE%" >nul 2>nul
git diff --cached --quiet -- "%CONFIG_FILE%"
if errorlevel 1 (
  git commit -m "chore: update ninconvert API endpoint"
  if errorlevel 1 (
    echo Commit echoue.
    echo Appuie sur une touche pour fermer.
    pause >nul
    exit /b 1
  )
  git push origin main
  if errorlevel 1 (
    echo Push echoue.
    echo Appuie sur une touche pour fermer.
    pause >nul
    exit /b 1
  )
  echo Push termine.
) else (
  echo Aucun changement d'URL, pas de commit.
)

echo.
echo URL API active: %TUNNEL_URL%
echo Health public: %TUNNEL_URL%/health
echo.
echo Le tunnel tourne dans la fenetre "NinConvert Tunnel".
echo Appuie sur une touche pour fermer cette fenetre.
pause >nul
exit /b 0
