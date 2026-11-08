# Kalamek AI - دليل الإعداد 🚀

## المرحلة 1: الإعداد الأساسي

### 1. إنشاء حساب Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل حساب جديد
3. أنشئ project جديد:
   - **Project Name**: `Kalamek-AI`
   - **Database Password**: احفظ كلمة المرور بأمان
   - **Region**: اختر الأقرب لمنطقتك (مثلاً `eu-west-1`)

4. بعد إنشاء المشروع:
   - اذهب إلى **Settings > API**
   - احفظ:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

### 2. تطبيق Migration قاعدة البيانات

```bash
# تثبيت Supabase CLI
brew install supabase/tap/supabase

# أو للينكس
curl -fsSL https://cli.supabase.io/install.sh | sh

# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref <your_project_ref>

# تطبيق الـ migrations
supabase migration up
```

### 3. إعداد OpenAI API

1. اذهب إلى [platform.openai.com](https://platform.openai.com)
2. أنشئ API key جديد
3. احفظ: `OPENAI_API_KEY`

### 4. إنشاء متغيرات البيئة

#### `.env.local` (للتطوير المحلي - **لا تضفه للـ git**)
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI
OPENAI_API_KEY=sk-...

# App Settings
EXPO_PUBLIC_API_ENVIRONMENT=development
```

#### `.env.example` (للتوثيق - يُضاف للـ git)
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=<your_supabase_url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>

# OpenAI
OPENAI_API_KEY=<your_openai_api_key>

# App Settings
EXPO_PUBLIC_API_ENVIRONMENT=development
```

### 5. تثبيت المتطلبات

```bash
cd /home/user/Kalamek-AI

# تثبيت npm dependencies
npm install

# أو للـ yarn
yarn install
```

---

## المرحلة 2: بنية المشروع

### بنية الملفات
```
Kalamek-AI/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── config.toml
├── app/
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── UploadScreen.tsx
│   │   └── EditorScreen.tsx
│   ├── components/
│   │   ├── VideoUploader.tsx
│   │   ├── TranscriptViewer.tsx
│   │   └── CaptionEditor.tsx
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── whisper.ts
│   │   └── videoExport.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── projectStore.ts
│   ├── utils/
│   │   ├── formatting.ts
│   │   ├── arabic.ts
│   │   └── validation.ts
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   ├── app.json
│   ├── app.tsx
│   └── package.json
├── fonts/
│   ├── metadata.json
│   └── [fonts files]
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

---

## المرحلة 3: إعداد التطبيق

### الخطوة 1: تثبيت Expo CLI

```bash
npm install -g expo-cli

# أو استخدم npx
npx expo --version
```

### الخطوة 2: إنشاء Expo Project

```bash
cd /home/user/Kalamek-AI/app
npx create-expo-app . --template

# أو إذا كان موجوداً:
npx expo install expo-router
npx expo install react-native
```

### الخطوة 3: تثبيت المكتبات الأساسية

```bash
npm install

# للتطوير
npm install -D typescript @types/react @types/react-native
```

---

## المرحلة 4: اختبار الاتصالات

### اختبر Supabase
```bash
npm run test:supabase
```

### اختبر OpenAI
```bash
npm run test:openai
```

### اختبر التطبيق المحلي
```bash
npm start
```

---

## ملاحظات أمان مهمة ⚠️

1. **لا تضع API keys في الكود** - استخدم `.env.local`
2. **لا تضف `.env.local` للـ git** - أضفه لـ `.gitignore`
3. **استخدم Supabase Service Role فقط على الـ Backend**
4. **استخدم Anon Key على الـ Frontend** (محدودة الصلاحيات)
5. **فعّل RLS على جميع الجداول**
6. **استخدم HTTPS فقط في Production**

---

## الخطوات التالية

بعد الانتهاء من الإعداد الأساسي:
1. [إنشاء نظام المصادقة](./PHASE1_AUTH.md)
2. [بناء واجهة رفع الفيديو](./PHASE1_UPLOAD.md)
3. [ربط OpenAI Whisper](./PHASE1_WHISPER.md)

---

**تحديث**: 2026-11-08
