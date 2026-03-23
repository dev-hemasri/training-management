@echo off
REM ============================================================
REM TNGMS Angular Project - Windows Setup Script
REM Double-click this file to run after extracting the zip
REM ============================================================

echo.
echo ======================================
echo   TNGMS Angular - Setting up project
echo ======================================
echo.

where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed.
  echo Download from https://nodejs.org/ ^(v18 or above^)
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo   Node.js found: %NODE_VER%

where ng >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo.
  echo Installing Angular CLI globally...
  npm install -g @angular/cli
)

echo.
echo Installing dependencies ^(this may take 1-2 minutes^)...
npm install

echo.
echo ======================================
echo   Setup complete!
echo ======================================
echo.
echo To start the app, run in this folder:
echo.
echo    ng serve --open
echo.
echo The app will open at: http://localhost:4200
echo.
pause
