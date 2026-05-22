@echo off
title Team Task Manager - Launcher
setlocal
set "ROOT=%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

if not exist "C:\Program Files\nodejs\node.exe" (
  echo.
  echo ERROR: Node.js is not installed.
  echo Download LTS from https://nodejs.org/ and install, then run this again.
  echo.
  pause
  exit /b 1
)

echo Checking ports...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo Backend already running on port 5000.
  set "BACKEND_UP=1"
) else (
  set "BACKEND_UP=0"
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo Frontend already running on port 5173.
  set "FRONTEND_UP=1"
) else (
  set "FRONTEND_UP=0"
)

if "%BACKEND_UP%"=="0" (
  echo Starting backend...
  start "Team Task Manager - Backend" /D "%ROOT%" cmd /k call start-backend.bat
)

if "%FRONTEND_UP%"=="0" (
  echo Starting frontend...
  ping 127.0.0.1 -n 3 >nul
  start "Team Task Manager - Frontend" /D "%ROOT%" cmd /k call start-frontend.bat
)

echo.
echo Waiting for servers (up to 60 seconds)...
set /a n=0
:wait_loop
set /a n+=1
powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 2).StatusCode | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel%==0 goto ready
if %n% geq 30 goto timeout
ping 127.0.0.1 -n 2 >nul
goto wait_loop

:timeout
echo.
echo Servers are still starting. Check the Backend and Frontend cmd windows for errors.
echo When ready, open: http://localhost:5173/
call "%ROOT%OPEN-APP.bat"
pause
exit /b 0

:ready
echo.
echo App is ready!
echo   Open: http://localhost:5173/
echo   Login: admin@demo.com / Admin123!
echo.
call "%ROOT%OPEN-APP.bat"
echo Browser opened. Keep both cmd windows open.
pause
