# Kalamek AI - المرحلة 1: MVP (الأسبوع 1-2)

## الهدف
بناء نسخة أساسية من التطبيق تتضمن:
1. ✅ تسجيل الدخول والمصادقة
2. ✅ رفع الفيديو
3. ✅ استخراج الكلام بـ Whisper API
4. ✅ عرض النص المستخرج
5. ✅ حفظ المشاريع

---

## الأسبوع 1: الأساسيات

### اليوم 1: الإعداد الأولي
```
[X] تثبيت المكتبات الأساسية
[X] إعداد Supabase
[X] تصميم قاعدة البيانات
[ ] إعداد Expo environment
[ ] اختبار الاتصالات
```

**المخرجات:**
- `package.json` مع المكتبات اللازمة
- `supabase/migrations/001_initial_schema.sql`
- متغيرات البيئة محفوظة

---

### اليوم 2: نظام المصادقة

**الملفات المطلوبة:**
```
app/
├── services/
│   └── supabase.ts           # Supabase client initialization
├── services/
│   └── auth.ts               # Authentication logic
├── store/
│   └── authStore.ts          # Auth state management (Zustand)
├── screens/
│   ├── LoginScreen.tsx       # Login UI
│   ├── SignupScreen.tsx      # Registration UI
│   └── ForgotPasswordScreen.tsx # Password recovery
├── components/
│   └── AuthForm.tsx          # Reusable form component
└── types/
    └── auth.ts               # Type definitions
```

**الميزات:**
- [ ] Email/Password registration
- [ ] Email verification
- [ ] Login
- [ ] Password reset
- [ ] Session persistence
- [ ] Logout

**الاختبارات:**
```bash
npm run test:supabase
# اختبر أن الاتصال يعمل والـ users table محفوظ
```

---

### اليوم 3: واجهة المشاريع الأساسية

**الملفات المطلوبة:**
```
app/
├── screens/
│   ├── HomeScreen.tsx        # List of projects
│   ├── ProjectDetailScreen.tsx # Project view
│   └── NewProjectScreen.tsx   # Create new project
├── components/
│   ├── ProjectCard.tsx       # Project card component
│   ├── ProjectList.tsx       # Projects list
│   └── LoadingSpinner.tsx    # Loading indicator
└── services/
    └── projectService.ts     # Project API calls
```

**الميزات:**
- [ ] عرض جميع المشاريع
- [ ] إنشاء مشروع جديد
- [ ] حذف مشروع
- [ ] تعديل عنوان المشروع
- [ ] Infinite scroll loading
- [ ] Search & filter

---

### اليوم 4: رفع الفيديو

**الملفات المطلوبة:**
```
app/
├── screens/
│   └── UploadScreen.tsx      # Upload interface
├── components/
│   ├── VideoUploader.tsx     # Upload component
│   ├── VideoPreview.tsx      # Video preview
│   └── UploadProgress.tsx    # Progress indicator
└── services/
    └── storageService.ts     # File upload logic
```

**الميزات:**
- [ ] اختيار فيديو من المكتبة
- [ ] معاينة الفيديو
- [ ] عرض حجم الملف
- [ ] شريط تقدم الرفع
- [ ] التعامل مع الأخطاء
- [ ] إلغاء الرفع
- [ ] التحقق من الحد الأقصى حسب الخطة

**قيود:**
```
Free: 10 MB, 10 دقائق
Pro: 500 MB, 120 دقيقة
Creator: 2 GB, 300 دقيقة
```

---

### اليوم 5: ربط Whisper API

**الملفات المطلوبة:**
```
app/
├── services/
│   └── whisperService.ts     # Whisper API integration
├── utils/
│   └── audioProcessing.ts    # Audio utilities
└── types/
    └── transcript.ts         # Transcript types
```

**الميزات:**
- [ ] إرسال الفيديو إلى Whisper
- [ ] استقبال word-level timestamps
- [ ] حفظ في قاعدة البيانات
- [ ] التعامل مع الأخطاء
- [ ] إعادة المحاولة التلقائية

**المعالجة:**
```
Original Video
    ↓
Extract Audio (FFmpeg)
    ↓
Send to OpenAI Whisper
    ↓
Receive: { text, words: [{ word, start_ms, end_ms, confidence }] }
    ↓
Store in Database
    ↓
Notify UI
```

---

## الأسبوع 2: العرض والتصدير

### اليوم 6: عرض النص

**الملفات المطلوبة:**
```
app/
├── screens/
│   └── EditorScreen.tsx      # Main editor screen
├── components/
│   ├── TranscriptViewer.tsx  # Display transcript
│   ├── WordHighlighter.tsx   # Highlight current word
│   └── VideoPlayer.tsx       # Video + subtitle sync
└── services/
    └── syncService.ts        # Sync timing logic
```

**الميزات:**
- [ ] عرض النص كاملاً
- [ ] تشغيل الفيديو مع النص
- [ ] تزامن الكلمات مع الصوت
- [ ] البحث في النص
- [ ] نسخ النص

---

### اليوم 7: تحرير النص الأساسي

**الملفات المطلوبة:**
```
app/
├── components/
│   ├── TextEditor.tsx        # Edit transcript
│   ├── WordTiming.tsx        # Edit word timing
│   └── WordSelector.tsx      # Select word to edit
└── utils/
    └── textProcessing.ts     # Text manipulation
```

**الميزات:**
- [ ] تعديل النص
- [ ] تصحيح الأخطاء الإملائية
- [ ] تعديل توقيت الكلمات يدويًا
- [ ] Undo/Redo
- [ ] حفظ التعديلات

---

### اليوم 8: حفظ وإدارة المشاريع

**الملفات المطلوبة:**
```
app/
├── services/
│   └── projectService.ts     # Update with save logic
└── store/
    └── projectStore.ts       # Project state management
```

**الميزات:**
- [ ] حفظ تلقائي كل 30 ثانية
- [ ] حفظ يدوي
- [ ] عرض آخر وقت حفظ
- [ ] التعامل مع حالات الفشل
- [ ] استعادة المسودات المحفوظة

---

## الاختبارات

### Unit Tests
```bash
npm run test
```

**ملفات الاختبار:**
```
app/
├── services/__tests__/
│   ├── supabase.test.ts
│   ├── auth.test.ts
│   └── whisper.test.ts
└── utils/__tests__/
    └── formatting.test.ts
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing Checklist
- [ ] التسجيل والدخول
- [ ] رفع فيديو
- [ ] استقبال النص من Whisper
- [ ] عرض النص بشكل صحيح
- [ ] حفظ المشروع
- [ ] إغلاق التطبيق وإعادة فتحه
- [ ] استرجاع المشروع السابق

---

## معايير الجودة

### Performance ⚡
- [ ] Screen load time < 2 seconds
- [ ] Upload smooth even on 3G
- [ ] No memory leaks
- [ ] Battery usage minimal

### UI/UX 🎨
- [ ] نص عربي يعرض بشكل صحيح
- [ ] التطبيق responsive على جميع الأحجام
- [ ] Loading states واضحة
- [ ] Error messages مفيدة

### Security 🔒
- [ ] لا توجد API keys في الكود
- [ ] RLS مفعّل على قاعدة البيانات
- [ ] الجلسات محمية
- [ ] HTTPS فقط

---

## المتطلبات البيئية

```bash
# تثبيت المكتبات
npm install

# اختبر الاتصالات
npm run test:supabase
npm run test:openai

# تشغيل التطبيق
npm start
```

---

## المشاكل المتوقعة والحلول

| المشكلة | الحل |
|--------|------|
| Whisper API rate limiting | استخدم queue system |
| Video upload timeout | Chunked upload |
| Memory issues with large videos | Stream processing |
| RTL text display issues | Use proper styling |
| Time sync problems | Implement time adjustment UI |

---

## المخرجات النهائية

### ملفات يجب أن تكون جاهزة:
```
✅ package.json
✅ tsconfig.json
✅ app.json
✅ supabase/migrations/001_initial_schema.sql
✅ app/services/supabase.ts
✅ app/services/auth.ts
✅ app/services/whisper.ts
✅ app/screens/LoginScreen.tsx
✅ app/screens/HomeScreen.tsx
✅ app/screens/UploadScreen.tsx
✅ app/screens/EditorScreen.tsx
✅ app/store/authStore.ts
✅ app/store/projectStore.ts
```

### قاعدة البيانات:
```
✅ users table
✅ projects table
✅ transcripts table
✅ transcript_words table
✅ captions table (للمرحلة القادمة)
```

### الوظائف الأساسية:
```
✅ التسجيل والدخول
✅ رفع الفيديو
✅ استخراج الكلام
✅ عرض النص
✅ حفظ المشاريع
```

---

## الانتقال للمرحلة 2

بعد انتهاء MVP:
1. اختبر على جهاز حقيقي
2. احل أي bugs
3. استقبل feedback
4. ابدأ المرحلة 2: محرر الفيديو والخطوط

