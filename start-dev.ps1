# Simple SpotGrid Server Launcher
Write-Host "Starting SpotGrid servers..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend server in new window
Write-Host "Starting backend server on port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\server'; npm start" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend server in new window
Write-Host "Starting frontend server on port 5173..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "Close the server windows to stop them" -ForegroundColor Yellow

# Wait a bit to show the message
Start-Sleep -Seconds 3 