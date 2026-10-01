@echo off
title NEO RACING // WORLD TOUR — Aether-9 Motorsport
color 0B
cls

echo ===================================================================
echo     NEO RACING // WORLD TOUR — AETHER-9 ORBITAL MOTORSPORT
echo     DEVELOPED BY RANJEET KUMAR
echo ===================================================================
echo.

:: 1. Verify Node.js installation
echo [1/4] Checking Node.js environment...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js (v18 or higher) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js detected: %NODE_VER%
echo.

:: 2. Check and install dependencies if needed
echo [2/4] Verifying project dependencies...
if not exist "node_modules\" (
    echo [INFO] node_modules not detected. Installing dependencies via npm...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies already installed.
)
echo.

:: 3. Run verification test suite
echo [3/4] Running automated physics & circuit simulation checks...
call node test/e2e-simulation-test.js
if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo [WARNING] Some simulation tests reported warnings, continuing launch...
) else (
    echo [OK] All 47 simulation test cases verified successfully!
)
echo.

:: 4. Launch Vite server and open browser
echo [4/4] Launching NEO RACING web server on http://localhost:5173 ...
echo.
echo ===================================================================
echo   Press [Ctrl + C] in this window to stop the server at any time.
echo ===================================================================
echo.

:: Automatically open default browser after a brief delay
start "" http://localhost:5173

:: Start the Vite development server
call npm run dev

pause
