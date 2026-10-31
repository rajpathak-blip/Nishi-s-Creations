@echo off
title Cloudflare Tunnel - Nishi's Creations
color 0b

echo ===================================================================
echo     🌐 CLOUDFLARE PUBLIC TUNNEL FOR NISHI'S CREATIONS 🌸
echo ===================================================================
echo.
echo Starting secure HTTPS tunnel to http://localhost:3000...
echo.
cd /d "%~dp0"

.\cloudflared.exe tunnel --url http://localhost:3000

pause
