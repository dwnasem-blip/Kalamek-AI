# الخطوات التالية - WRITEGO

خطة تفصيلية للخطوات التالية في التطوير.

## ✅ ما تم إنجازه

### المرحلة 0: البنية الأساسية
- ✅ Monorepo setup (packages/mobile, packages/admin, packages/shared)
- ✅ React Native + Expo configuration
- ✅ TypeScript setup
- ✅ ESLint & Prettier configuration
- ✅ Supabase schema و RLS policies
- ✅ Authentication screens (login, signup, forgot-password)
- ✅ Main app screens structure
- ✅ Zustand auth store
- ✅ Basic routing (Expo Router)

## 🎯 الأولويات القادمة

### المرحلة 1: إكمال نظام المصادقة (الأسبوع الأول)
**التاريخ المتوقع**: الآن - التطبيق

#### 1.1 اختبار نظام المصادقة
- [ ] اختبر عملية التسجيل الكاملة
- [ ] اختبر عملية تسجيل الدخول
- [ ] اختبر استعادة كلمة المرور
- [ ] اختبر logout

#### 1.2 إضافة المميزات الإضافية
- [ ] تذكر جهازي (Remember device)
- [ ] تسجيل دخول اجتماعي (اختياري)
- [ ] Verification email
- [ ] صفحة الملف الشخصي

#### 1.3 معالجة الأخطاء والحالات الخاصة
- [ ] معالجة أخطاء الشبكة
- [ ] معالجة timeout
- [ ] تحديثات الجلسة (session refresh)

#### الملفات المراد إنشاؤها
```
packages/mobile/
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useAsync.ts
│   ├── utils/
│   │   ├── errorHandling.ts
│   │   └── validation.ts
│   └── components/
│       ├── LoadingIndicator.tsx
│       └── ErrorBoundary.tsx
└── __tests__/
    └── services/supabase.test.ts
```

---

### المرحلة 2: بناء أول أداة AI - AI Writer (الأسابيع 2-3)
**التاريخ المتوقع**: أسبوعان

#### 2.1 إعداد OpenAI API
- [ ] تسجيل حساب OpenAI
- [ ] الحصول على API Key
- [ ] اختبار API مباشرة

#### 2.2 إنشاء Edge Function
```typescript
// supabase/functions/generate-article/index.ts
// - استقبال: title, description, style, length
// - معالجة: استدعاء OpenAI
// - إرجاع: article content
```

#### 2.3 بناء واجهة Writer
```typescript
// screens/writer.tsx
// - input field للعنوان
// - text area للوصف
// - dropdowns للأسلوب والطول
// - generate button
// - loading state
// - result display
// - copy to clipboard button
```

#### 2.4 تكامل الأرصدة
- [ ] اختبر استهلاك الأرصدة
- [ ] عرض الأرصدة المتبقية
- [ ] تحذير عند نهاية الأرصدة

#### الملفات المراد إنشاؤها
```
packages/mobile/
├── src/
│   ├── services/
│   │   ├── ai-providers/
│   │   │   ├── types.ts
│   │   │   └── openai.ts
│   │   └── credits.ts
│   ├── hooks/
│   │   ├── useGenerateArticle.ts
│   │   └── useCredits.ts
│   └── components/
│       ├── ArticleGenerator.tsx
│       ├── ResultDisplay.tsx
│       └── CreditWarning.tsx
├── app/(app)/
│   └── writer.tsx (complete)
└── __tests__/
    ├── services/openai.test.ts
    └── hooks/useGenerateArticle.test.ts

supabase/
├── functions/
│   └── generate-article/
│       └── index.ts
└── migrations/
    └── 002_add_ai_provider_config.sql
```

---

### المرحلة 2.5: AI Summarizer (الأسبوع 4)
**بنفس نمط AI Writer**

- [ ] Edge Function للتلخيص
- [ ] واجهة Summarizer
- [ ] دعم الملفات (PDF, Word)
- [ ] تحديد طول الملخص

---

### المرحلة 3: Admin Dashboard (الأسبوع 5)
**التاريخ المتوقع**: خمسة أسابيع

#### 3.1 Setup Next.js
```bash
cd packages/admin
npm create next-app@latest .
```

#### 3.2 صفحات الإدارة الأساسية
- [ ] Dashboard (إحصائيات)
- [ ] Users management
- [ ] Projects viewer
- [ ] Analytics

#### الملفات المراد إنشاؤها
```
packages/admin/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── users/
│   ├── projects/
│   ├── analytics/
│   └── settings/
├── src/
│   ├── components/
│   ├── services/
│   └── utils/
└── package.json
```

---

## 🚨 النقاط الهامة قبل البدء

### 1. متغيرات البيئة
```bash
# تأكد أن .env موجود وصحيح
packages/mobile/.env

# تحتوي على:
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2. قاعدة البيانات
```bash
# تأكد أن schema تم تطبيقه
# اختبر الاتصال:
supabase → SQL Editor → SELECT * FROM profiles
```

### 3. الاختبار المنتظم
```bash
# قبل كل commit:
npm run lint
npm run format
npm run type-check
```

### 4. الأمان
- ⚠️ لا تخزن API Keys في التطبيق
- ⚠️ استخدم Environment variables فقط
- ⚠️ لا تضع SERVICE_ROLE_KEY في الموبايل

---

## 📋 قائمة التحقق قبل كل مرحلة

### قبل المرحلة 1
- [ ] تم اختبار تسجيل الدخول
- [ ] تم اختبار التسجيل
- [ ] تم اختبار الملاحة

### قبل المرحلة 2
- [ ] Edge Function تعمل بنجاح
- [ ] استهلاك الأرصدة يعمل
- [ ] واجهة Writer مكتملة
- [ ] tested locally

### قبل الإطلاق
- [ ] جميع الاختبارات تمر
- [ ] لا توجد console errors
- [ ] الأداء جيد (< 1s response)
- [ ] RLS policies تعمل صحيح

---

## 🔄 نصائح للتطوير السريع

### 1. استخدم Hot Reload
```bash
npm run dev -- --clear
```

### 2. اختبر على الهاتف الفعلي مبكراً
```bash
npm run dev  # ثم scan QR code
```

### 3. استخدم Supabase SQL Editor
```
Dashboard → SQL Editor
اكتب queries للتحقق من البيانات
```

### 4. استخدم React DevTools
```bash
# لتتبع state changes
npx react-devtools
```

---

## 📚 المراجع المفيدة

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎉 ملاحظة مهمة

**هذا المشروع بدأ للتو!** تم بناء الأساس القوي، والآن:
- ✅ البنية التقنية جاهزة
- ✅ قاعدة البيانات محمية بـ RLS
- ✅ المصادقة تعمل
- ✅ جاهز لإضافة الميزات

**التركيز الآن على**:
1. ✨ اختبار وتحسين النظام الحالي
2. 🚀 إضافة ميزات AI الفعلية
3. 🎨 تحسين واجهة المستخدم
4. 📈 قياس الأداء

---

**آخر تحديث**: 2026-11-10
**الإصدار**: 0.1.0
