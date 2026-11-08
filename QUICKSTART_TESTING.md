# 🚀 Kalamek AI - دليل البدء السريع للاختبار

**هذا الدليل يشرح كيفية اختبار الميزات الأساسية للتطبيق محلياً قبل بناء الواجهات الكاملة.**

---

## ✅ المتطلبات (2 دقيقة)

```bash
# تحقق من أن كل هذا موجود:
ffmpeg -version      # FFmpeg
node --version       # Node.js >= 18
npm --version        # npm
python3 --version    # Python 3
```

---

## 🔑 الخطوة 1: إعداد مفاتيح API (5 دقائق)

### احصل على OpenAI API Key

1. اذهب إلى: https://platform.openai.com/api-keys
2. اضغط "Create new secret key"
3. انسخ المفتاح

### أنشئ `.env.local`

```bash
cp .env.example .env.local

# افتح .env.local وأضف:
OPENAI_API_KEY=sk-...
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  # اختياري الآن
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...           # اختياري الآن
```

---

## 📦 الخطوة 2: تثبيت المكتبات (3 دقائق)

```bash
npm install

# ثبّت ts-node للـ TypeScript
npm install -g ts-node
```

---

## 🎥 الخطوة 3: جهّز فيديو اختبار (5 دقائق)

### اختيار 1: استخدم فيديو موجود

```bash
# انسخ أي فيديو لديك إلى مجلد test-videos
mkdir -p test-videos
cp ~/Downloads/your-video.mp4 test-videos/
```

### اختيار 2: أنشئ فيديو اختبار بـ FFmpeg

```bash
mkdir -p test-videos

# فيديو 10 ثوان مع صوت
ffmpeg -f lavfi -i testsrc=size=1920x1080:duration=10 \
       -f lavfi -i sine=frequency=1000:duration=10 \
       -pix_fmt yuv420p \
       test-videos/sample.mp4

echo "✅ Created: test-videos/sample.mp4"
```

---

## 🚀 الخطوة 4: قم بتشغيل الاختبار الكامل

### الطريقة A: سطر أوامر (Command Line) - الأسرع

```bash
# اختبر خط الأنابيب الكامل:
npm run pipeline test-videos/sample.mp4 ./output ar

# النتيجة: فيديو مع ترجمات في ./output/output_with_subtitles.mp4
```

**الوقت المتوقع:** 60-90 ثانية

**الإخراج:**

```
============================================================
🎬 KALAMEK AI - VIDEO PROCESSING PIPELINE
============================================================

▶️  STEP 1: Extract Audio
✅ Audio extracted: 0.50MB
✅ Completed in 2.34s

▶️  STEP 2: Transcribe Audio with Whisper
🎤 Transcribing audio...
✅ Completed in 15.23s

▶️  STEP 3: Create Subtitle File
✅ ASS file created

▶️  STEP 4: Overlay Subtitles on Video
📝 Overlaying subtitles...
✅ Video exported: 15.34MB
✅ Completed in 45.67s

✅ PIPELINE COMPLETED SUCCESSFULLY
```

---

### الطريقة B: تطبيق Expo Interactive - الأفضل للاختبار الشامل

```bash
# ابدأ Expo
npm start

# اختر:
# - Ctrl+A للـ Android emulator
# - Ctrl+I للـ iOS simulator
# - Ctrl+W للـ Web browser

# ستظهر شاشة Testing محسّنة مع:
# ✅ اختيار الفيديو
# ✅ عرض المعلومات
# ✅ زر للاستخراج والـ Transcription
# ✅ عرض الكلمات والتوقيت
# ✅ تحرير النص
# ✅ معاينة الخطوط العربية
```

---

## 🎯 اختبر كل ميزة على حدة

### 1️⃣ استخراج الصوت فقط

```bash
npx ts-node << 'EOF'
import { extractAudio } from './app/services/ffmpegService';

(async () => {
  console.log('🎵 Extracting audio...');
  await extractAudio({
    inputPath: './test-videos/sample.mp4',
    outputPath: './output/audio.mp3',
  });
  console.log('✅ Done! Check ./output/audio.mp3');
})();
EOF
```

---

### 2️⃣ اختبر Whisper Transcription

```bash
npx ts-node << 'EOF'
import { transcribeAudio } from './app/services/whisperService';

(async () => {
  console.log('🤖 Transcribing...');
  const result = await transcribeAudio('./output/audio.mp3', {
    language: 'ar',
  });
  console.log('📝 Text:', result.text);
  console.log('🔤 Words:', result.words.length);
  console.log('⏱️  First 3 words:');
  result.words.slice(0, 3).forEach(w => {
    console.log(`   "${w.word}": ${w.startTimeMs}ms - ${w.endTimeMs}ms`);
  });
})();
EOF
```

---

### 3️⃣ اختبر توليد الترجمات

```bash
npx ts-node << 'EOF'
import { createAssSubtitles } from './app/services/ffmpegService';

const words = [
  { word: 'السلام', startTimeMs: 0, endTimeMs: 500 },
  { word: 'عليكم', startTimeMs: 500, endTimeMs: 1000 },
  { word: 'ورحمة', startTimeMs: 1000, endTimeMs: 1500 },
  { word: 'الله', startTimeMs: 1500, endTimeMs: 2000 },
];

createAssSubtitles(words, './output/test.ass', {
  fontSize: 40,
  fontColor: 'H00FFFFFF',
  fontName: 'Cairo',
});

console.log('✅ Subtitle file created: ./output/test.ass');
EOF
```

---

### 4️⃣ اختبر Demo Interactive

```bash
# Run demo مع خطوات تفاعلية
npm run demo

# سيطلب منك:
# 1. أدخل مسار الفيديو
# 2. يعرض معلومات الفيديو
# 3. استخراج الصوت
# 4. Transcription
# 5. خيار تحرير النص
# 6. اختيار حجم الخط
# 7. معاينة
```

---

## 📊 النتائج المتوقعة

بعد تشغيل Pipeline:

```
./output/
├── audio.mp3                    # الصوت المستخرج
├── subtitles.ass                # ملف الترجمات (ASS format)
└── output_with_subtitles.mp4    # الفيديو النهائي مع الكتابة
```

### فحص النتائج

```bash
# شغّل الفيديو النهائي
# macOS
open ./output/output_with_subtitles.mp4

# Linux
vlc ./output/output_with_subtitles.mp4

# Windows
start ./output/output_with_subtitles.mp4
```

**يجب أن ترى:**
- ✅ النص العربي يظهر على الفيديو
- ✅ الكتابة متزامنة مع الصوت
- ✅ حجم الخط مقروء
- ✅ النص يظهر في أسفل الشاشة

---

## 🔧 استكشاف الأخطاء

### ❌ "OPENAI_API_KEY not configured"

```bash
# تأكد من .env.local موجود
ls -la .env.local

# تأكد من المفتاح صحيح
grep OPENAI_API_KEY .env.local

# إذا فارغ، أضفه:
echo "OPENAI_API_KEY=sk-..." >> .env.local
```

---

### ❌ "ffmpeg command not found"

```bash
# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg

# Windows
# حمّل من https://ffmpeg.org/download.html
```

---

### ❌ "File not found"

```bash
# تأكد من مسار الفيديو صحيح
ls -la test-videos/

# يجب أن تراه:
# test-videos/sample.mp4
```

---

### ❌ "Timeout exceeded"

```bash
# الفيديو قد يكون كبير جداً (>25MB لـ Whisper)
# استخدم FFmpeg لضغطه:
ffmpeg -i input.mp4 \
       -vf scale=1280:720 \
       -b:v 2000k \
       -b:a 128k \
       output.mp4
```

---

## ⏱️ الأداء المتوقع

| الخطوة | الوقت |
|--------|-------|
| استخراج الصوت | 2-5 ثوان |
| Transcription (Whisper) | 10-30 ثانية |
| إنشاء الترجمات | <1 ثانية |
| إضافة الترجمات للفيديو | 20-60 ثانية |
| **الإجمالي** | **35-95 ثانية** |

*المدة تعتمد على حجم الفيديو وسرعة الإنترنت*

---

## ✅ قائمة تحقق النجاح

قبل الانتقال للمرحلة التالية:

- [ ] FFmpeg مثبت ويعمل
- [ ] OpenAI API Key صحيح وفعّال
- [ ] Extraction يعمل (audio.mp3 ينُشأ)
- [ ] Whisper يعمل (نص عربي يظهر)
- [ ] Subtitles تُنشأ (subtitles.ass موجود)
- [ ] الفيديو النهائي يحتوي على الكتابة
- [ ] النص متزامن مع الصوت

---

## 🎬 بعد النجاح: الخطوة التالية

بمجرد أن تنجح جميع الاختبارات:

1. ✅ **بناء نظام المصادقة** (Login/Signup)
2. ✅ **بناء واجهة المشاريع** (Project Management)
3. ✅ **دمج مع Supabase**
4. ✅ **الانتقال للمرحلة 2**

---

## 📚 المراجع السريعة

- **FFmpeg Docs**: https://ffmpeg.org/documentation.html
- **OpenAI Whisper**: https://platform.openai.com/docs/guides/speech-to-text
- **ASS Subtitle Format**: https://en.wikipedia.org/wiki/SubStation_Alpha
- **Our Testing Guide**: `./TESTING_GUIDE.md`

---

## 🎯 الملخص

```bash
# 3 أوامر فقط لاختبار كل شيء:

# 1. إعداد المفاتيح (مرة واحدة)
echo "OPENAI_API_KEY=sk-..." > .env.local

# 2. تثبيت المكتبات (مرة واحدة)
npm install

# 3. اختبر الـ Pipeline
npm run pipeline test-videos/sample.mp4 ./output ar
```

**وخلاص! 🎉**

---

**ملاحظة:** جميع الملفات محلية الآن. بعد النجاح، سنبدأ بـ بناء الواجهات والتكامل مع Supabase.

**هل تحتاج مساعدة؟** اختبر بـ `npm run demo` لتجربة تفاعلية خطوة بخطوة.
