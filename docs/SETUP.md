# دليل الإعداد - WRITEGO

هذا الدليل يشرح كيفية إعداد وتشغيل مشروع WRITEGO على جهازك.

## 📋 المتطلبات

- **Node.js**: v18.0.0 أو أحدث
- **npm**: v8.0.0 أو أحدث
- **Expo CLI**: للتطوير على iOS/Android
- **Supabase Account**: للـ backend
- **Git**: للتحكم بالإصدار

## 🔧 الخطوات الأولية

### 1. استنساخ المشروع
```bash
git clone https://github.com/dwnasem-blip/Kalamek-AI.git
cd Kalamek-AI
```

### 2. تثبيت المتطلبات
```bash
# تثبيت جميع الحزم
npm install

# أو إذا كنت تستخدم yarn
yarn install
```

### 3. إعداد متغيرات البيئة

#### أ. Supabase Setup
```bash
# انسخ الملف
cp packages/mobile/.env.example packages/mobile/.env

# أضف بيانات Supabase الخاصة بك
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### ب. إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد أو سجل دخول
3. أنشئ مشروع جديد
4. احفظ URL و Anon Key
5. اذهب إلى SQL Editor
6. ركول شروع الملف `supabase/migrations/001_initial_schema.sql`
7. نفذ الـ SQL

### 4. تشغيل التطبيق

#### خيار 1: على Emulator/Simulator
```bash
# تطوير عام
npm run dev

# iOS فقط
npm run dev:ios

# Android فقط
npm run dev:android
```

#### خيار 2: على الهاتف الفعلي
```bash
# تثبيت Expo Go من App Store أو Google Play
# ثم شغل:
npm run dev

# قم بمسح QR Code من التطبيق
```

## 📁 البنية الحالية

```
Kalamek-AI/
├── packages/
│   ├── mobile/          # تطبيق React Native + Expo
│   ├── admin/           # لوحة التحكم (الإعداد لاحقاً)
│   └── shared/          # مشاركة الأنواع والأدوات (الإعداد لاحقاً)
├── supabase/
│   ├── migrations/      # Schema قاعدة البيانات
│   ├── functions/       # Edge Functions (قريباً)
│   └── policies/        # RLS Policies (قريباً)
├── docs/                # التوثيق
└── README.md            # ملف معلومات المشروع
```

## ✅ التحقق من الإعداد

### اختبر الاتصال بـ Supabase
```typescript
// في packages/mobile/src/services/supabase.ts
// تحقق أن المتغيرات البيئية محملة بشكل صحيح
console.log(supabaseUrl, supabaseAnonKey);
```

### اختبر شاشات التطبيق
1. شغل التطبيق: `npm run dev`
2. انتظر تحميل الشاشة الأولى
3. يجب أن ترى شاشة تسجيل الدخول
4. جرّب الملاحة بين الشاشات

## 🚀 الخطوات التالية

### المرحلة 1: نظام المصادقة (في العمل)
- ✅ شاشات تسجيل الدخول والتسجيل
- ✅ تكامل Supabase Auth
- ⏳ اختبار النظام الكامل

### المرحلة 2: بناء أول أداة AI
- [ ] اختيار OpenAI API
- [ ] بناء واجهة AI Writer
- [ ] تكامل مع backend

### المرحلة 3: توسيع الميزات
- [ ] AI Summarizer
- [ ] AI Rewriter
- [ ] Social Media Content

## 🐛 استكشاف الأخطاء

### المشكلة: خطأ في تثبيت الحزم
```bash
# حل 1: امسح node_modules
rm -rf node_modules package-lock.json
npm install

# حل 2: استخدم npm fresh install
npm ci
```

### المشكلة: خطأ في الاتصال بـ Supabase
```bash
# تحقق من:
# 1. متغيرات البيئة صحيحة
# 2. الاتصال بالإنترنت
# 3. مشروع Supabase نشط
```

### المشكلة: خطأ في الشاشات
```bash
# امسح Expo cache
npm run dev -- --clear
```

## 📚 الموارد المفيدة

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router](https://expo.dev/router)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 المساهمة

1. انشئ branch جديد: `git checkout -b feature/my-feature`
2. اعمل على الميزة
3. عمل commit: `git commit -m "Add my feature"`
4. اعمل push: `git push origin feature/my-feature`
5. افتح Pull Request

## 📝 ملاحظات الأمان

⚠️ **مهم جداً**:
- لا تضع مفاتيح API السرية في التطبيق
- استخدم Edge Functions للعمليات الحساسة
- فعّل RLS على جميع الجداول
- لا تستخدم SERVICE_ROLE_KEY في التطبيق

---

**آخر تحديث**: 2026-11-10
**الإصدار**: 0.1.0
