@echo off
title WIPEOUT: APHELION 2148 // PC GAMING DESKTOP SOFTWARE
color 0B
cls

echo ==============================================================================
echo     WIPEOUT: APHELION 2148 // F-8000 ORBITAL MOTORSPORT
echo     NATIVE PC DESKTOP SOFTWARE RUNTIME // DEVELOPED BY RANJEET KUMAR
echo ==============================================================================
echo.

:: 1. Verify Node.js Environment
echo [1/3] Verifying Node.js and High-Performance PC Runtime...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is required to run the PC Software Runtime.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Compile latest production game bundle
echo [2/3] Compiling and verifying optimized WebGPU shaders and production game bundle...
call npm run build
echo.

:: 3. Launch Native PC Desktop Game with Discrete GPU Acceleration
echo [3/3] Launching WIPEOUT: APHELION 2148 Desktop Software (120Hz/GPU Accelerated)...
echo.
echo ==============================================================================
echo   CONTROLS:
echo     - [W/A/S/D] or [Arrow Keys] : Steering, Throttle, and Brake
echo     - [Q] / [E]                 : Left & Right Airbrakes
echo     - [Shift]                   : Magnetic Drift Overdrive
echo     - [Space]                   : Hyper-Boost Overdrive
echo     - [F11]                     : Toggle Fullscreen Mode
echo     - [F12]                     : Toggle Simulation Telemetry Console
echo     - [Esc]                     : Pause / Menu
echo ==============================================================================
echo.

:: Launch dedicated PC Gaming Software using high CPU/GPU priority
if exist "node_modules\electron\dist\electron.exe" (
    echo Starting dedicated PC Gaming Software window...
    start /HIGH "" "node_modules\electron\dist\electron.exe" "desktop\main.cjs"
) else (
    echo Starting dedicated PC Gaming Software via npx electron...
    start /HIGH "" npx electron "desktop\main.cjs"
)

exit /b 0
