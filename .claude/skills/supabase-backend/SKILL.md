# Supabase Backend Skill

## نطاق المهارة
إدارة قاعدة البيانات PostgreSQL، نظام المصادقة، RLS Policies، والتخزين من خلال Supabase.

## التقنيات المستخدمة
- **PostgreSQL** - قاعدة البيانات
- **Supabase Auth** - نظام المصادقة
- **RLS Policies** - أمان البيانات على مستوى الصف
- **Edge Functions** - Functions بدون server
- **Supabase Storage** - تخزين الملفات
- **Realtime** - تحديثات فورية

## أساسيات Supabase

### الاتصال من التطبيق
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);
```

### الأمان (API Keys)
- **ANON_KEY**: للعمليات العامة (read, select)
- **SERVICE_ROLE_KEY**: فقط في Edge Functions (admin)
- **⚠️ لا تستخدم SERVICE_ROLE_KEY في Frontend**

## Schema Design

### جداول البيانات

#### Profiles (المستخدمون)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  language VARCHAR(5) DEFAULT 'ar',
  dialect VARCHAR(20),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### Projects (المشاريع)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
```

### العلاقات (Relationships)
```
auth.users
    ↓ (one-to-one)
profiles
    ↓ (one-to-many)
projects
    ├── generated_articles
    ├── summaries
    └── video_projects
```

## Row Level Security (RLS)

### تفعيل RLS
```sql
-- تفعيل على جميع الجداول
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

### إنشاء Policies

#### Profiles
```sql
-- المستخدم يرى فقط ملفه الشخصي
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- المستخدم يعدل فقط ملفه الشخصي
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Projects
```sql
-- يرى المستخدم فقط مشاريعه
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- يدرج المستخدم مشاريع له فقط
CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- يعدل المستخدم مشاريعه فقط
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);
```

## المصادقة (Authentication)

### التسجيل الجديد
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'username',
    },
  },
});
```

### تسجيل الدخول
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### استعادة كلمة المرور
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: 'writego://reset-password',
  }
);
```

### تسجيل الخروج
```typescript
const { error } = await supabase.auth.signOut();
```

### الحصول على المستخدم الحالي
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## عمليات CRUD

### القراءة (SELECT)
```typescript
// جميع المشاريع
const { data, error } = await supabase
  .from('projects')
  .select('*');

// مع شروط
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .eq('type', 'article');

// مع ترتيب
const { data } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false });

// مع limit
const { data } = await supabase
  .from('projects')
  .select('*')
  .limit(10);
```

### الإدراج (INSERT)
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: userId,
    title: 'My Article',
    type: 'article',
  })
  .select();
```

### التحديث (UPDATE)
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({ status: 'completed' })
  .eq('id', projectId)
  .select();
```

### الحذف (DELETE)
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

## Transactions و Bulk Operations

### Bulk Insert
```typescript
const projects = [
  { title: 'Project 1', user_id: userId },
  { title: 'Project 2', user_id: userId },
];

const { data, error } = await supabase
  .from('projects')
  .insert(projects);
```

## Joins و Complex Queries

### مع JOIN
```typescript
// احصل على المشاريع مع تفاصيل المستخدم
const { data } = await supabase
  .from('projects')
  .select(`
    id,
    title,
    profiles (
      username,
      avatar_url
    )
  `);
```

## Real-time Subscriptions

### الاستماع للتغييرات
```typescript
supabase
  .channel('projects')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'projects',
    },
    (payload) => {
      console.log('New project:', payload.new);
    }
  )
  .subscribe();
```

## Storage (تخزين الملفات)

### رفع ملف
```typescript
const file = new File([blob], 'avatar.jpg');

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);
```

### تحميل ملف
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .download(`${userId}/avatar.jpg`);
```

### الحصول على رابط عام
```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);

console.log('Public URL:', data.publicUrl);
```

## Triggers و Functions

### Trigger عند تسجيل مستخدم جديد
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 
             SPLIT_PART(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_credits (user_id, available_credits)
  VALUES (NEW.id, 500);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
```

## Edge Functions

### هيكل Edge Function
```typescript
// supabase/functions/generate-article/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { title } = await req.json()
  
  // استخدم SERVICE_ROLE_KEY هنا
  const apiKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  
  // استدعِ APIs الخارجية
  // احفظ النتائج في قاعدة البيانات
  
  return new Response(JSON.stringify({ success: true }))
})
```

## معالجة الأخطاء

### تقييم الأخطاء
```typescript
try {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) {
    throw error;
  }
} catch (error) {
  console.error('Database error:', error.message);
  // تعامل مع الخطأ
}
```

### أنواع الأخطاء الشائعة
```
- PGRST116: Relation not found
- 23503: Foreign key violation
- 23505: Unique violation
- 42P01: Relation does not exist
```

## أفضل الممارسات

✅ **افعل**
- استخدم ANON_KEY في Frontend
- استخدم RLS على جميع الجداول
- استخدم Indexes للأداء
- تحقق من RLS Policies
- استخدم Transactions للعمليات المعقدة

❌ **لا تفعل**
- لا تستخدم SERVICE_ROLE_KEY في Frontend
- لا تضع API Keys في الكود
- لا تنسى RLS
- لا تحذف Policies
- لا تستخدم * في SELECT (حدد الأعمدة)

## الموارد

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

**آخر تحديث**: 2026-11-10
