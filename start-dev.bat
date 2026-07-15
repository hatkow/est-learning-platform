@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo EST Learning Platform を起動しています...
start "" http://localhost:3100
call npm run dev -- -p 3100
pause
