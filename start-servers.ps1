# SpotGrid Server Launcher
Write-Host "🚀 Starting SpotGrid servers..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Cleanup complete" -ForegroundColor Green

# Start backend server in background
Write-Host "🔧 Starting backend server (port 3001)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\server
    npm start
}

# Start frontend server in background  
Write-Host "⚡ Starting frontend server (port 5173)..." -ForegroundColor Magenta
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Wait a moment for servers to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 Both servers are starting up!" -ForegroundColor Green
Write-Host "📊 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host "📋 To view logs, use: Get-Job | Receive-Job" -ForegroundColor Gray

# Keep script running and monitor jobs
try {
    while ($true) {
        # Check if jobs are still running
        $backendRunning = (Get-Job -Id $backendJob.Id).State -eq "Running"
        $frontendRunning = (Get-Job -Id $frontendJob.Id).State -eq "Running"
        
        if (-not $backendRunning) {
            Write-Host "❌ Backend server stopped" -ForegroundColor Red
            break
        }
        
        if (-not $frontendRunning) {
            Write-Host "❌ Frontend server stopped" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 2
    }
}
finally {
    # Cleanup jobs on exit
    Write-Host "🛑 Shutting down servers..." -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    
    # Kill any remaining node processes
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
} 