@echo off
chcp 65001 > nul
title تحديث ونشر موقع المستشار علي حلاوه على Google Firebase
echo =========================================================================
echo    مكتب الأستاذ علي علي محمود حلاوه للمحاماة والاستشارات القانونية
echo    تحديث ونشر المنظومة على Google Firebase Hosting
echo =========================================================================
echo.
echo جاري رفع أحدث التعديلات والملفات إلى سيرفرات Google Firebase...
echo.
firebase deploy --only hosting
echo.
echo =========================================================================
echo تم التحديث والنشر بنجاح على Google Firebase!
echo الرابط الرئيسي: https://mostashar-ali-halawa.web.app
echo لوحة الإدارة:   https://mostashar-ali-halawa.web.app/admin.html
echo =========================================================================
pause
