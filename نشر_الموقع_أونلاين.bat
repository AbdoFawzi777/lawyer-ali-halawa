@echo off
chcp 65001 > nul
title نشر موقع المحامي علي حلاوه أونلاين مجاناً
echo =========================================================================
echo    منظومة مكتب الأستاذ علي علي محمود حلاوه للمحاماة
echo    نشر واستضافة الموقع أونلاين على السحابة مجاناً (100%% Free)
echo =========================================================================
echo.
echo [1] النشر الفوري عبر Netlify Drop (الأسهل والأسرع في 30 ثانية بدون أي كود):
echo     سيتم فتح صفحة Netlify Drop الآن في متصفحك..
echo     فقط اسحب المجلد "E:\law" وأفلته داخل الصفحة!
echo.
echo [2] النشر عبر GitHub Pages:
echo     إذا كنت قد أنشأت مستودعاً على حسابك (AbdoFawzi777) باسم lawyer-ali-halawa
echo     اضغط على زر Enter لرفع الملفات وتفعيل الرابط فوراً.
echo.
echo =========================================================================
echo.

choice /c 123 /m "اختر طريقة النشر: [1] Netlify Drop الفوري  [2] رفع إلى GitHub  [3] خروج"

if errorlevel 3 exit
if errorlevel 2 goto github_deploy
if errorlevel 1 goto netlify_drop

:netlify_drop
echo.
echo جارٍ فتح Netlify Drop في متصفحك...
start "" "https://app.netlify.com/drop"
echo.
echo افتح هذا المجلد (E:\law) واسحبه مباشرة إلى متصفحك على صفحة Netlify Drop!
echo سيعطيك الموقع رابطاً أونلاين سريعاً ومؤمناً بشهادة SSL مجاناً مدى الحياة.
pause
exit

:github_deploy
echo.
echo جاري ربط المستودع ودفع الكود إلى GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/AbdoFawzi777/lawyer-ali-halawa.git
git branch -M main
git push -u origin main
echo.
echo =========================================================================
echo تم رفع الكود بنجاح إلى GitHub!
echo الآن لتفعيل الرابط المباشر (GitHub Pages):
echo 1. ادخل على: https://github.com/AbdoFawzi777/lawyer-ali-halawa/settings/pages
echo 2. اختر الفرع 'main' ثم اضغط 'Save'.
echo 3. رابط موقعك سيكون: https://abdofawzi777.github.io/lawyer-ali-halawa/
echo =========================================================================
pause
exit
