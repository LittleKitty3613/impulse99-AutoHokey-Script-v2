@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Installing via winget...
    winget install -e --id OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
    timeout /t 15 /nobreak >nul
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo Failed to install Node.js. Please install manually and re-run this script.
        pause
        exit /b
    )
) else (
    echo Node.js is already installed.
)

echo Installing npm packages...
call npm install discord-rpc puppeteer puppeteer-extra puppeteer-extra-plugin-stealth

echo Done.
powershell -Command "New-BurntToastNotification -Text 'Setup Complete', 'You can start ahk now.'" 2>nul
echo You can start ahk now.
timeout /t 5 /nobreak >nul
exit
