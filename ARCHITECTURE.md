# Kalamek AI - معمارية التطبيق 🏗️

## المعمارية العامة

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Expo)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          React Native UI Components                  │   │
│  │  - Auth Screens                                      │   │
│  │  - Video Upload Interface                           │   │
│  │  - Transcript Viewer & Editor                        │   │
│  │  - Font Library & Preview                           │   │
│  │  - Video Export                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓↑                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              State Management (Zustand)              │   │
│  │  - Auth State                                        │   │
│  │  - Project State                                     │   │
│  │  - Editor State                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓↑                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            API Services & Hooks                      │   │
│  │  - Supabase Client                                   │   │
│  │  - Whisper API Client                               │   │
│  │  - Video Processing Service                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓↑ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Backend                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database                          │   │
│  │  - Users, Projects, Transcripts                      │   │
│  │  - Captions, Fonts, Translations                     │   │
│  │  - Subscriptions, Storage Logs                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓↑                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Edge Functions (Deno)                        │   │
│  │  - Webhook handlers                                  │   │
│  │  - Scheduled jobs                                    │   │
│  │  - API integrations                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓↑                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Storage (S3-compatible)                      │   │
│  │  - Original Videos                                   │   │
│  │  - Exported Videos                                   │   │
│  │  - Font Files                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        ↓↑                                    ↓↑
┌──────────────────────┐          ┌──────────────────────┐
│   OpenAI Whisper    │          │  RevenueCat (IAP)     │
│                     │          │                      │
│ - Speech-to-Text    │          │ - Subscriptions      │
│ - Word Timestamps   │          │ - Receipt Validation │
└──────────────────────┘          └──────────────────────┘
```

---

## تدفق البيانات

### 1. رفع الفيديو
```
User uploads video
        ↓
Mobile app validates file
        ↓
Upload to Supabase Storage (signed URL)
        ↓
Database: Create project record
        ↓
Trigger Edge Function: Process video
```

### 2. استخراج الكلام
```
Video file ready
        ↓
Edge Function: Download video
        ↓
Call OpenAI Whisper API
        ↓
Receive: full text + word-level timestamps
        ↓
Store in database (transcript + words)
        ↓
Notify mobile app (real-time subscription)
```

### 3. تحرير الترجمات
```
User edits caption
        ↓
Update in app state
        ↓
Optimistic update on UI
        ↓
Save to Supabase
        ↓
Database update
```

### 4. تصدير الفيديو
```
User clicks export
        ↓
Prepare captions + styling
        ↓
Edge Function: Call FFmpeg
        ↓
Generate video with captions overlay
        ↓
Upload to Storage
        ↓
Return download URL
```

---

## التقنيات المستخدمة

### Frontend
| التقنية | الاستخدام | ملاحظات |
|---------|----------|---------|
| **React Native** | UI Framework | Cross-platform (iOS + Android) |
| **Expo** | Development & Distribution | Managed service |
| **TypeScript** | Type Safety | تطوير آمن |
| **React Router** | Navigation | File-based routing |
| **Zustand** | State Management | خفيف الوزن وسريع |
| **React Query** | Data Fetching | Caching & sync |
| **NativeBase** | UI Components | Arabic-friendly components |
| **React Hook Form** | Form Management | Validation + Performance |
| **Jotai** | Atomic State | للـ editor state المعقد |

### Backend
| التقنية | الاستخدام | ملاحظات |
|---------|----------|---------|
| **Supabase** | Backend as a Service | PostgreSQL + Auth + Storage |
| **PostgreSQL** | Database | Powerful & Reliable |
| **Deno** | Edge Functions | TypeScript on the edge |
| **AWS S3** | File Storage | Object storage (Supabase wrapper) |
| **RLS** | Row Level Security | Backend authorization |
| **PostgREST** | API | Auto-generated REST API |
| **Realtime** | WebSocket | Live subscriptions |

### External Services
| الخدمة | الاستخدام | السعر |
|------|----------|------|
| **OpenAI Whisper** | Speech-to-Text | $0.006 / دقيقة صوت |
| **RevenueCat** | In-App Purchases | 1% رسوم على المبيعات |
| **FFmpeg** | Video Processing | مفتوح المصدر |

---

## معايير الأمان 🔒

### Authentication
- ✅ Supabase Auth (OAuth + Email)
- ✅ JWT tokens
- ✅ Refresh token rotation
- ✅ Session management

### Authorization
- ✅ Row Level Security (RLS) على كل جدول
- ✅ User isolation (لا يرى أحد بيانات غيره)
- ✅ Project-based access control

### Data Protection
- ✅ HTTPS/TLS في كل المكان
- ✅ API keys في `.env` (لا في الكود)
- ✅ Supabase anon key محدود الصلاحيات
- ✅ Service Role key محفوظ على الـ backend فقط

### API Security
- ✅ Rate limiting على API endpoints
- ✅ Input validation
- ✅ SQL injection prevention (using parameterized queries)
- ✅ CORS configuration

---

## أداء التطبيق ⚡

### استراتيجيات التحسين

1. **Code Splitting**
   - Lazy load screens
   - Dynamic imports للمكتبات الثقيلة

2. **Caching**
   - React Query cache
   - Local storage للـ user preferences
   - Image caching

3. **Database Optimization**
   - Indexes على frequently-queried columns
   - Pagination للـ large result sets
   - Materialized views للـ complex queries

4. **Media Optimization**
   - Compress videos قبل الرفع
   - Progressive export quality
   - Adaptive bitrate streaming

5. **Network Optimization**
   - Batch API requests
   - Debounce search queries
   - Optimistic updates

---

## مراحل التطوير التفصيلية

### Phase 1: MVP (الأسبوع 1-2)
```
Week 1:
├── Database Setup ✓
├── Supabase Config ✓
├── Auth System
├── Project Management CRUD
└── Basic UI Screens

Week 2:
├── Video Upload
├── Whisper Integration
├── Transcript Storage
└── Basic Preview
```

### Phase 2: محرر الفيديو (الأسبوع 3-4)
```
Week 3:
├── Word-level Synchronization
├── Caption Editor
├── Font Selection (basic)
└── Preview with Subtitles

Week 4:
├── Styling Options
├── Position & Animation
├── Save Captions
└── FFmpeg Integration (test)
```

### Phase 3: ميزات متقدمة (الأسبوع 5-6)
```
Week 5:
├── Font Library Expansion
├── Speaker Detection
├── Translation API
└── Metadata

Week 6:
├── Video Export (MP4)
├── Quality Options
├── Project Management
└── Performance Optimization
```

### Phase 4: الربح والإطلاق (الأسبوع 7-8)
```
Week 7:
├── RevenueCat Setup
├── Subscription Plans
├── Paywall
└── Analytics

Week 8:
├── TestFlight (iOS)
├── Beta Testing (Android)
├── Bug fixes
└── App Store Submission
```

---

## قوائم التحقق

### قبل الانتقال لكل مرحلة
- [ ] جميع الوحدات تعمل محلياً
- [ ] الاختبارات تمر
- [ ] لا توجد console errors
- [ ] الأداء مقبول
- [ ] تم توثيق التغييرات

---

## Resources إضافية

- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Best Practices](https://reactnative.dev/docs/getting-started)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

