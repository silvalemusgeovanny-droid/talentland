@echo off
setlocal

cd /d "%~dp0"
set "PID_FILE=%~dp0.telegram-bot.pid"

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js en PATH.
  echo Instala Node.js o abre este archivo desde una terminal donde node funcione.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$pidFile = '%PID_FILE%'; if (Test-Path $pidFile) { $oldPid = [int](Get-Content $pidFile -ErrorAction SilentlyContinue); if ($oldPid -and (Get-Process -Id $oldPid -ErrorAction SilentlyContinue)) { Write-Host 'El bot ya esta corriendo.'; Write-Host ('PID: ' + $oldPid); exit 0 } }; $psi = [System.Diagnostics.ProcessStartInfo]::new(); $psi.FileName = 'cmd.exe'; $psi.Arguments = '/c node telegram-bot.mjs 1>> telegram-bot.out.log 2>> telegram-bot.err.log'; $psi.WorkingDirectory = '%~dp0'; $psi.UseShellExecute = $false; $psi.CreateNoWindow = $true; $process = [System.Diagnostics.Process]::Start($psi); Set-Content -Path $pidFile -Value $process.Id; Write-Host 'Bot de Telegram iniciado en segundo plano.'; Write-Host ('PID: ' + $process.Id); Write-Host 'Logs: telegram-bot.out.log y telegram-bot.err.log'"

pause
