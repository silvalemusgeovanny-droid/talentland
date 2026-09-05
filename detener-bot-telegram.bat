@echo off
setlocal

cd /d "%~dp0"
set "PID_FILE=%~dp0.telegram-bot.pid"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$pidFile = '%PID_FILE%'; if (-not (Test-Path $pidFile)) { Write-Host 'No encontre archivo de PID. Si el bot sigue activo, cierralo desde el Administrador de tareas.'; exit 0 }; $botPid = [int](Get-Content $pidFile -ErrorAction SilentlyContinue); $process = if ($botPid) { Get-Process -Id $botPid -ErrorAction SilentlyContinue } else { $null }; if (-not $process) { Remove-Item $pidFile -ErrorAction SilentlyContinue; Write-Host 'El bot no esta corriendo.'; exit 0 }; taskkill /PID $botPid /T /F | Out-Null; Remove-Item $pidFile -ErrorAction SilentlyContinue; Write-Host 'Bot de Telegram detenido.'"

pause
