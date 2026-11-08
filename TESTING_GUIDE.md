# 🧪 Kalamek AI - دليل الاختبار الشامل

## البيئة المطلوبة

```bash
✅ FFmpeg (مثبت)
✅ Node.js >= 18
✅ Python 3
✅ OpenAI API Key
```

---

## 🚀 الطريقة 1: اختبار محلي عبر Command Line

### الخطوة 1: إعداد المتطلبات

```bash
# 1. أنشئ ملف .env.local
cp .env.example .env.local

# 2. أضف مفاتيحك
nano .env.local
# ضع:
# OPENAI_API_KEY=sk-...

# 3. ثبّت المكتبات
npm install

# 4. ثبّت ts-node للـ TypeScript execution
npm install -g ts-node
```

### الخطوة 2: هيّئ فيديو اختبار

```bash
# استخدم فيديو موجود أو أنشئ واحد اختباري
mkdir -p ./test-videos

# إذا كان لديك ffmpeg، يمكنك إنشاء فيديو اختبار بسيط:
ffmpeg -f lavfi -i testsrc=size=1920x1080:duration=10 \
       -f lavfi -i sine=frequency=1000:duration=10 \
       -pix_fmt yuv420p \
       ./test-videos/sample.mp4

# أو استخدم أي فيديو موجود لديك
```

### الخطوة 3: اختبر خط الأنابيب الكامل

```bash
# قم بتشغيل Pipeline الكامل:
# 1. استخراج الصوت
# 2. تحويل الكلام لنص (Whisper)
# 3. إنشاء ملف الترجمات
# 4. إضافة الترجمات على الفيديو

npx ts-node scripts/processing-pipeline.ts \
  ./test-videos/sample.mp4 \
  ./output \
  ar
```

**الإخراج المتوقع:**

```
============================================================
🎬 KALAMEK AI - VIDEO PROCESSING PIPELINE
============================================================
Input video: ./test-videos/sample.mp4
Output directory: ./output
============================================================

📹 Getting video information...
   Duration: 10.00s
   Resolution: 1920x1080

▶️  STEP 1: Extract Audio
────────────────────────────────────────────────────────────
🎵 Extracting audio from: ./test-videos/sample.mp4
   Output: ./output/audio.mp3
   Sample rate: 16000Hz
✅ Audio extracted: 0.50MB
✅ Completed in 2.34s

▶️  STEP 2: Transcribe Audio with Whisper
────────────────────────────────────────────────────────────
🎤 Transcribing audio: ./output/audio.mp3
   File size: 0.50MB
   Language: ar
📤 Sending to OpenAI Whisper API...
✅ Transcription received
   Text length: 245 characters
   Language: ar
   Duration: 10.00s
✅ Completed in 15.23s

▶️  STEP 3: Create Subtitle File
────────────────────────────────────────────────────────────
✅ ASS file created: ./output/subtitles.ass
✅ Completed in 0.12s

▶️  STEP 4: Overlay Subtitles on Video
────────────────────────────────────────────────────────────
📝 Overlaying subtitles...
   Video: ./test-videos/sample.mp4
   Subtitles: ./output/subtitles.ass
   Font size: 40
✅ Video with subtitles exported: 15.34MB
✅ Completed in 45.67s

============================================================
✅ PIPELINE COMPLETED SUCCESSFULLY
============================================================

📊 Processing Summary:
   Audio Extraction: 2.34s
   Transcription: 15.23s
   Subtitle Creation: 0.12s
   Video Overlay: 45.67s
   ─────────────────────
   TOTAL TIME: 63.36s

📁 Output Files:
   Video with subtitles: ./output/output_with_subtitles.mp4
   Subtitles file: ./output/subtitles.ass
   Audio file: ./output/audio.mp3
```

---

## 📱 الطريقة 2: اختبار عبر تطبيق Expo

### الخطوة 1: ابدأ Expo Development Server

```bash
# من مجلد المشروع الرئيسي
npm start

# أو للأندرويد بشكل مباشر
npx expo start --android

# أو للـ iOS
npx expo start --ios

# أو للـ Web (للاختبار السريع)
npx expo start --web
```

### الخطوة 2: فتح Testing Screen

بعد تشغيل التطبيق، ستجد شاشة اختبار شاملة تتضمن:

#### 🎬 **Step 1: Select Video**
- اختر فيديو من جهازك
- عرض معلومات الملف (الحجم، المدة)

#### 🎵 **Step 2: Extract Audio**
- استخراج الصوت من الفيديو
- تحويل إلى MP3 بـ 16kHz (محسّن للـ Whisper)

#### 🤖 **Step 3: Transcribe (Whisper API)**
- استدعاء OpenAI Whisper API
- تحويل الكلام العربي لنص
- الحصول على word-level timestamps

#### ⏱️ **Step 4: Word-Level Timing**
- عرض كل كلمة مع توقيتها
- عرض مستوى الثقة (Confidence Score)
- رسم بياني للمزامنة

#### ✏️ **Step 5: Edit Transcript**
- تعديل النص المستخرج
- تصحيح أي أخطاء

#### 🎨 **Step 6: Font Selection & Preview**
- اختبار أحجام الخطوط المختلفة (24, 32, 40, 48)
- معاينة مباشرة على الشاشة
- دعم الخطوط العربية (Cairo)

#### 📹 **Step 7: Export Video**
- تصدير الفيديو النهائي مع الترجمات
- جودات مختلفة (720p, 1080p, 2160p)

---

## 🧪 حالات الاختبار

### حالة 1: استخراج الصوت

```bash
# اختبر استخراج الصوت فقط
npx ts-node << 'EOF'
import { extractAudio } from './app/services/ffmpegService';

(async () => {
  await extractAudio({
    inputPath: './test-videos/sample.mp4',
    outputPath: './output/audio.mp3',
    audioRate: 16000,
  });
})();
EOF
```

**النتائج المتوقعة:**
- ✅ ملف audio.mp3 ينُشأ
- ✅ معلومات الملف تظهر (الحجم، المدة)

---

### حالة 2: Transcription

```bash
# اختبر التحويل لنص فقط
npx ts-node << 'EOF'
import { transcribeAudio } from './app/services/whisperService';

(async () => {
  const result = await transcribeAudio('./output/audio.mp3', {
    language: 'ar',
  });
  console.log('Text:', result.text);
  console.log('Words:', result.words.length);
})();
EOF
```

**النتائج المتوقعة:**
- ✅ نص عربي مستخرج
- ✅ Word timestamps صحيحة
- ✅ Language code: 'ar'

---

### حالة 3: Subtitle Generation

```bash
# اختبر توليد الترجمات
npx ts-node << 'EOF'
import { createAssSubtitles } from './app/services/ffmpegService';

const words = [
  { word: 'السلام', startTimeMs: 0, endTimeMs: 500 },
  { word: 'عليكم', startTimeMs: 500, endTimeMs: 1000 },
];

createAssSubtitles(words, './output/test.ass', {
  fontSize: 40,
  fontColor: 'H00FFFFFF',
  fontName: 'Cairo',
});
EOF
```

**النتائج المتوقعة:**
- ✅ ملف test.ass ينُشأ
- ✅ يحتوي على الكلمات مع التوقيت

---

## 🔧 حل المشاكل الشائعة

### ❌ خطأ: `OPENAI_API_KEY not configured`

**الحل:**
```bash
# تأكد من وجود .env.local
echo "OPENAI_API_KEY=sk-..." > .env.local

# تحقق من وجود المفتاح
grep OPENAI_API_KEY .env.local
```

---

### ❌ خطأ: `ffmpeg command not found`

**الحل:**
```bash
# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg

# Windows
# حمّل من https://ffmpeg.org/download.html
```

---

### ❌ خطأ: `Invalid OpenAI API key`

**الحل:**
```bash
# تأكد من صحة المفتاح
# اذهب إلى https://platform.openai.com/api-keys
# تأكد من تفعيل Whisper API

# اختبر المفتاح
curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.openai.com/v1/models \
     | jq .
```

---

### ❌ خطأ: `File too large (>25MB)`

**الحل:**
```bash
# Whisper API حد أقصى 25MB
# استخدم FFmpeg لضغط الفيديو
ffmpeg -i input.mp4 \
       -vf scale=1280:720 \
       -b:v 2000k \
       -b:a 128k \
       output.mp4
```

---

### ❌ خطأ: `Audio extraction timeout`

**الحل:**
```bash
# أضف timeout أطول
await extractAudio({
  inputPath: './input.mp4',
  outputPath: './audio.mp3',
  timeout: 600000, // 10 دقائق
});
```

---

## 📊 الأداء المتوقع

| الخطوة | الوقت | الملاحظات |
|--------|-------|----------|
| استخراج الصوت | 2-5s | يعتمد على حجم الفيديو |
| Transcription (Whisper) | 10-30s | يعتمد على المدة |
| إنشاء الترجمات | <1s | سريع جداً |
| إضافة الترجمات | 20-60s | يعتمد على الجودة |
| **الإجمالي** | **35-95s** | للفيديو 5 دقائق |

---

## ✅ قائمة تحقق الاختبار

قبل الانتقال لـ Phase 2:

- [ ] FFmpeg مثبت ويعمل
- [ ] OpenAI API Key صحيح
- [ ] استخراج الصوت ينجح
- [ ] Whisper يستخرج النص بصحة
- [ ] الترجمات تُنشأ بنجاح
- [ ] الخطوط العربية تعرض بشكل صحيح
- [ ] الفيديو المُصدَّر يحتوي على الكتابة
- [ ] النص العربي متزامن مع الصوت

---

## 🎯 الخطوة التالية

بعد نجاح جميع الاختبارات:

1. ✅ **دمج مع قاعدة البيانات** (Supabase)
2. ✅ **بناء نظام المصادقة**
3. ✅ **بناء واجهة المشاريع**
4. ✅ **الانتقال للمرحلة 2**

---

## 📞 تحتاج مساعدة؟

```bash
# عرض logs مفصلة
DEBUG=* npm start

# اختبر الاتصال بـ Supabase
npm run test:supabase

# اختبر الاتصال بـ OpenAI
npm run test:openai
```

---

**ملاحظة:** جميع البيانات محلية ولا تُحفظ في قاعدة البيانات حتى الآن. سيتم إضافة التحفظ بعد بناء نظام المصادقة.
