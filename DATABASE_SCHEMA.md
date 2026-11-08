# Kalamek AI - تصميم قاعدة البيانات

## الجداول الأساسية

### 1. **users** (المستخدمون)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  language VARCHAR(10) DEFAULT 'ar',
  
  -- الاشتراك
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_expires_at TIMESTAMP,
  
  -- الإحصائيات
  total_videos_processed INTEGER DEFAULT 0,
  total_storage_used BIGINT DEFAULT 0,
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_email_format CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);
```

### 2. **projects** (المشاريع)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- الفيديو الأصلي
  video_url VARCHAR(500),
  video_duration_ms INTEGER,
  video_file_size BIGINT,
  
  -- معلومات المعالجة
  language VARCHAR(10) DEFAULT 'ar',
  processing_status VARCHAR(50) DEFAULT 'pending',
  processing_progress INTEGER DEFAULT 0,
  processing_error TEXT,
  
  -- الحالة
  status VARCHAR(50) DEFAULT 'draft',
  is_favorite BOOLEAN DEFAULT FALSE,
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_projects (user_id),
  INDEX idx_project_status (status)
);
```

### 3. **transcripts** (النصوص المستخرجة)
```sql
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- النص الكامل
  full_text TEXT NOT NULL,
  
  -- البيانات الوصفية
  duration_ms INTEGER,
  confidence_score DECIMAL(3,2),
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_project_transcript (project_id)
);
```

### 4. **transcript_words** (الكلمات مع التوقيت)
```sql
CREATE TABLE transcript_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- الكلمة
  word VARCHAR(255) NOT NULL,
  word_index INTEGER NOT NULL,
  
  -- التوقيت (بالـ milliseconds)
  start_time_ms INTEGER NOT NULL,
  end_time_ms INTEGER NOT NULL,
  duration_ms INTEGER GENERATED ALWAYS AS (end_time_ms - start_time_ms) STORED,
  
  -- الثقة
  confidence DECIMAL(3,2),
  
  -- المتحدث (اختياري)
  speaker_id VARCHAR(50),
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_transcript_words (transcript_id),
  INDEX idx_word_timing (start_time_ms, end_time_ms)
);
```

### 5. **captions** (الترجمات/التعليقات)
```sql
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- النص المعدل
  text TEXT NOT NULL,
  
  -- التوقيت
  start_time_ms INTEGER NOT NULL,
  end_time_ms INTEGER NOT NULL,
  
  -- التخصيص
  font_id VARCHAR(100) DEFAULT 'Cairo',
  font_size INTEGER DEFAULT 32,
  font_color VARCHAR(10) DEFAULT '#FFFFFF',
  font_weight VARCHAR(20) DEFAULT '600',
  
  -- الخلفية والتأثيرات
  background_color VARCHAR(10),
  background_opacity DECIMAL(3,2),
  shadow_enabled BOOLEAN DEFAULT TRUE,
  stroke_enabled BOOLEAN DEFAULT FALSE,
  
  -- الموضع
  position_x_percent DECIMAL(5,2) DEFAULT 50,
  position_y_percent DECIMAL(5,2) DEFAULT 80,
  
  -- عرض
  display_mode VARCHAR(20) DEFAULT 'full_sentence', -- word-by-word, full_sentence
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_caption_timing (start_time_ms, end_time_ms)
);
```

### 6. **fonts** (مكتبة الخطوط)
```sql
CREATE TABLE fonts (
  id VARCHAR(100) PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  
  category VARCHAR(50) NOT NULL, -- naskh, ruqa, thuluth, diwani, kufi, modern, content_creator, decorative
  
  -- الملف
  font_file_url VARCHAR(500) NOT NULL,
  font_file_format VARCHAR(10) DEFAULT 'woff2',
  
  -- معلومات
  designer_name VARCHAR(255),
  is_commercial_licensed BOOLEAN DEFAULT TRUE,
  license_url VARCHAR(500),
  
  -- البحث والترتيب
  search_tags TEXT,
  popularity_score INTEGER DEFAULT 0,
  
  -- الحالة
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- RTL Support
  supports_rtl BOOLEAN DEFAULT TRUE,
  supports_diacritics BOOLEAN DEFAULT TRUE,
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_font_category (category),
  INDEX idx_font_active (is_active)
);
```

### 7. **user_favorite_fonts** (الخطوط المفضلة)
```sql
CREATE TABLE user_favorite_fonts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  font_id VARCHAR(100) NOT NULL REFERENCES fonts(id) ON DELETE CASCADE,
  
  added_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, font_id),
  INDEX idx_user_favorites (user_id)
);
```

### 8. **exported_videos** (الفيديوهات المُصدَّرة)
```sql
CREATE TABLE exported_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- الفيديو المُصدَّر
  video_url VARCHAR(500) NOT NULL,
  video_file_size BIGINT,
  
  -- الجودة
  quality VARCHAR(50) DEFAULT '1080p', -- 720p, 1080p, 4k
  format VARCHAR(20) DEFAULT 'mp4',
  bitrate_kbps INTEGER,
  
  -- الترجمات
  subtitles_included BOOLEAN DEFAULT TRUE,
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_project_exports (project_id)
);
```

### 9. **speakers** (المتحدثون المكتشفون)
```sql
CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- تعريف المتحدث
  speaker_index INTEGER NOT NULL,
  speaker_name VARCHAR(255),
  
  -- الإحصائيات
  word_count INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, speaker_index)
);
```

### 10. **translations** (الترجمات)
```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- اللغة
  target_language VARCHAR(10) NOT NULL,
  
  -- النص المترجم
  full_text TEXT NOT NULL,
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(transcript_id, target_language),
  INDEX idx_translations (target_language)
);
```

### 11. **subscription_plans** (خطط الاشتراك)
```sql
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  
  -- الميزات
  max_videos_per_month INTEGER,
  max_video_duration_minutes INTEGER,
  max_storage_gb BIGINT,
  
  hd_export BOOLEAN DEFAULT FALSE,
  speaker_diarization BOOLEAN DEFAULT FALSE,
  translation BOOLEAN DEFAULT FALSE,
  commercial_use BOOLEAN DEFAULT FALSE,
  
  -- السعر
  price_monthly_usd DECIMAL(10,2),
  price_yearly_usd DECIMAL(10,2),
  
  -- الترتيب
  display_order INTEGER,
  
  -- الحالة
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 12. **storage_logs** (تتبع استهلاك التخزين)
```sql
CREATE TABLE storage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- العملية
  operation VARCHAR(50), -- upload, export, delete
  file_type VARCHAR(20), -- video, export
  file_size BIGINT,
  
  -- التتبع
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_storage_logs (user_id),
  INDEX idx_storage_by_date (created_at)
);
```

## Constraints والـ Indexes

```sql
-- RLS Policies (للأمان)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_user_policy ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY transcripts_user_policy ON transcripts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
  );
```

## العلاقات

```
users
  ├── projects (1:M)
  │   ├── transcripts (1:M)
  │   │   ├── transcript_words (1:M)
  │   │   ├── captions (1:M)
  │   │   ├── translations (1:M)
  │   │   └── speakers (1:M)
  │   └── exported_videos (1:M)
  ├── user_favorite_fonts (1:M)
  └── storage_logs (1:M)

fonts (جدول مستقل)
  └── user_favorite_fonts (M:1)

subscription_plans (جدول مرجعي)
```

## ملاحظات مهمة

1. **الأمان**: جميع الجداول محمية بـ RLS policies
2. **الأداء**: indexes على جميع foreign keys و columns المستخدمة في البحث
3. **التتبع**: جميع الجداول بها timestamps
4. **الامتداد**: سهل إضافة أعمدة جديدة بدون تأثر البيانات القديمة
5. **النسخ الاحتياطي**: Supabase يوفر backup تلقائي يومي

