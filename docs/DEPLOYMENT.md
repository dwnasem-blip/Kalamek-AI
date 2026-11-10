# دليل النشر والإطلاق - WRITEGO

شرح كيفية اختبار والإطلاق على App Store و Google Play.

## 🧪 مراحل الاختبار

### 1. الاختبار المحلي
```bash
# تشغيل على Emulator
npm run dev:android
npm run dev:ios

# أو على الهاتف الفعلي
npm run dev  # scan QR code
```

### 2. الاختبار قبل الإطلاق (Pre-launch)
```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build for iOS
eas build --platform ios --profile preview

# Build for Android
eas build --platform android --profile preview
```

---

## 📱 نشر على App Store (iOS)

### المتطلبات
- [ ] Apple Developer Account ($99/year)
- [ ] Xcode installed
- [ ] Certificate & Provisioning Profile

### الخطوات

#### 1. إعداد الحساب
```bash
# إذا لم تكن تملك حساب EAS:
eas account:login
eas build:configure
```

#### 2. إنشاء Certificate
```bash
# iOS Certificate
eas credentials --platform ios

# اختر "Create new"
# اختر "Development" و "Production"
```

#### 3. بناء الـ Build
```bash
# Production build
eas build --platform ios --profile production
```

#### 4. رفع على App Store
```bash
# استخدم Transporter أو:
eas submit --platform ios

# الخطوات:
# 1. انتظر ختم Apple
# 2. ملء App Store Connect
# 3. انتظر المراجعة (1-3 أيام)
# 4. نشر
```

---

## 🤖 نشر على Google Play (Android)

### المتطلبات
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Keystore file
- [ ] Google Play Console access

### الخطوات

#### 1. إنشاء Keystore
```bash
# إذا لم تملك واحدة:
eas build:configure --platform android

# ستسأل عن Keystore
# اختر "Generate new"
```

#### 2. بناء الـ Build
```bash
# Production build
eas build --platform android --profile production
```

#### 3. رفع على Google Play
```bash
# Automatic submission:
eas submit --platform android

# أو يدوياً عبر Google Play Console
```

---

## 🔄 عملية الإطلاق الكاملة

### قبل الإطلاق (Checklist)
- [ ] جميع الاختبارات تمر
- [ ] لا توجد console errors
- [ ] الأداء على الهاتف الفعلي جيد
- [ ] UI/UX مختبرة على أجهزة مختلفة
- [ ] الأيقونات والـ Splash screen جاهزة
- [ ] الخصوصية والأمان تم التحقق منها
- [ ] Supabase في production mode

### أثناء الإطلاق
```
Week 1: iOS (أصعب)
  ├─ Submit
  ├─ Review
  ├─ Fix issues if any
  └─ Release

Week 2: Android
  ├─ Submit
  ├─ Review (عادة أسرع)
  └─ Release
```

### بعد الإطلاق
- [ ] Monitor crashes (Sentry/Firebase)
- [ ] Read reviews
- [ ] Fix critical bugs
- [ ] Update regularly

---

## 🛡️ الأمان قبل الإطلاق

### 1. Environment Variables
```bash
# تأكد من:
# - لا توجد حقيقية API keys في الكود
# - استخدم .env.production
# - Supabase ANON_KEY فقط (آمنة)
```

### 2. RLS Policies
```bash
# اختبر RLS:
# - User A لا يرى بيانات User B
# - Unauthorized operations تفشل
```

### 3. API Security
```bash
# Edge Functions:
# - استخدم SERVICE_ROLE_KEY
# - تحقق من البيانات المدخلة
# - استخدم rate limiting
```

---

## 📊 المراقبة بعد الإطلاق

### 1. Crash Reporting
```bash
# ابدأ باستخدام Sentry:
npm install @sentry/react-native
```

### 2. Analytics
```bash
# ابدأ بـ:
# - Firebase Analytics
# - Supabase Analytics
```

### 3. Performance
```bash
# Monitor:
# - App startup time
# - API response times
# - Memory usage
```

---

## 🐛 الاستجابة السريعة للأخطاء

### إذا حدث خطأ بعد الإطلاق
```bash
# 1. تحديد المشكلة
# 2. إصلاح الكود
# 3. بناء نسخة جديدة
eas build --platform ios --profile production

# 4. اختبر محلياً أولاً
# 5. رفع النسخة الجديدة
eas submit --platform ios
```

---

## 💰 التكاليف المتوقعة

### تطوير
- Supabase: $0-25/month (حسب الاستخدام)
- OpenAI API: $0-100/month (حسب الاستخدام)
- ElevenLabs: $0-100/month (حسب الاستخدام)
- **Total**: ~$0-225/month

### نشر
- Apple Developer: $99/year
- Google Play: $25 (one-time)
- EAS Build: $0-99/month (اختياري)

---

## 📋 Quick Reference

```bash
# Development
npm run dev

# Before deployment
npm run lint && npm run type-check

# Build
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit
eas submit --platform ios
eas submit --platform android

# Logs
eas build:list
eas build:view --id <build-id>
```

---

## 🔗 المراجع

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**آخر تحديث**: 2026-11-10
