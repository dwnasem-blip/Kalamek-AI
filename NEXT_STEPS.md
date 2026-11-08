# Kalamek AI - الخطوات التالية 🚀

## ✅ ما تم إنجازه (المرحلة 0: التأسيس)

### البنية الأساسية
```
✅ تصميم قاعدة البيانات الكاملة (12 جدول)
✅ إعداد Expo/React Native
✅ TypeScript configuration
✅ Supabase integration
✅ Authentication provider
✅ i18n (عربي/إنجليزي)
✅ Theme system
✅ Arabic text utilities
✅ Formatting utilities
✅ Constants & types
✅ Project documentation
```

### الملفات المُنشأة
- `DATABASE_SCHEMA.md` - تصميم قاعدة البيانات المفصل
- `SETUP_GUIDE.md` - دليل الإعداد الأولي
- `ARCHITECTURE.md` - معمارية التطبيق
- `PHASE1_MVP.md` - خطة المرحلة الأولى
- `app/services/supabase.ts` - Supabase client و queries
- `app/providers/*` - Auth, i18n, Theme providers
- `app/utils/` - Arabic, formatting utilities
- `app/types/` - TypeScript interfaces
- `supabase/migrations/001_initial_schema.sql` - قاعدة البيانات

---

## 🎯 المرحلة 1: MVP (الأسبوع القادم)

### المتطلبات الأولية
```bash
# 1. إعداد Supabase
- أنشئ حساب supabase.com
- أنشئ project جديد
- احفظ SUPABASE_URL و SUPABASE_ANON_KEY
- طبّق migration من supabase/migrations/001_initial_schema.sql

# 2. إعداد OpenAI
- احصل على API key من platform.openai.com
- حفظ OPENAI_API_KEY

# 3. إعداد المشروع المحلي
cp .env.example .env.local
# عدّل .env.local بـ مفاتيحك
npm install
```

### الخطوات (بالترتيب):

#### 1️⃣ **نظام المصادقة** (اليوم 1-2)
```
المكان: app/screens/ و app/components/
ملفات جديدة:
  ├── screens/LoginScreen.tsx
  ├── screens/SignupScreen.tsx
  ├── screens/ForgotPasswordScreen.tsx
  ├── screens/OnboardingScreen.tsx
  └── components/
      ├── AuthForm.tsx
      ├── PasswordInput.tsx
      └── EmailInput.tsx

الوظائف:
  [ ] تسجيل جديد (email + password + username)
  [ ] تأكيد البريد الإلكتروني
  [ ] تسجيل الدخول
  [ ] حفظ الجلسة محلياً (AsyncStorage)
  [ ] إعادة استرجاع كلمة المرور
  [ ] تسجيل الخروج

الاختبار:
  npm run test -- AuthProvider
```

#### 2️⃣ **واجهة المشاريع الأساسية** (اليوم 3-4)
```
المكان: app/screens/HomeScreen و app/components/
ملفات جديدة:
  ├── screens/HomeScreen.tsx
  ├── screens/ProjectDetailScreen.tsx
  ├── screens/NewProjectScreen.tsx
  └── components/
      ├── ProjectCard.tsx
      ├── ProjectList.tsx
      ├── EmptyState.tsx
      └── LoadingSpinner.tsx

الوظائف:
  [ ] عرض قائمة المشاريع
  [ ] إنشاء مشروع جديد
  [ ] فتح مشروع
  [ ] تعديل عنوان المشروع
  [ ] حذف مشروع
  [ ] Infinite scroll
  [ ] Search & filter

الاختبار:
  npm run test -- ProjectService
```

#### 3️⃣ **رفع الفيديو** (اليوم 5)
```
المكان: app/screens/UploadScreen و app/services/
ملفات جديدة:
  ├── screens/UploadScreen.tsx
  ├── services/videoService.ts
  └── components/
      ├── VideoUploader.tsx
      ├── VideoPreview.tsx
      └── UploadProgress.tsx

الوظائف:
  [ ] اختيار فيديو من المكتبة
  [ ] معاينة الفيديو
  [ ] التحقق من الحجم (حسب الخطة)
  [ ] رفع إلى Supabase Storage
  [ ] شريط التقدم
  [ ] معالجة الأخطاء والإعادة
  [ ] تخزين رابط الفيديو في DB

الاختبار:
  npm run test -- StorageService
```

#### 4️⃣ **ربط OpenAI Whisper** (اليوم 6)
```
المكان: app/services/
ملفات جديدة:
  ├── services/whisperService.ts
  ├── services/audioService.ts
  └── utils/audioProcessing.ts

الوظائف:
  [ ] استدعاء OpenAI Whisper API
  [ ] إرسال الفيديو للمعالجة
  [ ] استقبال النص الكامل
  [ ] استقبال word-level timestamps
  [ ] حفظ النتيجة في DB
  [ ] معالجة اللغات (العربية، الإنجليزية)
  [ ] التعامل مع الأخطاء والـ retry

الاختبار:
  npm run test:openai

مثال الـ Response:
{
  "text": "السلام عليكم ورحمة الله",
  "words": [
    { "word": "السلام", "start": 0, "end": 500, "confidence": 0.95 },
    { "word": "عليكم", "start": 500, "end": 1000, "confidence": 0.92 }
  ],
  "language": "ar"
}
```

#### 5️⃣ **عرض النص** (اليوم 7)
```
المكان: app/screens/EditorScreen و app/components/
ملفات جديدة:
  ├── screens/EditorScreen.tsx
  └── components/
      ├── TranscriptViewer.tsx
      ├── VideoPlayer.tsx
      ├── SyncTest.tsx
      └── WordList.tsx

الوظائف:
  [ ] عرض النص الكامل
  [ ] تشغيل الفيديو
  [ ] مزامنة بسيطة (عرض الكلمة الحالية)
  [ ] البحث في النص
  [ ] نسخ النص
  [ ] عرض الكلمات كـ list مع التوقيت
  [ ] زر التشغيل/الإيقاف

الاختبار:
  يدوي على جهاز حقيقي
```

#### 6️⃣ **حفظ وإدارة المشاريع** (اليوم 8)
```
المكان: app/store/ و app/services/
ملفات جديدة:
  ├── store/projectStore.ts
  ├── store/editorStore.ts
  └── hooks/useProject.ts

الوظائف:
  [ ] حفظ تلقائي كل 30 ثانية
  [ ] حفظ يدوي
  [ ] تتبع آخر وقت حفظ
  [ ] استعادة المسودات
  [ ] التعامل مع فشل الحفظ
  [ ] Conflict resolution

الاختبار:
  npm run test -- ProjectStore
```

---

## 📋 الأولويات الفورية

### الآن (قبل بدء الترميز):

1. **أنشئ حساب Supabase**
   ```bash
   # اذهب إلى supabase.com
   # أنشئ project جديد
   # احفظ المفاتيح
   ```

2. **احصل على OpenAI API Key**
   ```bash
   # اذهب إلى platform.openai.com
   # أنشئ API key
   ```

3. **أنشئ `.env.local`**
   ```bash
   cp .env.example .env.local
   # عدّل بـ مفاتيحك
   ```

4. **ثبّت المكتبات**
   ```bash
   npm install
   ```

5. **طبّق قاعدة البيانات**
   ```bash
   supabase login
   supabase link --project-ref <your_project_ref>
   supabase migration up
   ```

6. **اختبر الاتصالات**
   ```bash
   npm run test:supabase
   npm run test:openai
   ```

---

## 🛠️ أدوات ستحتاجها

### للتطوير
- **Expo Go** (للهاتف)
- **Xcode** (إذا أردت تشغيل iOS محلياً)
- **Android Studio** (للـ Android)

### للاختبار
- جهاز حقيقي أو emulator
- FFmpeg (للاختبار المحلي للـ audio)

### للمراقبة
- **Supabase Dashboard** - لمراقبة قاعدة البيانات
- **OpenAI API Usage** - لمراقبة استهلاك الـ API

---

## 📊 معايير النجاح (MVP)

### الوظائف المطلوبة
- [ ] تسجيل/دخول يعمل بدون مشاكل
- [ ] رفع فيديو ينجح
- [ ] استخراج النص يعمل (لا يهم الدقة 100% الآن)
- [ ] عرض النص يظهر بشكل صحيح
- [ ] حفظ المشروع يعمل
- [ ] إعادة فتح المشروع يحافظ على البيانات

### معايير الجودة
- [ ] لا توجد console errors
- [ ] الأداء مقبول على 4G
- [ ] النص العربي يعرض بشكل صحيح
- [ ] لا توجد memory leaks

### الأمان
- [ ] لا توجد API keys في الكود
- [ ] جميع الـ queries protected بـ RLS
- [ ] الجلسات محفوظة بأمان

---

## 🎬 مرحلة ما بعد MVP (المرحلة 2)

بعد إنهاء MVP:
1. **مزامنة دقيقة** للنص مع الصوت (word-by-word)
2. **محرر متقدم** لتعديل النص والتوقيت
3. **مكتبة خطوط أساسية** (10-15 خط عربي)
4. **تصدير الفيديو** الأساسي

---

## 📞 الدعم والموارد

### Documentation
- [Expo Router](https://expo.github.io/router/introduction)
- [Supabase Docs](https://supabase.com/docs)
- [React Native](https://reactnative.dev)
- [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text)

### المشاكل الشائعة
```
❌ Whisper returns null
→ اختبر الـ API key والـ quota

❌ RLS errors on insert
→ فعّل الـ policy الصحيح على الجدول

❌ Arabic text not displaying
→ استخدم Cairo font من app/assets/fonts

❌ Video upload fails
→ اختبر حجم الملف والـ network
```

---

## التالي: ابدأ نظام المصادقة 🔐

**الملف للقراءة**: [PHASE1_MVP.md](./PHASE1_MVP.md) - اليوم 1-2

**الملفات المطلوبة**:
- `app/screens/LoginScreen.tsx`
- `app/screens/SignupScreen.tsx`
- `app/components/AuthForm.tsx`
- `app/services/auth.ts`

**المخرجات**:
- صفحة login تعمل
- تسجيل جديد يعمل
- الجلسة تُحفظ محلياً
- logout يعمل

---

**آخر تحديث**: 2026-11-08
**الحالة**: جاهز للبدء 🚀
