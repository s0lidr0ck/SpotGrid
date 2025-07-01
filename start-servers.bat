@echo off
title SpotGrid Server Launcher
echo.
echo 🚀 Starting SpotGrid servers...
echo.

:: Kill existing node processes
echo 🔄 Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

:: Start backend server
echo 🔧 Starting backend server (port 3001)...
start "SpotGrid Backend" cmd /k "cd server && npm start"

:: Wait a moment
timeout /t 3 >nul

:: Start frontend server
echo ⚡ Starting frontend server (port 5173)...
start "SpotGrid Frontend" cmd /k "npm run dev"

:: Success message
echo.
echo 🎉 Both servers are starting up!
echo 📊 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo.
echo 💡 Close the terminal windows to stop the servers
echo.
pause 