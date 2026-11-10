# Expo Go Setup & Testing Guide
## WRITEGO Mobile App على Expo Go

**التاريخ**: 2026-11-10
**الحالة**: ✅ Expo Go Compatible
**الهدف**: تشغيل التطبيق عبر Expo Go على iPhone قبل الانتقال لـ Development Build

---

## 📱 ما هو Expo Go؟

Expo Go هي تطبيق على App Store و Google Play Play يسمح لك بتشغيل تطبيقات React Native بدون الحاجة لـ compilation native.

**المميزات**:
- ✅ تشغيل سريع (أقل من 30 ثانية)
- ✅ Hot reload (تحديثات فورية)
- ✅ لا حاجة لـ Xcode أو Android Studio
- ✅ اختبار سريع على أجهزة حقيقية

**القيود**:
- ❌ بعض Native modules غير مدعومة
- ❌ لا يمكن استخدام Custom Native Code
- ❌ بعض الميزات تتطلب Development Build

---

## 🚀 الإعداد السريع

### خطوة 1: تثبيت Expo CLI

```bash
npm install -g expo-cli
```

### خطوة 2: التحقق من البيئة

```bash
cd packages/mobile
npm install
```

### خطوة 3: بدء التطبيق

```bash
npm run start
# أو
npm run dev
```

**النتيجة**: سيظهر QR code في الـ terminal

### خطوة 4: فتح على الجهاز

#### على iPhone:
1. افتح Camera app
2. امسح QR code
3. سيفتح Expo Go تلقائياً
4. اتصبر حتى ينتهي التطبيق من التحميل (30 ثانية)

#### على Android:
1. افتح Expo Go app
2. اضغط "Scan QR code"
3. امسح QR code
4. اتصبر حتى ينتهي التطبيق من التحميل

---

## 🔍 ما تم إصلاحه لـ Expo Go

### 1. ✅ AsyncStorage Integration
**المشكلة**: Session لم تكن تُحفظ عند إغلاق التطبيق
**الحل**: تم إضافة AsyncStorage كـ storage adapter للـ Supabase

```typescript
// قبل:
storage: undefined

// بعد:
import AsyncStorage from '@react-native-async-storage/async-storage';
storage: AsyncStorage
```

**الفائدة**: الآن الـ user يبقى مسجل حتى بعد إغلاق التطبيق

### 2. ✅ Navigation Fix
**المشكلة**: عدم القدرة على الملاحة بين auth و app screens
**الحل**: تم تحديث Root Layout ليستخدم `isSignedIn` بشكل صحيح

**النتيجة**: 
- عند تسجيل الدخول: الانتقال لـ app screens
- عند تسجيل الخروج: الانتقال لـ auth screens

### 3. ✅ Loading State
**المضافة**: تم إضافة Loading indicator أثناء استعادة الـ session

---

## 🧪 Testing Checklist

### Phase 1: Authentication Flow

#### تسجيل دخول جديد (Sign Up)
- [ ] اضغط "إنشاء حساب جديد"
- [ ] أدخل بريد إلكتروني (مثل: test@example.com)
- [ ] أدخل كلمة مرور
- [ ] أدخل اسم المستخدم
- [ ] اضغط "إنشاء حساب"
- [ ] التحقق من ظهور Loading indicator
- [ ] بعد النجاح، يجب أن تنتقل لـ Home screen

#### تسجيل دخول (Login)
- [ ] أدخل نفس البريد والكلمة من الخطوة السابقة
- [ ] اضغط "تسجيل الدخول"
- [ ] يجب أن تنتقل لـ Home screen بنجاح

#### Session Persistence
- [ ] تسجيل دخول
- [ ] أغلق التطبيق تماماً
- [ ] افتح التطبيق مرة أخرى
- [ ] يجب أن تكون مسجل دخول (بدون الحاجة لإدخال البيانات مرة أخرى)

#### Logout
- [ ] اذهب لـ Settings
- [ ] اضغط "تسجيل الخروج"
- [ ] يجب أن تعود لـ Login screen

### Phase 2: Navigation

#### Tabs Navigation
- [ ] تحقق من وجود 4 tabs في الأسفل:
  - Home
  - Writer
  - Summarizer
  - Settings

#### Screen Transitions
- [ ] الانتقال بين الـ tabs يجب أن يكون سلس
- [ ] لا توجد errors في الـ console

#### Back Navigation
- [ ] الضغط على الزر الخلفي يجب أن يعمل بشكل صحيح
- [ ] لا توجد crashes

---

## 🔧 Troubleshooting

### المشكلة: "Cannot connect to development server"

**الحل**:
```bash
# تأكد من أن الهاتف والـ laptop على نفس الـ WiFi
# أعد تشغيل الـ dev server:
npm run start -- --clear
```

### المشكلة: "Module not found error"

**الحل**:
```bash
# نظّف node_modules وأعد التثبيت
rm -rf node_modules
npm install

# ثم أعد تشغيل:
npm run start
```

### المشكلة: Session لم تُحفظ بعد الإغلاق

**الحل**: تأكد من أن AsyncStorage مثبتة بشكل صحيح:
```bash
npm install @react-native-async-storage/async-storage
```

### المشكلة: "Authentication failed"

**الحل**:
1. تأكد من البيانات المدخلة
2. تحقق من أن Supabase project معروف بشكل صحيح
3. تحقق من البيئة variables في `.env`

---

## 📊 قائمة الحزم المدعومة على Expo Go

### ✅ مدعومة بالكامل:
- `expo-router` - الملاحة
- `react-native-paper` - UI components
- `zustand` - State management
- `@react-native-async-storage/async-storage` - Local storage
- `@supabase/supabase-js` - Backend
- `expo-document-picker` - File selection
- `expo-av` - Video playback (basic)
- `dayjs` - Date handling

### ⚠️ محدودة (تعمل لكن ببعض القيود):
- `@react-native-community/netinfo` - Network detection

### ❌ غير مدعومة:
- Native modules مخصصة
- Video recording (يتطلب Development Build)
- Native libraries معقدة

---

## 🚀 الانتقال لـ Development Build (Phase 2)

عندما تحتاج لـ Native modules أو ميزات متقدمة:

```bash
# 1. تثبيت EAS CLI
npm install -g eas-cli

# 2. تسجيل الدخول
eas login

# 3. إنشاء Development Build
eas build --platform ios --profile development

# 4. بعد إنشاء البناء، فتحه على الجهاز
```

---

## 📝 ملاحظات مهمة

⚠️ **AsyncStorage مهم**
- بدون AsyncStorage، الـ session لن تُحفظ
- تم إصلاح هذه المشكلة بالفعل

⚠️ **Network Requirements**
- الهاتف والـ laptop يجب أن يكونوا على نفس الـ WiFi
- أو استخدم USB cable

⚠️ **Performance**
- Expo Go قد تكون أبطأ من Native build
- لكن كافية للاختبار والتطوير

⚠️ **No Custom Native Code**
- لا يمكن استخدام Custom Native modules
- كل شيء يجب أن يكون عبر Expo APIs

---

## 🎯 الخطوات التالية

### بعد التأكد من نجاح Expo Go:
1. اختبار Edge Functions (AI operations)
2. اختبار Credit system
3. بناء UI كاملة للـ text tools
4. الانتقال لـ Development Build إذا لزم الأمر

### قائمة التحقق النهائية:
- [ ] Expo Go يعمل بدون errors
- [ ] Session persistence يعمل
- [ ] Navigation smooth
- [ ] لا توجد console warnings
- [ ] جاهز لـ Phase 2 development

---

## 🔗 موارد مفيدة

- [Expo Documentation](https://docs.expo.dev)
- [Expo Go on App Store](https://apps.apple.com/app/expo-go/id1054236564)
- [Expo Go on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [Supabase + React Native](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)

---

**الحالة**: ✅ جاهز للاختبار على Expo Go
**التاريخ**: 2026-11-10
