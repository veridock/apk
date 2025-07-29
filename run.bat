@echo off
REM SVG+PHP Universal Launcher for Windows
REM =====================================

cls
echo ===============================================
echo    SVG+PHP Universal Launcher - Windows
echo ===============================================
echo.

REM Check if PHP is installed
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PHP not found in PATH!
    echo.
    echo Please install PHP:
    echo 1. Download from: https://windows.php.net/download/
    echo 2. Extract to C:\php
    echo 3. Add C:\php to your PATH environment variable
    echo.
    echo Or install XAMPP from: https://www.apachefriends.org/
    echo.
    pause
    exit /b 1
)

REM Display PHP version
echo [INFO] Found PHP:
php -v | findstr /i "PHP"
echo.

REM Check for router.php
if not exist "router.php" (
    echo [ERROR] router.php not found!
    echo Please run this script from the project directory.
    echo.
    pause
    exit /b 1
)

REM Set default port
set PORT=8097

REM Check if port is in use
netstat -an | findstr :%PORT% >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port %PORT% is already in use!
    echo.
    set /p PORT="Enter alternative port (or press Enter for 8098): "
    if "%PORT%"=="" set PORT=8098
)

REM Create .env file if not exists
if not exist ".env" (
    echo [INFO] Creating default .env file...
    (
        echo APP_TITLE=SVG+PHP Application
        echo APP_VERSION=1.0.0
        echo APP_AUTHOR=Developer
        echo CALCULATOR_TITLE=PHP Calculator
        echo APP_BASE_URL=http://localhost:%PORT%
    ) > .env
    echo [OK] .env file created
)

REM Display available applications
echo.
echo Available applications:
echo ----------------------
if exist "calculator.svg" echo - calculator.svg     (Interactive Calculator)
if exist "pdf.php.svg" echo - pdf.php.svg (PDF Converter)
for %%f in (*.svg) do (
    if not "%%f"=="calculator.svg" if not "%%f"=="pdf.php.svg" (
        echo - %%f
    )
)

REM Start server
echo.
echo ===============================================
echo Starting PHP server on http://localhost:%PORT%
echo Press Ctrl+C to stop the server
echo ===============================================
echo.

REM Open browser after 2 seconds
start /b cmd /c "timeout /t 2 >nul & start http://localhost:%PORT%"

REM Start PHP server
php -S localhost:%PORT% router.php

REM If we get here, server was stopped
echo.
echo Server stopped.
pause