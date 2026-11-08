# 📱 Kalamek AI - تشغيل من الآيفون بدون كمبيوتر

**أنت تملك فقط الآيفون؟ بدون مشكلة! إليك 3 طرق سحابية.**

---

## 📥 الخطوة 0: ثبّت Expo Go (مرة واحدة)

1. افتح **App Store** على الآيفون
2. ابحث عن **Expo Go**
3. اضغط **Get** ثم **Install**

**الرابط المباشر:**
https://apps.apple.com/app/expo-go/id982107779

---

## 🌐 الخيار 1: GitHub Codespaces (الأفضل)

### ✅ المميزات:
- ✅ مجاني 120 ساعة/شهر
- ✅ بيئة كاملة في السحابة
- ✅ QR Code مباشر
- ✅ أسهل طريقة

### الخطوات:

#### 1️⃣ افتح Codespaces

من الآيفون، اذهب إلى:
**https://github.com/dwnasem-blip/Kalamek-AI**

اضغط على:
1. **<> Code** (الزر الأخضر)
2. تاب **Codespaces**
3. **Create codespace on claude/cool-cray-02cd1x**

**انتظر 2-3 دقائق** حتى يحمّل الـ environment

#### 2️⃣ في Codespaces Terminal

بعد فتح البيئة، ستظهر terminal على الشاشة.

اضغط في Terminal وأكتب:

```bash
npm install
```

ثم:

```bash
npx expo start --tunnel
```

#### 3️⃣ اسكان QR Code

ستظهر رسالة مع QR Code:

```
✅ Expo server is running

🍎 iOS app ready at exp://xxx-xxx-xxx.exp.direct

QR Code:
┌─────────────────┐
│                 │
│   [QR CODE]     │ ← اضغط هنا!
│                 │
└─────────────────┘
```

#### 4️⃣ افتح Expo Go وامسح الـ QR Code

1. افتح **Expo Go** على الآيفون
2. اضغط الكاميرا 📷 في الأسفل
3. وجّه الكاميرا للـ QR Code على الشاشة
4. **سيفتح التطبيق مباشرة!** 🎉

---

## 💻 الخيار 2: Replit (بديل سهل)

### ✅ المميزات:
- ✅ بدون تسجيل معقد
- ✅ تشغيل فوري
- ✅ رابط قابل للمشاركة

### الخطوات:

#### 1️⃣ انسخ المشروع على Replit

اذهب إلى: https://replit.com

1. اضغط **Create Replit**
2. اختر **Import from GitHub**
3. الصق: `https://github.com/dwnasem-blip/Kalamek-AI`
4. اضغط **Import**

#### 2️⃣ شغّل من Replit

بعد الفتح:

```bash
npm install
npx expo start --tunnel
```

#### 3️⃣ اسكان QR Code

سيظهر QR Code مباشرة.

---

## ☁️ الخيار 3: Expo Cloud (الرسمي)

### إذا كنت تريد حل رسمي من Expo نفسها:

#### 1️⃣ أنشئ حساب Expo

اذهب إلى: https://expo.dev

اضغط **Sign up** وأنشئ حساب

#### 2️⃣ استخدم EAS Build

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

**لكن هذا يحتاج وقت أطول (15-30 دقيقة)**

---

## 🎯 الطريقة الموصى بها

### استخدم **GitHub Codespaces + Expo Tunnel**

```
GitHub Codespaces  
     ↓  
  npm install  
     ↓  
  npx expo start --tunnel  
     ↓  
  QR Code يظهر  
     ↓  
  اسكان من Expo Go  
     ↓  
  التطبيق يعمل! 🎉
```

---

## 📖 خطوات مفصلة (بالصور)

### الخطوة 1: افتح GitHub

```
1. من الآيفون، افتح Safari
2. اكتب: github.com/dwnasem-blip/Kalamek-AI
3. انتظر تحميل الصفحة
```

### الخطوة 2: افتح Codespaces

```
1. ابحث عن الزر الأخضر <> Code
2. اضغط عليه
3. اختر تاب "Codespaces"
4. اضغط "Create codespace on claude/cool-cray-02cd1x"
```

### الخطوة 3: انتظر الإعداد

```
⏳ 2-3 دقائق
┌─────────────────────┐
│  Setting up...      │
│  ⣿⣿⣿⣿⣿⣿⣿⣿ 50%    │
└─────────────────────┘
```

### الخطوة 4: شغّل الأوامر

```
# انتظر حتى يفتح VS Code
# ثم اضغط على Terminal (أسفل الشاشة)

# أكتب:
npm install

# انتظر حتى ينتهي، ثم:
npx expo start --tunnel
```

### الخطوة 5: اسكان QR Code

```
1. افتح Expo Go من App Store
2. اضغط الكاميرا في الأسفل
3. وجّه الكاميرا للـ QR Code
4. اضغط للفتح
```

---

## 🆘 استكشاف الأخطاء

### ❌ "npm install failed"

**الحل:**
```bash
npm install --legacy-peer-deps
```

---

### ❌ "Cannot find expo"

**الحل:**
```bash
npx expo@latest start --tunnel
```

---

### ❌ "QR Code لا يظهر"

**الحل:**
```bash
# استخدم الرابط بدلاً من QR Code
# ستجد رابط مثل:
# exp://xxx-xxx-xxx.exp.direct

# انسخ الرابط ويمكنك:
# 1. أرسله لنفسك في WhatsApp
# 2. افتحه مباشرة من Safari
# 3. أو ادخله في Expo Go يدويًا
```

---

### ❌ "الاتصال بطيء"

**الحل:**
```bash
# استخدم LAN بدلاً من Tunnel
npx expo start --lan

# لكن هذا يحتاج أن تكون في نفس الـ WiFi
```

---

## 📱 داخل التطبيق

بعد فتح التطبيق على الآيفون، ستجد:

### **Testing Screen** مع 7 خطوات:

1. ✅ اختيار الفيديو
2. ✅ استخراج الصوت
3. ✅ Transcription (Whisper)
4. ✅ عرض الكلمات
5. ✅ تحرير النص
6. ✅ معاينة الخطوط
7. ✅ تصدير الفيديو

**ملاحظة:** بعض الميزات (مثل Whisper) قد تحتاج إلى OpenAI API Key
في `.env.local`

---

## 🔄 إعادة تحميل التطبيق

إذا عملت تغييرات على الكود:

1. **من Codespaces:** احفظ الملف (Ctrl+S)
2. **التطبيق سيحدّث تلقائياً** على الآيفون
3. أو اضغط **R** في terminal لإعادة تحميل

---

## 💾 حفظ التعديلات

إذا أردت حفظ التعديلات للمستقبل:

1. في Codespaces، افتح Terminal
2. اضغط **Ctrl+C** لإيقاف Expo
3. اضغط الزر الأزرق **Commit** على اليسار
4. اكتب رسالة مثل: "My changes"
5. اضغط **Commit**

---

## 🎯 الملخص

| الخيار | السهولة | السرعة | التكلفة |
|--------|--------|-------|--------|
| Codespaces | ⭐⭐⭐⭐⭐ | سريع | مجاني |
| Replit | ⭐⭐⭐⭐ | سريع | مجاني |
| Expo Cloud | ⭐⭐⭐ | بطيء | مجاني |

**التوصية:** استخدم **GitHub Codespaces** - الأسهل والأسرع

---

## 📞 معلومات مفيدة

### روابط سريعة:

- **Expo Go**: https://apps.apple.com/app/expo-go/id982107779
- **GitHub المشروع**: https://github.com/dwnasem-blip/Kalamek-AI
- **GitHub Codespaces**: https://github.com/codespaces
- **Expo الرسمية**: https://expo.dev

### أوامر مهمة:

```bash
# تشغيل عادي (في نفس الشبكة)
npx expo start

# تشغيل مع Tunnel (من أي مكان)
npx expo start --tunnel

# تشغيل LAN (WiFi فقط)
npx expo start --lan

# تشغيل Web للاختبار السريع
npx expo start --web
```

---

## ✅ تم! 🎉

الآن يمكنك تشغيل Kalamek AI من الآيفون بدون كمبيوتر!

**اختر الخيار الأول (GitHub Codespaces) وابدأ الآن:**

👉 **https://github.com/dwnasem-blip/Kalamek-AI**

---

**ملاحظة:** إذا واجهت أي مشكلة، اترك رسالة هنا وسأساعدك فوراً! 💪
