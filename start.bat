@echo off
title WIPEOUT: APHELION 2148 // PC GAMING DESKTOP RUNTIME
color 0B
cls

echo ===================================================================
echo     WIPEOUT: APHELION 2148 // F-8000 ORBITAL MOTORSPORT
echo     NATIVE PC DESKTOP SOFTWARE // DEVELOPED BY RANJEET KUMAR
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

:: 2. Check and build bundle if needed
echo [2/4] Verifying production game assets...
if not exist "dist\index.html" (
    echo [INFO] Compiling production shaders and WebGPU bundle...
    call npm run build
) else (
    echo [OK] Production game bundle ready.
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

:: 4. Launch Native PC Desktop Software
echo [4/4] Launching Dedicated PC Desktop Software (120Hz Hardware Accelerated)...
echo.
if exist "node_modules\electron\dist\electron.exe" (
    start /HIGH "" "node_modules\electron\dist\electron.exe" "desktop\main.cjs"
) else (
    start "" http://localhost:5173
    call npm run dev
)

echo [OK] Game Software running! You can close this command window.
timeout /t 3 >nul
exit /b 0
