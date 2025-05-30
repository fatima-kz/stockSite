@echo off
echo Stock Video Hub - Admin Password Change Utility
echo =============================================
echo.
cd /d %~dp0
node utils/changePassword.js
pause
