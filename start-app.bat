@echo off
echo ===== Tournament Tracker Display =====
echo Starting application... Please wait.
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo After installing Node.js, run this batch file again.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules\" (
    echo Installing dependencies... This may take a few minutes.
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing dependencies.
        pause
        exit /b 1
    )
)

:: Start the application
echo Starting the application...
echo.
echo Once the server is running, open your web browser and go to:
echo http://localhost:5173
echo.
echo To stop the application, press Ctrl+C in this window, then press Y when prompted.
echo.
call npm run dev

pause 