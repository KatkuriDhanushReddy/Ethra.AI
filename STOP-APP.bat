@echo off
title Stop Team Task Manager
echo Stopping servers on ports 5000 and 5173...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo Done. You can run START-APP.bat again.
timeout /t 3
