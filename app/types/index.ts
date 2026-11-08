// ==================== Auth Types ====================
export type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  language: 'ar' | 'en';
  subscriptionTier: 'free' | 'pro' | 'creator' | 'enterprise';
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | 'expired';
  subscriptionExpiresAt?: Date;
  createdAt: Date;
};

// ==================== Project Types ====================
export type Project = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  videoDurationMs?: number;
  videoFileSize?: number;
  language: 'ar' | 'en' | 'fr' | 'de' | 'es' | 'zh' | 'ja';
  processingStatus: 'pending' | 'extracting' | 'syncing' | 'completed' | 'failed';
  processingProgress: number;
  processingError?: string;
  status: 'draft' | 'processing' | 'completed' | 'archived';
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ==================== Transcript Types ====================
export type Transcript = {
  id: string;
  projectId: string;
  fullText: string;
  durationMs: number;
  confidenceScore: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TranscriptWord = {
  id: string;
  transcriptId: string;
  word: string;
  wordIndex: number;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  confidence: number;
  speakerId?: string;
  createdAt: Date;
};

export type Caption = {
  id: string;
  transcriptId: string;
  text: string;
  startTimeMs: number;
  endTimeMs: number;
  fontId: string;
  fontSize: number;
  fontColor: string;
  fontWeight: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  shadowEnabled: boolean;
  strokeEnabled: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  positionXPercent: number;
  positionYPercent: number;
  displayMode: 'word-by-word' | 'full_sentence' | 'line_by_line';
  highlightColor?: string;
  createdAt: Date;
  updatedAt: Date;
};

// ==================== Font Types ====================
export type Font = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'naskh' | 'ruqa' | 'thuluth' | 'diwani' | 'kufi' | 'modern' | 'content_creator' | 'decorative';
  fontFileUrl: string;
  fontFileFormat: 'ttf' | 'otf' | 'woff' | 'woff2';
  fontFileHash?: string;
  designerName?: string;
  isCommercialLicensed: boolean;
  licenseUrl?: string;
  searchTags: string[];
  popularityScore: number;
  isActive: boolean;
  isFeatured: boolean;
  supportsRtl: boolean;
  supportsDiacritics: boolean;
  supportsLigatures: boolean;
  createdAt: Date;
};

// ==================== Speaker Types ====================
export type Speaker = {
  id: string;
  projectId: string;
  speakerIndex: number;
  speakerName?: string;
  speakerColor?: string;
  wordCount: number;
  durationMs: number;
  createdAt: Date;
};

// ==================== Translation Types ====================
export type Translation = {
  id: string;
  transcriptId: string;
  targetLanguage: string;
  fullText: string;
  createdAt: Date;
};

// ==================== Export Types ====================
export type ExportedVideo = {
  id: string;
  projectId: string;
  videoUrl: string;
  videoFileSize?: number;
  quality: '720p' | '1080p' | '2160p';
  format: 'mp4' | 'mov' | 'mkv' | 'webm';
  bitrateKbps?: number;
  subtitlesIncluded: boolean;
  createdAt: Date;
};

// ==================== Subscription Types ====================
export type SubscriptionPlan = {
  id: string;
  nameAr: string;
  nameEn: string;
  maxVideosPerMonth?: number;
  maxVideoDurationMinutes?: number;
  maxStorageGb?: number;
  hdExport: boolean;
  speakerDiarization: boolean;
  translation: boolean;
  commercialUse: boolean;
  priceMonthlyUsd?: number;
  priceYearlyUsd?: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
};

// ==================== API Response Types ====================
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
};

// ==================== Upload Types ====================
export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

// ==================== Whisper Response ====================
export type WhisperResponse = {
  text: string;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  language: string;
  duration: number;
};

// ==================== Editor State ====================
export type EditorState = {
  selectedCaptionId?: string;
  selectedWordId?: string;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  viewMode: 'timeline' | 'preview' | 'editor';
};

// ==================== Error Types ====================
export type AppError = {
  code: string;
  message: string;
  originalError?: Error;
};
