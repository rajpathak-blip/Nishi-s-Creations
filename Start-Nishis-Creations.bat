@echo off
title Nishi's Creations - Boutique Management System
color 06

echo ===================================================================
echo     🌸 NISHI'S CREATIONS - DESIGNER WEAR BOUTIQUE SYSTEM 🌸
echo        Main Road Rangwasa, Rau, Indore ^| Tel: 6260808658
echo ===================================================================
echo.
echo Starting local boutique server...
cd /d "%~dp0"

echo.
echo -------------------------------------------------------------------
echo  💻 DESKTOP PC LINK:     http://localhost:3000
echo  🌐 CLOUDFLARE TUNNEL:   https://div-hourly-converter-poor.trycloudflare.com
echo  📱 LOCAL WI-FI LINK:    http://192.168.0.160:3000
echo -------------------------------------------------------------------
echo  * You can open the Cloudflare link on your mobile phone ANYWHERE
echo    (even on 4G/5G mobile data, no Wi-Fi needed!)
echo.

start http://localhost:3000

node server.js

pause
