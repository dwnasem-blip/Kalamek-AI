# Security Audit Skill

## نطاق المهارة
مراجعة أمان التطبيق وحماية مفاتيح API وبيانات المستخدمين.

## قائمة الفحص الأمان

### Frontend Security

#### ✅ API Keys Management
```typescript
// ❌ خطأ - لا تفعل هذا
const API_KEY = 'sk-1234567890';

// ✅ صحيح - استخدم env variables
const API_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// ملاحظة: ANON_KEY آمنة (read-only)
// SERVICE_ROLE_KEY يجب أن تكون في Backend فقط
```

#### ✅ Secure Storage
```typescript
import * as SecureStore from 'expo-secure-store';

// حفظ token بأمان
await SecureStore.setItemAsync('auth_token', token);

// استرجاع token
const token = await SecureStore.getItemAsync('auth_token');

// لا تستخدم AsyncStorage للبيانات الحساسة
```

#### ✅ HTTPS فقط
```typescript
// ✅ صحيح
const supabase = createClient(
  'https://your-project.supabase.co', // HTTPS
  ANON_KEY
);

// ❌ خطأ
const url = 'http://api.example.com'; // لا تستخدم HTTP
```

#### ✅ Input Validation
```typescript
// تحقق من البيانات المدخلة
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// لا تثق في البيانات من المستخدم
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

### Backend Security

#### ✅ RLS Policies
```sql
-- تأكد أن RLS مفعلة
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- تحقق من الصلاحيات
-- المستخدم يرى فقط بياناته
CREATE POLICY "user_can_view_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

#### ✅ Environment Variables
```bash
# .env (لا تضعها في git)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# .env.example (للمثال)
SUPABASE_SERVICE_ROLE_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

#### ✅ API Rate Limiting
```typescript
// في Edge Functions
import { RateLimiter } from 'https://deno.land/x/rate_limiter/mod.ts';

const limiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

export async function handler(req) {
  const ip = req.headers.get('x-forwarded-for');
  
  if (!await limiter.check(ip)) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // process request
}
```

#### ✅ Input Validation في Backend
```typescript
// تحقق من البيانات في Edge Functions
interface CreateProjectRequest {
  title: string;
  type: 'article' | 'video' | 'summary';
}

function validateRequest(data: any): CreateProjectRequest {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid title');
  }
  
  if (!['article', 'video', 'summary'].includes(data.type)) {
    throw new Error('Invalid type');
  }
  
  return data as CreateProjectRequest;
}
```

### Data Protection

#### ✅ Encryption
```typescript
// بيانات حساسة يجب تشفيرها
import crypto from 'crypto';

function encryptData(data: string, key: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

function decryptData(encrypted: string, key: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
```

#### ✅ GDPR Compliance
```typescript
// احفظ سياسة الخصوصية
// اسمح للمستخدم بتحميل بياناته
// اسمح بحذف الحساب والبيانات

async function deleteUserData(userId: string) {
  // حذف من جميع الجداول
  await supabase.from('profiles').delete().eq('id', userId);
  // ... حذف جداول أخرى
}
```

#### ✅ Password Security
```typescript
// Supabase يتعامل مع هذا تلقائياً
// لكن تأكد من:
// - Password minimum 8 characters
// - تجنب patterns شائعة
// - استخدم hashing قوي (bcrypt)
```

## أداة الفحص الأمان

### Checklist قبل الإطلاق
```markdown
## Frontend
- [ ] لا توجد API keys مباشرة في الكود
- [ ] استخدام .env للمتغيرات
- [ ] HTTPS فقط
- [ ] Input validation
- [ ] SecureStore للبيانات الحساسة
- [ ] no console.log للبيانات الحساسة

## Backend
- [ ] RLS مفعلة على جميع الجداول
- [ ] Policies تحمي البيانات
- [ ] Rate limiting
- [ ] Input validation
- [ ] Authentication check
- [ ] Error handling (لا تكشف عن تفاصيل)

## Database
- [ ] Backups منتظمة
- [ ] Passwords مشفرة
- [ ] Access logs
- [ ] RLS Policies دقيقة

## API
- [ ] ANON_KEY فقط في Frontend
- [ ] SERVICE_ROLE_KEY في Backend فقط
- [ ] CORS configured
- [ ] Secrets rotated
```

## أمان الأرصدة والدفع

### منع الاحتيال
```typescript
// تحقق من الأرصدة قبل العملية
async function deductCredits(userId: string, amount: number) {
  const { data: user } = await supabase
    .from('user_credits')
    .select('available_credits')
    .eq('user_id', userId)
    .single();
  
  if (!user || user.available_credits < amount) {
    throw new Error('Insufficient credits');
  }
  
  // تقليل الأرصدة
  await supabase
    .from('user_credits')
    .update({ available_credits: user.available_credits - amount })
    .eq('user_id', userId);
  
  // تسجيل العملية
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    operation: 'deduct'
  });
}
```

## أفضل الممارسات

✅ **افعل**
- استخدم HTTPS دائماً
- استخدم environment variables
- فعّل RLS على جميع الجداول
- تحقق من جميع الـ inputs
- قم بـ regular backups
- راقب الـ access logs

❌ **لا تفعل**
- لا تضع مفاتيح في الكود
- لا تستخدم HTTP
- لا تتجاهل RLS
- لا تثق في بيانات المستخدم
- لا تكشف تفاصيل الأخطاء
- لا تنسى تحديث الحزم الأمنية

## الموارد

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [React Native Security](https://reactnative.dev/docs/security)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

---

**آخر تحديث**: 2026-11-10
