# AI Video Studio Skill

## نطاق المهارة
بناء نظام متكامل لتحويل النصوص إلى فيديوهات متحركة احترافية مع شخصيات، أصوات، وحركات.

## المكونات الرئيسية

### 1. معالج السيناريو (Script Processing)
تحويل النص الخام إلى سيناريو منظم:

```typescript
interface ScriptScene {
  sceneNumber: number;
  duration: number; // ثانية
  narrationText: string;
  character: Character;
  visuals: Visual[];
  actionDescription: string;
}

// مثال:
// النص: "النمل مجتمعات منظمة جداً"
// السيناريو:
// - Scene 1: شخصية تتحدث عن النمل
// - Scene 2: عرض صور النمل
// - Scene 3: شرح منظمة النمل
```

### 2. إدارة الشخصيات (Character Management)

```typescript
interface Character {
  id: string;
  name: string;
  type: 'teacher' | 'student' | 'robot' | 'cartoon' | 'avatar';
  avatar_url: string;
  voice_id: string;
  expressions: Expression[];
  animations: Animation[];
}

// الشخصيات المتاحة:
// - معلم (الأزرق)
// - معلمة (الوردي)
// - شاب (البني)
// - فتاة (الأحمر)
// - روبوت (الفضي)
// - شخصيات كرتونية
// - شخصيات افتراضية واقعية
```

### 3. نظام الأصوات (Voice System)

```typescript
interface VoiceProfile {
  id: string;
  language: 'ar' | 'en' | 'fr' | 'es';
  dialect: 'fus' | 'ems' | 'msr' | 'syr' | 'khg' | 'irq';
  provider: 'elevenlabs' | 'google' | 'azure';
  voice_id: string;
  gender: 'male' | 'female';
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry';
}

// اللهجات:
// - فصحى (fus) - Fusha
// - إماراتية (ems) - Emirates
// - مصرية (msr) - Egyptian
// - شامية (syr) - Levantine
// - خليجية (khg) - Gulf
// - عراقية (irq) - Iraqi
```

### 4. الحركات والتعبيرات (Animations)

```typescript
interface Animation {
  name: string;
  type: 'idle' | 'talk' | 'gesture' | 'expression';
  duration: number;
  curve: 'easeIn' | 'easeOut' | 'linear';
}

// أنواع الحركات:
// - الهدوء (Idle) - الشخصية تنظر للأمام
// - الكلام (Talk) - حركة الفم مع الصوت
// - الإيماءات (Gesture) - حركات اليد
// - التعبيرات (Expression) - تغيير الوجه
```

### 5. عناصر بصرية (Visuals)

```typescript
interface Visual {
  type: 'image' | 'infographic' | 'animation' | 'text';
  url?: string;
  content?: string;
  duration: number;
  position: 'left' | 'center' | 'right' | 'full';
  transition: 'fade' | 'slide' | 'zoom';
}

// أنواع العناصر:
// - صور
// - رسوم توضيحية
// - رسومات متحركة
// - نصوص وكلمات رئيسية
```

## المراحل التقنية

### المرحلة 1: تحويل النص إلى سيناريو
```
النص الخام
    ↓
OpenAI API (تقسيم المشاهد)
    ↓
Structured Script
    ↓
Generate Scene Description
```

### المرحلة 2: اختيار الموارد
```
Script Scenes
    ↓
Character Selection
    ↓
Voice Assignment
    ↓
Visual Planning
```

### المرحلة 3: توليد الصوت
```
Narration Text
    ↓
ElevenLabs API
    ↓
Audio Files
    ↓
Lip Sync Data
```

### المرحلة 4: توليد الحركات
```
Character + Audio
    ↓
Runway/D-ID API
    ↓
Animated Video
    ↓
Lip-synced Video
```

### المرحلة 5: المعالجة والتجميع
```
Videos + Visuals + Audio
    ↓
FFmpeg Processing
    ↓
Scene Composition
    ↓
Final Video Output
```

## واجهة المحرر

### مراحل العملية
```
1. إدخال النص
2. تقسيم المشاهد
3. اختيار الشخصية
4. تعيين الأصوات واللهجات
5. اختيار الرسومات
6. معاينة المشاهد
7. توليد الفيديو
8. تحميل النتيجة
```

### عناصر المحرر

#### Scene List
```typescript
// عرض جميع المشاهد
// مع إمكانية:
// - إعادة ترتيب المشاهد
// - حذف مشهد
// - تعديل نص المشهد
// - تغيير مدة المشهد
```

#### Character Selector
```typescript
// اختيار شخصية لكل مشهد
// معاينة الشخصية
// تخصيص الملابس/الألوان
// اختيار تعبيرات الوجه
```

#### Voice Configuration
```typescript
// اختيار اللغة
// اختيار اللهجة
// اختيار الجنس والعمر
// معاينة الصوت
```

#### Media Library
```typescript
// صور وخلفيات
// رسوم توضيحية
// رموز وأيقونات
// مقاطع فيديو قصيرة
```

## أمثلة عملية

### مثال 1: فيديو تعليمي
```
النص: "شرح عملية التمثيل الضوئي"

السيناريو:
1. مشهد 1: معلم يحيي المشاهدين
2. مشهد 2: شرح العملية مع رسوم توضيحية
3. مشهد 3: عرض صور نباتات حقيقية
4. مشهد 4: ملخص العملية
5. مشهد 5: شكر المشاهدين

المخرجات:
- فيديو 2-3 دقائق
- بدقة 1080p
- ترجمة مكتوبة
- موسيقى خلفية
```

### مثال 2: فيديو إعلاني
```
النص: "منتج جديد - وصف المميزات"

السيناريو:
1. مشهد 1: عرض المنتج
2. مشهد 2: الميزة الأولى
3. مشهد 3: الميزة الثانية
4. مشهد 4: العرض الخاص
5. مشهد 5: Call-to-action

المخرجات:
- فيديو 30-60 ثانية
- جودة عالية
- موسيقى ديناميكية
- نصوص جذابة
```

## أفضل الممارسات

✅ **افعل**
- استخدم سيناريوهات منظمة
- اختبر تزامن الفم مع الصوت
- استخدم انتقالات سلسة بين المشاهد
- أضف ترجمة للفيديوهات
- احفظ المسودات قبل التوليد

❌ **لا تفعل**
- لا تستخدم كثير شخصيات مختلفة
- لا تجعل المشاهد طويلة جداً
- لا تتجاهل الترجمة
- لا تستخدم نصوص معقدة جداً
- لا تنسى اختبار الفيديو النهائي

## الموارد

- [Runway AI](https://runwayml.com)
- [D-ID](https://www.d-id.com)
- [ElevenLabs](https://elevenlabs.io)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

---

**آخر تحديث**: 2026-11-10
