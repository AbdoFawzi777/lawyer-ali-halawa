/**
 * =========================================================================================
 * منظومة استقبال وتوثيق استشارات مكتب الأستاذ علي علي محمود حلاوه للمحاماة
 * Google Apps Script Web App CRM Backend (100% Free Database)
 * =========================================================================================
 * 
 * هذا السكربت يستقبل طلبات الاستشارة المرسلة من الموقع الإلكتروني تلقائياً
 * ويقوم بإدراجها في جدول بيانات Google Sheet مع التوقيت وحالة المتابعة.
 */

// إعدادات اختيارية لتلقي إشعار بريدي عند وصول قضايا طارئة
const NOTIFICATION_EMAIL = ""; // ضع بريدك الإلكتروني هنا إذا رغبت بإشعار فوري مثل: lawyer@gmail.com

/**
 * معالجة طلبات POST الواردة من الموقع
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // تجنب تداخل الطلبات المتزامنة

  try {
    var sheet = getOrCreateLeadsSheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // توقيت جمهورية مصر العربية
    var cairoTime = Utilities.formatDate(new Date(), "Africa/Cairo", "yyyy-MM-dd HH:mm:ss");

    var rowData = [
      data.id || ("HALAWA-" + Date.now().toString().slice(-6)),
      data.timestamp || cairoTime,
      data.name || "غير محدد",
      "'" + (data.phone || ""), // بادئة لضمان عدم حذف الصفر في بداية رقم الهاتف في إكسل
      data.location || "منشأة سلطان / منوف",
      data.caseType || "غير مصنف",
      data.serviceType || "استشارة أولية",
      data.urgency || "عادي",
      data.summary || "لا توجد تفاصيل",
      "'" + (data.selectedLawyerPhone || "201228194003"),
      data.status || "جديد"
    ];

    // إضافة الصف لجدول الموكلين
    sheet.appendRow(rowData);

    // تلوين الحالات الطارئة تلقائياً لسهولة التمييز البصري
    highlightUrgentRow(sheet, sheet.getLastRow(), data.urgency);

    // إرسال تنبيه بريدي اختياري في الحالات الطارئة
    if (NOTIFICATION_EMAIL && data.urgency && (data.urgency.indexOf("طارئ") !== -1 || data.urgency.indexOf("عاجل") !== -1)) {
      sendEmailAlert(data);
    }

    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "id": data.id,
      "message": "تم تسجيل الاستشارة في جدول الموكلين بنجاح"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * معالجة طلبات GET لاختبار عمل الرابط بنجاح
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "online",
    "service": "Lawyer Ali Halawa Intake Backend Engine",
    "lawyer": "الأستاذ علي علي محمود حلاوه - منشأة سلطان / منوف",
    "timestamp": Utilities.formatDate(new Date(), "Africa/Cairo", "yyyy-MM-dd HH:mm:ss")
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * التأكد من وجود الورقة وإعداد رؤوس الأعمدة وتنسيقها في أول تشغيل
 */
function getOrCreateLeadsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "طلبات_الاستشارة_CRM";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // عناوين الأعمدة
    var headers = [
      "كود الطلب",
      "تاريخ وتوقيت الإرسال",
      "اسم الموكل",
      "رقم الهاتف المحمول",
      "المركز / المحافظة",
      "تخصص القضية",
      "الخدمة المطلوبة",
      "درجة الأهمية",
      "ملخص الدعوى والمشكلة",
      "خط المحامي المختار",
      "حالة المتابعة"
    ];

    sheet.appendRow(headers);

    // تنسيق شريط الرأس بالألوان الذهبية والداكنة
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0a1128");
    headerRange.setFontColor("#dfb15b");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setFontFamily("Cairo");
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);

    // ضبط عرض الأعمدة تلقائياً
    sheet.setColumnWidth(1, 120); // كود
    sheet.setColumnWidth(2, 160); // التاريخ
    sheet.setColumnWidth(3, 180); // الاسم
    sheet.setColumnWidth(4, 130); // الهاتف
    sheet.setColumnWidth(5, 140); // المركز
    sheet.setColumnWidth(6, 200); // التخصص
    sheet.setColumnWidth(7, 200); // الخدمة
    sheet.setColumnWidth(8, 120); // الأهمية
    sheet.setColumnWidth(9, 350); // الملخص
    sheet.setColumnWidth(10, 140); // خط المحامي
    sheet.setColumnWidth(11, 120); // الحالة
  }

  return sheet;
}

/**
 * تلوين الصف باللون الأحمر الخفيف أو الأصفر إذا كانت القضية عاجلة أو طارئة
 */
function highlightUrgentRow(sheet, rowNum, urgency) {
  try {
    if (!urgency) return;
    var rowRange = sheet.getRange(rowNum, 1, 1, 11);
    if (urgency.indexOf("طارئ") !== -1) {
      rowRange.setBackground("#fee2e2"); // أحمر فاتح
    } else if (urgency.indexOf("عاجل") !== -1) {
      rowRange.setBackground("#fef3c7"); // أصفر فاتح
    }
  } catch(e) {
    // تجاوز أي خطأ تنسيقي غير حرج
  }
}

/**
 * إشعار بريدي فوري لحالات التحقيق العاجلة
 */
function sendEmailAlert(data) {
  try {
    var subject = "🚨 إشعار قضية عاجلة: " + data.name + " (" + data.urgency + ")";
    var body = "السلام عليكم أستاذ علي،\n\n" +
               "وصل طلب استشارة جديد ذو أولوية عالية عبر المنصة:\n\n" +
               "• الموكل: " + data.name + "\n" +
               "• رقم الهاتف: " + data.phone + "\n" +
               "• المركز: " + data.location + "\n" +
               "• نوع القضية: " + data.caseType + "\n" +
               "• درجة الاستعجال: " + data.urgency + "\n\n" +
               "تفاصيل المشكلة:\n" + data.summary + "\n\n" +
               "يرجى مراجعة واتساب أو جدول Google Sheets فوراً.";
    MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
  } catch(e) {
    console.warn("Mail warning: " + e.message);
  }
}
