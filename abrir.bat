@echo off
rem Abre «Mi rodilla» en el PC. Arranca el servidor sin ventana (si no estaba ya) y abre el navegador.
setlocal
cd /d "%~dp0"
set "PING=try{Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 http://127.0.0.1:8790/api/ping | Out-Null; exit 0}catch{exit 1}"

powershell -NoProfile -Command "%PING%" >nul 2>nul && goto abrir

where pyw >nul 2>nul
if %errorlevel%==0 (
  start "" pyw -3 "%~dp0server.py"
) else (
  where pythonw >nul 2>nul
  if errorlevel 1 (
    echo No encuentro Python. Instalalo desde https://www.python.org y vuelve a abrir este archivo.
    pause
    exit /b 1
  )
  start "" pythonw "%~dp0server.py"
)

for /l %%i in (1,1,20) do (
  powershell -NoProfile -Command "%PING%" >nul 2>nul && goto abrir
  timeout /t 1 /nobreak >nul
)
echo La app no ha arrancado. Mira el archivo datos\servidor.log
pause
exit /b 1

:abrir
start "" http://127.0.0.1:8790/
exit /b 0
