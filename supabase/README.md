# Supabase Configuration

هذا المجلد يحتوي على إعدادات قاعدة بيانات Supabase للمشروع.

## 📋 محتويات المجلد

### `migrations/`
- `001_initial_schema.sql`: Schema قاعدة البيانات الأولي
  - Profiles (المستخدمون)
  - Projects (المشاريع)
  - Generated content (المقالات، الملخصات، إعادة الصياغة)
  - Videos (مشاريع الفيديو والمشاهد)
  - Characters & Voices (الشخصيات والأصوات)
  - Credits & Subscriptions (الأرصدة والاشتراكات)

### `functions/`
Edge Functions التي تعمل على backend Supabase

### `policies/`
RLS (Row Level Security) policies لحماية البيانات

## 🚀 الإعداد الأولي

### 1. إنشاء مشروع Supabase
```bash
# قم بزيارة https://supabase.com
# أنشئ مشروع جديد
# احفظ الـ URL و Anon Key
```

### 2. تطبيق Schema
```bash
# اذهب إلى Supabase Dashboard
# SQL Editor
# انسخ محتوى migrations/001_initial_schema.sql
# نفذها
```

### 3. إضافة متغيرات البيئة
في الملف `.env` (على الموبايل):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔐 الأمان

### Row Level Security (RLS)
جميع الجداول مفعل عليها RLS:
- ✅ Users يرون فقط بياناتهم الخاصة
- ✅ Projects محمية حسب مالك المشروع
- ✅ Credits و Subscriptions محمية

### مفاتيح API
- **ANON KEY**: للعمليات العامة (auth, read)
- **SERVICE ROLE KEY**: للعمليات الحساسة فقط (Edge Functions)

⚠️ لا تضع SERVICE ROLE KEY في التطبيق الموبايل

## 📊 هيكل البيانات

```
auth.users (من Supabase Auth)
    ↓
profiles (المستخدمين)
    ├── projects (المشاريع)
    │   ├── generated_articles
    │   ├── rewrites
    │   ├── summaries
    │   └── video_projects
    │       └── video_scenes
    ├── user_credits
    ├── credit_transactions
    └── subscriptions
```

## 🔄 الحادثات (Triggers)

### `handle_new_user`
عندما يسجل مستخدم جديد:
- ينشئ سجل profile
- ينشئ سجل credits (500 رصيد أولي)
- ينشئ سجل subscription (خطة free)

### `update_timestamp`
يحدّث `updated_at` تلقائياً عند التعديل على السجلات

## 🧪 الاختبار

```bash
# تحقق من قاعدة البيانات
# SQL Editor → ابدأ بـ SELECT من أي جدول

# اختبر RLS
# حاول الوصول بـ user مختلف - يجب أن يرى فقط بياناته
```

## 📚 موارد إضافية

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**آخر تحديث**: 2026-11-10
