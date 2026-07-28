@echo off
setlocal

cd /d "%~dp0shop-dashboard-test"

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"
npm start
