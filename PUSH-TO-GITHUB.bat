@echo off
title Push to GitHub - Ethra.AI
setlocal

set "GIT=C:\Program Files\Git\cmd\git.exe"
set "ROOT=%~dp0"
set "REPO=https://github.com/KatkuriDhanushReddy/Ethra.AI.git"

cd /d "%ROOT%"

if not exist "%GIT%" (
  echo Git is not installed. Install from https://git-scm.com/download/win
  echo Then run this file again.
  pause
  exit /b 1
)

echo === Checking for secrets ===
if exist "backend\.env" (
  echo OK: backend\.env exists locally but is gitignored
) else (
  echo Note: no backend\.env - using .env.example only
)

echo.
echo === Git init and commit ===
"%GIT%" init 2>nul
"%GIT%" branch -M main 2>nul
"%GIT%" remote remove origin 2>nul
"%GIT%" remote add origin "%REPO%"

"%GIT%" add .
"%GIT%" status --short

echo.
echo Committing Team Task Manager full stack...
"%GIT%" commit -m "Add Team Task Manager full-stack application" -m "React/Vite frontend, Express/MongoDB backend, RBAC, Kanban, Socket.io, Railway config, and deployment docs."

echo.
echo === Pull remote README (merge) ===
"%GIT%" pull origin main --allow-unrelated-histories --no-edit 2>nul
if errorlevel 1 (
  echo Pull had conflicts or failed - trying push with lease...
)

echo.
echo === Push to GitHub ===
echo Repository: %REPO%
echo You may be asked to sign in to GitHub.
echo.
"%GIT%" push -u origin main

if errorlevel 1 (
  echo.
  echo PUSH FAILED - common fixes:
  echo 1. Sign in: git credential manager or GitHub Desktop
  echo 2. Use Personal Access Token as password when prompted
  echo 3. Create repo access: https://github.com/settings/tokens
  echo 4. Or run: gh auth login   then   gh repo sync
  pause
  exit /b 1
)

echo.
echo SUCCESS! View at: https://github.com/KatkuriDhanushReddy/Ethra.AI
pause
