@echo off
setlocal EnableExtensions

set "TARGET=%~dp0start-ninconvert-auto-sync.bat"
set "LINK=%USERPROFILE%\Desktop\NinConvert Online.lnk"

if not exist "%TARGET%" (
  echo ERREUR: cible introuvable:
  echo %TARGET%
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

powershell -NoProfile -Command ^
  "$w = New-Object -ComObject WScript.Shell; " ^
  "$s = $w.CreateShortcut('%LINK%'); " ^
  "$s.TargetPath = '%TARGET%'; " ^
  "$s.WorkingDirectory = '%~dp0'; " ^
  "$s.IconLocation = '%SystemRoot%\System32\SHELL32.dll,220'; " ^
  "$s.Save()"

if errorlevel 1 (
  echo ERREUR: impossible de creer le raccourci.
  echo Appuie sur une touche pour fermer.
  pause >nul
  exit /b 1
)

echo Raccourci cree:
echo %LINK%
echo Appuie sur une touche pour fermer.
pause >nul
exit /b 0
