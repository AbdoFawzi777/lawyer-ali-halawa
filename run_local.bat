@echo off
chcp 65001 > nul
title Lawyer Ali Halawa Platform - Local Runner
echo =========================================================================
echo    Lawyer Ali Ali Mahmoud Halawa Law Firm Platform
echo    Manshat Sultan - Menouf - Menoufia
echo =========================================================================
echo.
echo Opening legal consultation platform in your default browser...
echo.
start "" "%~dp0index.html"
echo Website opened successfully!
timeout /t 3 > nul
exit
