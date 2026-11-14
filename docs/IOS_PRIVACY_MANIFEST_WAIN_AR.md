# بيان الخصوصية الشامل لـ iOS - WAIN

**التاريخ:** 2026-11-14  
**التطبيق:** WAIN  
**الإصدار:** 1.0  
**المتطلب:** iOS 17+ لـ App Store  
**الملف المتطلوب:** `PrivacyInfo.xcprivacy`

---

## 📋 نظرة عامة

Apple تطلب من جميع التطبيقات على App Store الإفصاح عن:
1. **أنواع البيانات** التي يجمعها التطبيق
2. **كيفية استخدام** هذه البيانات
3. **أغراض جمع** البيانات
4. **المتتبعات** المستخدمة (إن وجدت)

هذا الملف يوثق **PrivacyInfo.xcprivacy** اللازم لـ WAIN.

---

## 1️⃣ هيكل ملف PrivacyInfo.xcprivacy

### الموقع في Xcode:
```
WAIN (Project)
└─ Targets
   └─ wain (App Target)
      └─ Build Phases
         └─ Copy Bundle Resources
            └─ PrivacyInfo.xcprivacy ← إضافة هنا
```

### صيغة الملف: XML Plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- البيانات المجمعة -->
  <key>NSPrivacyCollectedDataTypes</key>
  <array>
    <!-- أنواع البيانات هنا -->
  </array>
  
  <!-- فئات API المتصلة -->
  <key>NSPrivacyAccessedAPICatagories</key>
  <array>
    <!-- فئات API هنا -->
  </array>
  
  <!-- حالة التتبع -->
  <key>NSPrivacyTracking</key>
  <false/>
</dict>
</plist>
```

---

## 2️⃣ البيانات المجمعة (NSPrivacyCollectedDataTypes)

### أ. معرفات المستخدم (User IDs)

```xml
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>NSPrivacyCollectedDataTypeUserID</string>
  
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>  <!-- مرتبط بهوية المستخدم -->
  
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>  <!-- ليس للتتبع -->
  
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
  </array>
</dict>
```

**التوضيح:**
- **ماذا:** معرف فريد للمستخدم (من Supabase Auth)
- **لماذا:** للمصادقة والتفويض
- **متى:** عند التسجيل والدخول

---

### ب. معرفات الأجهزة (Device IDs)

```xml
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>NSPrivacyCollectedDataTypeDeviceID</string>
  
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>  <!-- قد يكون مرتبطاً بالمستخدم -->
  
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>  <!-- ليس للتتبع -->
  
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
    <string>NSPrivacyCollectedDataTypePurposeSecurityandCompliance</string>
  </array>
</dict>
```

**التوضيح:**
- **ماذا:** معرف الجهاز (IDFV - Identifier For Vendor)
- **لماذا:** اكتشاف الأجهزة المسروقة وتقارير الأخطاء
- **الخصوصية:** منفصل عن معرف المستخدم

---

### ج. البيانات الشخصية (User Profile Data)

```xml
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>NSPrivacyCollectedDataTypeUserID</string>  <!-- أو أسماء حسب الحقول -->
  
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>
  
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>
  
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
  </array>
</dict>
```

**البيانات المجمعة:**
- البريد الإلكتروني
- اسم المستخدم
- تفضيلات اللغة
- الملف الشخصي

---

### د. بيانات الصور والملفات

```xml
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>NSPrivacyCollectedDataTypePhotoandVideo</string>
  
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>
  
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>
  
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
  </array>
</dict>
```

**الصور المجمعة:**
- صور الأغراض الشخصية
- وثائق مالية (صور)

**الملاحظة:** المستخدم يختار الصور التي يرفعها فقط (بدون وصول عام للمكتبة)

---

### هـ. بيانات الملفات (Documents)

```xml
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>NSPrivacyCollectedDataTypeOtherDataTypes</string>  <!-- أو أنواع محددة -->
  
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>
  
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>
  
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
  </array>
</dict>
```

**الملفات:**
- الفواتير (PDF/صور)
- الضمانات (PDF/صور)
- الإيصالات (صور)

---

### و. بيانات الموقع (Location - اختياري)

```
❌ لا نجمع بيانات الموقع
```

**ملاحظة:** إذا أضفنا ميزة "موقع الأغراض"، يجب الإفصاح:
```xml
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>NSPrivacyCollectedDataTypeLocation</string>
  
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>
  
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>
  
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
  </array>
</dict>
```

---

### ز. تسجيل الوصول والأنشطة

```xml
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>NSPrivacyCollectedDataTypeOtherDataTypes</string>
  
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>
  
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>
  
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
    <string>NSPrivacyCollectedDataTypePurposeSecurityandCompliance</string>
  </array>
</dict>
```

**البيانات:**
- عنوان IP (في السجلات)
- نوع الجهاز
- إصدار التطبيق
- الأنشطة المسجلة

---

## 3️⃣ فئات API المتصلة

### A. Network APIs

```xml
<dict>
  <key>NSPrivacyAccessedAPICatagory</key>
  <string>NSPrivacyAccessedAPICategoryNetworkingAPIs</string>
  
  <key>NSPrivacyAccessedAPICategoryReason</key>
  <array>
    <string>CA92.1</string>  <!-- ضروري للخدمة الأساسية -->
  </array>
</dict>
```

**الاستخدام:**
- الاتصال بـ Supabase (جميع العمليات)
- الاتصال بـ OpenAI Vision (اختياري عند تفعيل)
- تحميل الصور والملفات

**الأسباب المقبولة:**
- `CA92.1`: Service Required
- `CA92.2`: User-Prompted
- `CA92.3`: Analytics
- `CA92.4`: Performance Monitoring

---

### B. File APIs

```xml
<dict>
  <key>NSPrivacyAccessedAPICatagory</key>
  <string>NSPrivacyAccessedAPICategoryFileAPIs</string>
  
  <key>NSPrivacyAccessedAPICategoryReason</key>
  <array>
    <string>CA92.1</string>  <!-- قراءة الملفات المختارة -->
  </array>
</dict>
```

**الاستخدام:**
- قراءة الصور من Photo Library (عند الاختيار)
- قراءة الملفات من Document Picker
- الوصول إلى المستندات

---

### C. Photo Library APIs

```xml
<dict>
  <key>NSPrivacyAccessedAPICatagory</key>
  <string>NSPrivacyAccessedAPICategoryPhotoLibraryAPIs</string>
  
  <key>NSPrivacyAccessedAPICategoryReason</key>
  <array>
    <string>CA92.1</string>  <!-- ترفع الصور بواسطة المستخدم -->
  </array>
</dict>
```

**الصلاحيات:**
- PHPickerViewController: اختيار الصور فقط
- بدون وصول عام إلى المكتبة

---

### D. Camera APIs

```xml
<dict>
  <key>NSPrivacyAccessedAPICatagory</key>
  <string>NSPrivacyAccessedAPICategoryCameraAPIs</string>
  
  <key>NSPrivacyAccessedAPICategoryReason</key>
  <array>
    <string>CA92.1</string>  <!-- اختياري - التقاط الصور -->
  </array>
</dict>
```

**ملاحظة:** إضافة الكاميرا في المرحلة 2

---

### E. User Defaults APIs

```
❌ بدون حاجة للإفصاح (AsyncStorage محلي فقط)
```

---

## 4️⃣ سياسات التتبع والمتتبعات

### حالة التتبع

```xml
<key>NSPrivacyTracking</key>
<false/>  <!-- ❌ لا نتتبع المستخدمين -->
```

### النطاقات المتتبعة

```xml
<key>NSPrivacyTrackingDomains</key>
<array>
  <!-- قائمة فارغة - لا يوجد متتبعات -->
</array>
```

---

## 5️⃣ الملف الكامل PrivacyInfo.xcprivacy

### الهيكل الكامل

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- ====== البيانات المجمعة ====== -->
  <key>NSPrivacyCollectedDataTypes</key>
  <array>
    
    <!-- معرف المستخدم -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeUserID</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>
    
    <!-- معرف الجهاز -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeDeviceID</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
        <string>NSPrivacyCollectedDataTypePurposeSecurityandCompliance</string>
      </array>
    </dict>
    
    <!-- الصور والملفات -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypePhotoandVideo</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>
    
    <!-- بيانات أخرى (سجلات) -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeOtherDataTypes</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
        <string>NSPrivacyCollectedDataTypePurposeSecurityandCompliance</string>
      </array>
    </dict>
    
  </array>
  
  <!-- ====== فئات API ====== -->
  <key>NSPrivacyAccessedAPICatagories</key>
  <array>
    
    <!-- Network APIs -->
    <dict>
      <key>NSPrivacyAccessedAPICatagory</key>
      <string>NSPrivacyAccessedAPICategoryNetworkingAPIs</string>
      <key>NSPrivacyAccessedAPICategoryReason</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>
    
    <!-- File APIs -->
    <dict>
      <key>NSPrivacyAccessedAPICatagory</key>
      <string>NSPrivacyAccessedAPICategoryFileAPIs</string>
      <key>NSPrivacyAccessedAPICategoryReason</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>
    
    <!-- Photo Library -->
    <dict>
      <key>NSPrivacyAccessedAPICatagory</key>
      <string>NSPrivacyAccessedAPICategoryPhotoLibraryAPIs</string>
      <key>NSPrivacyAccessedAPICategoryReason</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>
    
  </array>
  
  <!-- ====== حالة التتبع ====== -->
  <key>NSPrivacyTracking</key>
  <false/>
  
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  
</dict>
</plist>
```

---

## 6️⃣ خطوات التطبيق في Xcode

### الخطوة 1: إنشاء الملف

```
1. في Xcode، اضغط على Project > WAIN
2. اختر Target > wain
3. Build Phases > Copy Bundle Resources
4. اضغط + لإضافة ملف جديد
5. New > Empty File
6. الاسم: PrivacyInfo.xcprivacy
```

### الخطوة 2: إضافة المحتوى

```
1. انسخ محتوى XML أعلاه
2. الصق في PrivacyInfo.xcprivacy
3. تأكد من أن الصيغة صحيحة
```

### الخطوة 3: التحقق

```
1. Build القسم: Cmd+B
2. تحقق من عدم وجود أخطاء
3. اختبر في Simulator
```

---

## 7️⃣ التحديثات المستقبلية

### عند إضافة ميزات جديدة:

| الميزة | تحديث |
|--------|------|
| **المصادقة الثنائية** | أضف Authentication data |
| **كاميرا التطبيق** | أضف Camera APIs |
| **بصمة الإصبع** | أضف Biometric data |
| **Sentry (Error Reporting)** | أضف User Analytics |
| **RevenueCat (الدفع)** | أضف Payment information |

---

## 8️⃣ الالتزام بـ PDPL

```
هذا البيان متوافق مع:
✅ قانون حماية البيانات الشخصية السعودي
✅ متطلبات App Store لـ iOS 17+
✅ معايير الشفافية والإفصاح
✅ حقوق المستخدمين في المعرفة
```

---

**النسخة:** 1.0  
**آخر تحديث:** 2026-11-14  
**الملف:** `packages/mobile/PrivacyInfo.xcprivacy`

_الملف جاهز للتطبيق المباشر في Xcode_
