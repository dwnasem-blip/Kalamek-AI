# البنية المعمارية - WRITEGO

شرح تفصيلي للبنية التقنية والقرارات المعمارية للمشروع.

## 🏗️ البنية العامة

```
┌─────────────────────────────────────────────────────────────┐
│                   React Native (Expo)                        │
│           تطبيق الموبايل (iOS + Android)                     │
├─────────────────────────────────────────────────────────────┤
│                    Expo Router                                │
│              (Navigation & Routing)                           │
├─────────────────────────────────────────────────────────────┤
│                    Services Layer                             │
│    (Supabase, AI Providers, Storage, etc)                     │
├─────────────────────────────────────────────────────────────┤
│               Zustand Store (State Management)                │
│              (Auth, Projects, UI State)                      │
├─────────────────────────────────────────────────────────────┤
│                  Supabase Backend                             │
│    (PostgreSQL, Auth, Storage, Edge Functions)               │
├─────────────────────────────────────────────────────────────┤
│           External AI Services                                │
│    (OpenAI, ElevenLabs, Runway, FFmpeg)                       │
└─────────────────────────────────────────────────────────────┘
```

## 📱 تطبيق الموبايل

### Expo Router
استخدام Expo Router للملاحة:
- **رابط**: [Expo Router Docs](https://expo.dev/router)
- **المميزات**:
  - ملاحة حسب الملفات (File-based routing)
  - Navigation Stack و Tabs
  - URL-based navigation

### الهيكل
```
app/
├── _layout.tsx              # Root layout
├── (auth)/                  # Auth group
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
└── (app)/                   # App group (محمي)
    ├── _layout.tsx          # Tabs layout
    ├── index.tsx            # Home
    ├── writer.tsx
    ├── summarizer.tsx
    ├── rewriter.tsx
    └── settings.tsx
```

### State Management (Zustand)

اخترنا Zustand بدلاً من Redux لـ:
- ✅ أبسط وأخف
- ✅ TypeScript support جيد
- ✅ لا يحتاج كود boilerplate كثير
- ✅ Async/await support

```typescript
// مثال من authStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  signIn: async (email, password) => {
    // Logic here
  }
}));
```

## 🔧 Services Layer

### Supabase Integration
```typescript
// services/supabase.ts
export const supabase = createClient(url, key);

// استخدام:
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId);
```

### AI Providers (نمط Provider Pattern)
```typescript
// سيتم تطبيقه لاحقاً
interface AIProvider {
  generateText(prompt: string): Promise<string>;
}

class OpenAIProvider implements AIProvider {
  // Implementation
}

class ClaudeProvider implements AIProvider {
  // Implementation
}
```

## 🗄️ قاعدة البيانات

### PostgreSQL (Supabase)

#### الجداول الرئيسية
1. **auth.users** (من Supabase Auth)
2. **profiles** - المستخدمين
3. **projects** - المشاريع
4. **generated_articles** - المقالات
5. **rewrites** - إعادة الصياغة
6. **summaries** - الملخصات
7. **video_projects** - مشاريع الفيديو
8. **user_credits** - الأرصدة
9. **subscriptions** - الاشتراكات

#### الأمان (RLS)
```sql
-- مثال: يمكن للمستخدم فقط رؤية مشاريعه
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);
```

#### الحادثات (Triggers)
- `handle_new_user`: عند تسجيل مستخدم جديد
- `update_timestamp`: تحديث `updated_at` تلقائياً

## 🔐 معمارية الأمان

### Frontend (موبايل)
```
┌─────────────────────┐
│  React Native App   │
│  ANON KEY (public)  │  ← Safe (read-only)
└─────────────────────┘
          ↓
     RLS Policies
     (Database-level)
```

### Backend (Edge Functions - قريباً)
```
┌──────────────────────┐
│  Supabase Edge Fn    │
│ SERVICE_ROLE_KEY ← فقط هنا!
└──────────────────────┘
          ↓
  External APIs
  (OpenAI, etc)
```

## 📊 سير العمل (Workflows)

### 1. التسجيل والدخول
```
User Input (Email/Password)
    ↓
Supabase Auth
    ↓
Profile Created (Trigger)
Credits Initialize (Trigger)
    ↓
Auth Store Updated
    ↓
Navigate to App
```

### 2. توليد محتوى (مثال: AI Writer)
```
User Input (Title/Topic)
    ↓
Create Project (Draft)
    ↓
Call OpenAI API (via Edge Function)
    ↓
Deduct Credits
    ↓
Save Generated Article
    ↓
Update Project Status
```

## 🚀 المرحلة التالية

### إضافة AI Services (Edge Functions)
```
packages/mobile
    ↓ (API Call)
Supabase Edge Functions
    ├── generate-article/
    ├── generate-summary/
    ├── generate-rewrite/
    └── generate-video-script/
    ↓ (with SERVICE_ROLE_KEY)
OpenAI API
ElevenLabs API
Runway API
```

### مثال Edge Function
```typescript
// supabase/functions/generate-article/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from "npm:openai@latest"

serve(async (req) => {
  const { title, description } = await req.json()
  
  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")
  })
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: `اكتب مقالة عن: ${title}` }
    ]
  })
  
  return new Response(JSON.stringify(response))
})
```

## 🎯 أنماط التصميم

### 1. Service Pattern
```typescript
// تفرقة واضحة بين الـ UI والـ Logic
// services/supabase.ts → داخلي
// hooks/useProjects.ts → استخدام في Components
// components/ProjectCard.tsx → UI فقط
```

### 2. Store Pattern (Zustand)
```typescript
// Centralized state management
// store/authStore.ts
// store/projectsStore.ts
// store/uiStore.ts
```

### 3. Provider Pattern (لاحقاً)
```typescript
// دعم تبديل بين خدمات مختلفة
interface AIProvider {
  generateText(...): Promise<string>
}

// استخدام:
const provider = new OpenAIProvider();
// أو
const provider = new ClaudeProvider();
```

## 🧪 الاختبار (في المستقبل)

```
packages/mobile/
├── __tests__/
│   ├── services/
│   ├── store/
│   └── components/
└── jest.config.js
```

## 📈 التحسينات المستقبلية

- [ ] Caching (AsyncStorage)
- [ ] Offline support
- [ ] Push notifications
- [ ] Analytics
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

**آخر تحديث**: 2026-11-10
