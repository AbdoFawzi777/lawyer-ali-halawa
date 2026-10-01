@echo off
chcp 65001 > nul
title Deploy Lawyer Ali Halawa Platform Online - Free
echo =========================================================================
echo    Lawyer Ali Ali Mahmoud Halawa Law Firm Platform
echo    Deploy Online 100%% Free (Netlify Drop / GitHub Pages)
echo =========================================================================
echo.
echo [1] Instant Deploy with Netlify Drop (30 seconds, no setup, drag and drop):
echo     Will open Netlify Drop in your default browser.
echo     Simply drag the folder "E:\law" into the page!
echo.
echo [2] Deploy to GitHub Pages (AbdoFawzi777/lawyer-ali-halawa):
echo     Pushes all files to your GitHub repository and guides GitHub Pages activation.
echo.
echo =========================================================================
echo.

choice /c 123 /m "Select option: [1] Netlify Drop  [2] GitHub Push  [3] Exit"

if errorlevel 3 exit
if errorlevel 2 goto github_deploy
if errorlevel 1 goto netlify_drop

:netlify_drop
echo.
echo Opening Netlify Drop in your browser...
start "" "https://app.netlify.com/drop"
echo.
echo Drag and drop the folder "E:\law" into your browser window!
echo You will get an instant live HTTPS URL for the client.
pause
exit

:github_deploy
echo.
echo Linking repository and pushing code to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/AbdoFawzi777/lawyer-ali-halawa.git
git branch -M main
git push -u origin main
echo.
echo =========================================================================
echo Code pushed to GitHub!
echo To activate GitHub Pages URL:
echo 1. Go to: https://github.com/AbdoFawzi777/lawyer-ali-halawa/settings/pages
echo 2. Select 'main' branch and click 'Save'.
echo 3. Live site will be: https://abdofawzi777.github.io/lawyer-ali-halawa/
echo =========================================================================
pause
exit
