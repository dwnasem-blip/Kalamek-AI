-- Kalamek AI - Initial Database Schema
-- Created: 2026-11-08

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===================== USERS =====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  language VARCHAR(10) DEFAULT 'ar',

  -- Subscription
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_expires_at TIMESTAMP,

  -- Statistics
  total_videos_processed INTEGER DEFAULT 0,
  total_storage_used BIGINT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_email_format CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  CONSTRAINT check_subscription_status CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'expired'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ===================== PROJECTS =====================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Original video
  video_url VARCHAR(500),
  video_duration_ms INTEGER,
  video_file_size BIGINT,
  video_mime_type VARCHAR(50),

  -- Processing
  language VARCHAR(10) DEFAULT 'ar',
  processing_status VARCHAR(50) DEFAULT 'pending',
  processing_progress INTEGER DEFAULT 0,
  processing_error TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  is_favorite BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_status CHECK (status IN ('draft', 'processing', 'completed', 'archived')),
  CONSTRAINT check_processing_status CHECK (processing_status IN ('pending', 'extracting', 'syncing', 'completed', 'failed')),
  CONSTRAINT check_language CHECK (language IN ('ar', 'en', 'fr', 'de', 'es', 'zh', 'ja'))
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- ===================== TRANSCRIPTS =====================
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,

  -- Full text
  full_text TEXT NOT NULL,

  -- Metadata
  duration_ms INTEGER,
  confidence_score DECIMAL(3,2),
  word_count INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transcripts_project_id ON transcripts(project_id);

-- ===================== TRANSCRIPT WORDS =====================
CREATE TABLE transcript_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,

  -- Word
  word VARCHAR(255) NOT NULL,
  word_index INTEGER NOT NULL,

  -- Timing (milliseconds)
  start_time_ms INTEGER NOT NULL,
  end_time_ms INTEGER NOT NULL,
  duration_ms INTEGER GENERATED ALWAYS AS (end_time_ms - start_time_ms) STORED,

  -- Confidence
  confidence DECIMAL(3,2),

  -- Speaker (optional)
  speaker_id VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_timing CHECK (end_time_ms > start_time_ms)
);

CREATE INDEX idx_transcript_words_transcript_id ON transcript_words(transcript_id);
CREATE INDEX idx_transcript_words_timing ON transcript_words(start_time_ms, end_time_ms);
CREATE INDEX idx_transcript_words_word_index ON transcript_words(word_index);

-- ===================== CAPTIONS =====================
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,

  -- Text
  text TEXT NOT NULL,

  -- Timing
  start_time_ms INTEGER NOT NULL,
  end_time_ms INTEGER NOT NULL,

  -- Styling
  font_id VARCHAR(100) DEFAULT 'Cairo',
  font_size INTEGER DEFAULT 32,
  font_color VARCHAR(10) DEFAULT '#FFFFFF',
  font_weight VARCHAR(20) DEFAULT '600',

  -- Background and effects
  background_color VARCHAR(10),
  background_opacity DECIMAL(3,2),
  shadow_enabled BOOLEAN DEFAULT TRUE,
  stroke_enabled BOOLEAN DEFAULT FALSE,
  stroke_color VARCHAR(10),
  stroke_width INTEGER DEFAULT 1,

  -- Position
  position_x_percent DECIMAL(5,2) DEFAULT 50,
  position_y_percent DECIMAL(5,2) DEFAULT 80,

  -- Display
  display_mode VARCHAR(20) DEFAULT 'full_sentence',
  highlight_color VARCHAR(10),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_display_mode CHECK (display_mode IN ('word-by-word', 'full_sentence', 'line_by_line')),
  CONSTRAINT check_timing CHECK (end_time_ms > start_time_ms)
);

CREATE INDEX idx_captions_transcript_id ON captions(transcript_id);
CREATE INDEX idx_captions_timing ON captions(start_time_ms, end_time_ms);

-- ===================== FONTS =====================
CREATE TABLE fonts (
  id VARCHAR(100) PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,

  category VARCHAR(50) NOT NULL,

  -- File
  font_file_url VARCHAR(500) NOT NULL,
  font_file_format VARCHAR(10) DEFAULT 'woff2',
  font_file_hash VARCHAR(64),

  -- Info
  designer_name VARCHAR(255),
  is_commercial_licensed BOOLEAN DEFAULT TRUE,
  license_url VARCHAR(500),

  -- Search
  search_tags TEXT,
  popularity_score INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- RTL Support
  supports_rtl BOOLEAN DEFAULT TRUE,
  supports_diacritics BOOLEAN DEFAULT TRUE,
  supports_ligatures BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_category CHECK (category IN ('naskh', 'ruqa', 'thuluth', 'diwani', 'kufi', 'modern', 'content_creator', 'decorative')),
  CONSTRAINT check_format CHECK (font_file_format IN ('ttf', 'otf', 'woff', 'woff2'))
);

CREATE INDEX idx_fonts_category ON fonts(category);
CREATE INDEX idx_fonts_active ON fonts(is_active);
CREATE INDEX idx_fonts_search ON fonts USING GIN (search_tags gin_trgm_ops);

-- ===================== USER FAVORITE FONTS =====================
CREATE TABLE user_favorite_fonts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  font_id VARCHAR(100) NOT NULL REFERENCES fonts(id) ON DELETE CASCADE,

  added_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, font_id)
);

CREATE INDEX idx_user_favorite_fonts ON user_favorite_fonts(user_id);

-- ===================== EXPORTED VIDEOS =====================
CREATE TABLE exported_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Exported video
  video_url VARCHAR(500) NOT NULL,
  video_file_size BIGINT,

  -- Quality
  quality VARCHAR(50) DEFAULT '1080p',
  format VARCHAR(20) DEFAULT 'mp4',
  bitrate_kbps INTEGER,

  -- Subtitles
  subtitles_included BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_quality CHECK (quality IN ('720p', '1080p', '2160p')),
  CONSTRAINT check_format CHECK (format IN ('mp4', 'mov', 'mkv', 'webm'))
);

CREATE INDEX idx_exported_videos_project_id ON exported_videos(project_id);
CREATE INDEX idx_exported_videos_created_at ON exported_videos(created_at);

-- ===================== SPEAKERS =====================
CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Speaker info
  speaker_index INTEGER NOT NULL,
  speaker_name VARCHAR(255),
  speaker_color VARCHAR(10),

  -- Stats
  word_count INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(project_id, speaker_index)
);

CREATE INDEX idx_speakers_project_id ON speakers(project_id);

-- ===================== TRANSLATIONS =====================
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,

  -- Language
  target_language VARCHAR(10) NOT NULL,

  -- Translated text
  full_text TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(transcript_id, target_language)
);

CREATE INDEX idx_translations_transcript_id ON translations(transcript_id);

-- ===================== SUBSCRIPTION PLANS =====================
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,

  -- Features
  max_videos_per_month INTEGER,
  max_video_duration_minutes INTEGER,
  max_storage_gb BIGINT,

  hd_export BOOLEAN DEFAULT FALSE,
  speaker_diarization BOOLEAN DEFAULT FALSE,
  translation BOOLEAN DEFAULT FALSE,
  commercial_use BOOLEAN DEFAULT FALSE,

  -- Pricing
  price_monthly_usd DECIMAL(10,2),
  price_yearly_usd DECIMAL(10,2),

  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ===================== STORAGE LOGS =====================
CREATE TABLE storage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Operation
  operation VARCHAR(50),
  file_type VARCHAR(20),
  file_size BIGINT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_storage_logs_user_id ON storage_logs(user_id);
CREATE INDEX idx_storage_logs_created_at ON storage_logs(created_at);

-- ===================== ENABLE RLS =====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exported_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_fonts ENABLE ROW LEVEL SECURITY;

-- ===================== RLS POLICIES =====================

-- Users: Each user can see only their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Projects: Users can manage their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Transcripts: Access through project ownership
CREATE POLICY "Users can view transcripts of their projects"
  ON transcripts FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = transcript_id AND projects.user_id = auth.uid()));

-- Similar policies for other tables...
CREATE POLICY "Users can manage captions of their projects"
  ON captions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM transcripts t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = captions.transcript_id AND p.user_id = auth.uid()
  ));

-- Insert initial subscription plans
INSERT INTO subscription_plans (id, name_ar, name_en, max_videos_per_month, max_video_duration_minutes, max_storage_gb, price_monthly_usd, price_yearly_usd, display_order, is_active) VALUES
('free', 'مجاني', 'Free', 3, 10, 1, NULL, NULL, 1, TRUE),
('pro', 'احترافي', 'Pro', 50, 120, 50, 9.99, 99.99, 2, TRUE),
('creator', 'منشئ محتوى', 'Creator', 200, 300, 200, 19.99, 199.99, 3, TRUE),
('enterprise', 'مؤسسي', 'Enterprise', NULL, NULL, NULL, NULL, NULL, 4, TRUE);
