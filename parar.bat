@echo off
rem Para el servidor de «Mi rodilla». Tus datos quedan guardados en la carpeta datos.
powershell -NoProfile -Command "try{Invoke-WebRequest -UseBasicParsing -Method Post -Headers @{'X-Mi-Rodilla'='1'} -TimeoutSec 2 http://127.0.0.1:8790/api/parar | Out-Null; 'Parado.'}catch{'No estaba en marcha.'}"
timeout /t 2 /nobreak >nul
