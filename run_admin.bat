@echo off
chcp 65001 > nul
title Lawyer Ali Halawa Platform - Secure Admin Runner
echo =========================================================================
echo    Lawyer Ali Ali Mahmoud Halawa Law Firm Platform
echo    Secure Admin Dashboard Runner
echo =========================================================================
echo.
echo Opening Secure Admin Portal in your default browser...
echo.
start "" "%~dp0admin.html"
echo Admin Portal opened successfully!
timeout /t 3 > nul
exit
