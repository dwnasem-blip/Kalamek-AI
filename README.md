# WRITEGO - AI Content Creation Platform

تطبيق تجاري احترافي لإنشاء المحتوى بالذكاء الاصطناعي على iOS و Android، مع لوحة تحكم إدارية عبر الويب.

## 🎯 المميزات الرئيسية

### 1. أدوات الكتابة بالذكاء الاصطناعي
- **AI Writer**: توليد المقالات من العناوين والأفكار
- **AI Summarizer**: تلخيص النصوص والملفات
- **AI Rewriter**: إعادة صياغة النصوص بأساليب مختلفة
- **Social Media Content**: محتوى محسّن للمنصات الاجتماعية

### 2. AI Video Studio (قيد التطوير)
تحويل النصوص إلى فيديوهات متحركة احترافية مع:
- شخصيات متحركة
- مزامنة حركة الشفاه والصوت
- دعم اللغات والهجات المتعددة
- محرر بصري للتعديل

### 3. نظام الاشتراكات والأرصدة
- خطة مجانية محدودة
- اشتراكات مدفوعة (Basic, Pro)
- نظام أرصدة منفصل

## 📁 البنية المشروع

```
Kalamek-AI/
├── packages/
│   ├── mobile/      # React Native + Expo (iOS/Android)
│   ├── admin/       # Next.js لوحة التحكم
│   └── shared/      # Shared types & utilities
├── supabase/        # Database & Edge Functions
├── docs/            # التوثيق
└── README.md
```

## 🚀 البدء السريع

### المتطلبات
- Node.js >= 18.0.0
- npm >= 8.0.0
- Expo CLI (للتطوير على الموبايل)

### الإعداد الأولي

```bash
# تثبيت المتطلبات
npm install

# تطوير تطبيق الموبايل
npm run dev

# بناء المشروع
npm run build

# اختبار الشفرة
npm run test
```

## 🔧 البنية التقنية

### تطبيق الموبايل
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **UI**: React Native Paper / Expo Components
- **Database**: Supabase
- **Authentication**: Supabase Auth

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase Edge Functions
- **Storage**: Supabase Storage

### خدمات الذكاء الاصطناعي
- **Text Generation**: OpenAI (GPT-4)
- **Voice Generation**: ElevenLabs
- **Video Generation**: Runway / D-ID
- **Video Processing**: FFmpeg

### لوحة التحكم
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **Charts**: Recharts

## 📊 خريطة الطريق

### المرحلة 0: الإعداد ✅
- ✅ Monorepo structure
- ⏳ React Native + Expo setup
- ⏳ Supabase project setup
- ⏳ Database schema

### المرحلة 1: الأساسيات (الأسبوع 1-2)
- [ ] نظام المصادقة
- [ ] تسجيل جديد وتسجيل دخول
- [ ] الشاشة الرئيسية

### المرحلة 2: الأدوات النصية (الأسبوع 3-4)
- [ ] AI Writer
- [ ] AI Summarizer
- [ ] AI Rewriter
- [ ] Social Media Content

### المرحلة 3: لوحة الإدارة (الأسبوع 5)
- [ ] لوحة المعلومات
- [ ] إدارة المستخدمين

### المرحلة 4: AI Video Studio
- [ ] Video generation pipeline
- [ ] Character selection
- [ ] Scene editor

## 🔐 الأمان

⚠️ **مهم**: لا تخزن مفاتيح API السرية في التطبيق. استخدم:
- Environment variables
- Supabase Edge Functions (للعمليات الحساسة)
- Secure backend API calls

## 📝 ترخيص

جميع الحقوق محفوظة © 2024 WRITEGO

---

**آخر تحديث**: 2026-11-10
