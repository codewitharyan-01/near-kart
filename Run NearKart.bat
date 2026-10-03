@echo off
setlocal
title NearKart - Local Runner
cd /d "%~dp0"

echo.
echo  ==============================================
echo    NearKart - "Your local shops, delivered fast."
echo  ==============================================
echo.

rem -- 1) Make sure Node.js is installed -------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo  [X] Node.js is not installed on this PC.
  echo      Install the free LTS version from https://nodejs.org
  echo      then double-click this file again.
  echo.
  pause
  exit /b 1
)

rem -- 2) Install dependencies on first run ----------------------------------
if not exist "node_modules\" (
  echo  First run detected: installing dependencies, this can take a few minutes...
  call npm install
  if errorlevel 1 (
    echo.
    echo  [X] npm install failed. Check your internet connection and try again.
    echo.
    pause
    exit /b 1
  )
)

rem -- 3) Already running? Just open the browser ------------------------------
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  echo  NearKart is already running - opening it now.
  start "" http://localhost:3000
  exit /b 0
)

rem -- 4) Start the dev server, wait until it responds, then open browser -----
echo  Starting NearKart... this window stays open while the app runs.
echo  Close this window to stop NearKart.
echo.
start "NearKart server" /min cmd /c "npm run dev"

set /a tries=0
:waitloop
timeout /t 2 /nobreak >nul
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto ready
set /a tries+=1
if %tries% lss 30 goto waitloop
echo.
echo  [X] The server did not respond within 60 seconds.
echo     Check the minimized "NearKart server" window for errors.
echo.
pause
exit /b 1

:ready
echo  NearKart is live at http://localhost:3000
echo.
echo  The four apps:
echo     Customer   : http://localhost:3000/customer
echo     Shop owner : http://localhost:3000/shop
echo     Rider      : http://localhost:3000/rider
echo     Admin      : http://localhost:3000/admin
echo.
start "" http://localhost:3000/customer
timeout /t 8 /nobreak >nul
exit /b 0
