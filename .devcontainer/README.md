# 🚀 Kalamek AI - Mobile Development

**مرحباً بك في بيئة Codespaces!**

هذه البيئة معدّة لتشغيل Kalamek AI على الآيفون من خلال Expo Go.

---

## ⚡ البدء السريع (30 ثانية)

### 1. شغّل الأوامر التالية:

```bash
npm install
npx expo start --tunnel
```

### 2. اسكان QR Code من Expo Go

**الخطوات:**
1. افتح **Expo Go** على الآيفون
2. اضغط الكاميرا 📷
3. وجّه للـ QR Code على الشاشة
4. اضغط للفتح

---

## 📱 الخيارات

### خيار 1: Tunnel (يعمل من أي مكان)
```bash
npm run mobile
```
**يعطيك QR Code يعمل من أي مكان في العالم**

### خيار 2: LAN (أسرع - نفس الشبكة)
```bash
npm run mobile:lan
```
**أسرع لكن تحتاج أن تكون في نفس WiFi**

### خيار 3: Web (للاختبار السريع)
```bash
npm start -- --web
```
**يفتح في المتصفح بدلاً من الهاتف**

---

## 🧪 الاختبار المحلي

### اختبر معالجة الفيديو:
```bash
npm run pipeline test-videos/sample.mp4 ./output ar
```

### جرّب Demo التفاعلي:
```bash
npm run demo
```

### اختبر الاتصالات:
```bash
npm run test:supabase
npm run test:openai
```

---

## 📁 الملفات المهمة

- `app/screens/TestingScreen.tsx` - واجهة الاختبار الرئيسية
- `app/services/ffmpegService.ts` - معالجة الفيديو
- `app/services/whisperService.ts` - تحويل الكلام
- `.env.local` - متغيرات البيئة (أضف OPENAI_API_KEY)

---

## 🔑 إضافة API Keys

لتفعيل جميع الميزات، أضف في `.env.local`:

```
OPENAI_API_KEY=sk-...
```

احصل على المفتاح من: https://platform.openai.com/api-keys

---

## 🆘 حل المشاكل

### ❌ npm install failed
```bash
npm install --legacy-peer-deps
```

### ❌ لا يظهر QR Code
جرّب:
```bash
npx expo@latest start --tunnel
```

### ❌ الاتصال بطيء
استخدم LAN بدلاً من Tunnel:
```bash
npm run mobile:lan
```

---

## 💡 نصائح

1. **إعادة التحميل**: اضغط **R** في Terminal لإعادة تحميل التطبيق
2. **حفظ التعديلات**: Ctrl+S يحفظ والتطبيق يحدّث تلقائياً
3. **الأخطاء**: انظر في Terminal للأخطاء المفصلة

---

## 📞 المساعدة

**اقرأ الدليل الكامل:**
[IPHONE_SETUP.md](../IPHONE_SETUP.md)

---

**استمتع بالتطوير! 🎉**
