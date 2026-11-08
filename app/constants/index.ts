/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ENVIRONMENT: (process.env.EXPO_PUBLIC_API_ENVIRONMENT || 'development') as 'development' | 'staging' | 'production',
};

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  CREATOR: 'creator',
  ENTERPRISE: 'enterprise',
} as const;

// Feature Limits
export const FEATURE_LIMITS = {
  free: {
    maxVideosPerMonth: 3,
    maxVideoDurationMinutes: 10,
    maxStorageGb: 1,
    hdExport: false,
    speakerDiarization: false,
    translation: false,
    commercialUse: false,
  },
  pro: {
    maxVideosPerMonth: 50,
    maxVideoDurationMinutes: 120,
    maxStorageGb: 50,
    hdExport: true,
    speakerDiarization: false,
    translation: false,
    commercialUse: false,
  },
  creator: {
    maxVideosPerMonth: 200,
    maxVideoDurationMinutes: 300,
    maxStorageGb: 200,
    hdExport: true,
    speakerDiarization: true,
    translation: true,
    commercialUse: true,
  },
  enterprise: {
    maxVideosPerMonth: null,
    maxVideoDurationMinutes: null,
    maxStorageGb: null,
    hdExport: true,
    speakerDiarization: true,
    translation: true,
    commercialUse: true,
  },
};

// Languages
export const SUPPORTED_LANGUAGES = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  zh: '中文',
  ja: '日本語',
} as const;

// Video Upload
export const VIDEO_UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 2000, // 2GB
  ACCEPTED_FORMATS: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  CHUNK_SIZE: 1024 * 1024 * 5, // 5MB chunks
};

// Caption Display Modes
export const CAPTION_DISPLAY_MODES = {
  WORD_BY_WORD: 'word-by-word',
  FULL_SENTENCE: 'full_sentence',
  LINE_BY_LINE: 'line_by_line',
} as const;

// Font Categories
export const FONT_CATEGORIES = {
  NASKH: 'naskh',
  RUQA: 'ruqa',
  THULUTH: 'thuluth',
  DIWANI: 'diwani',
  KUFI: 'kufi',
  MODERN: 'modern',
  CONTENT_CREATOR: 'content_creator',
  DECORATIVE: 'decorative',
} as const;

// Export Quality Options
export const EXPORT_QUALITY = {
  '720p': { width: 1280, height: 720, bitrate: 2500 },
  '1080p': { width: 1920, height: 1080, bitrate: 5000 },
  '2160p': { width: 3840, height: 2160, bitrate: 15000 },
} as const;

// Processing Status
export const PROCESSING_STATUS = {
  PENDING: 'pending',
  EXTRACTING: 'extracting',
  SYNCING: 'syncing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Project Status
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#48bb78',
  ERROR: '#f56565',
  WARNING: '#ed8936',
  INFO: '#4299e1',
  LIGHT: '#f7fafc',
  DARK: '#1a202c',
};

// TimeOuts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  UPLOAD: 300000, // 5 minutes
  PROCESSING: 3600000, // 1 hour
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Cache Expiration Times (in seconds)
export const CACHE_DURATION = {
  USER: 3600, // 1 hour
  PROJECTS: 300, // 5 minutes
  FONTS: 86400, // 24 hours
  TRANSCRIPTS: 3600, // 1 hour
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: '/projects/:id',
    UPDATE: '/projects/:id',
    DELETE: '/projects/:id',
  },
  TRANSCRIPTS: {
    GET: '/transcripts/:id',
    CREATE: '/transcripts',
  },
  CAPTIONS: {
    LIST: '/captions',
    CREATE: '/captions',
    UPDATE: '/captions/:id',
    DELETE: '/captions/:id',
  },
  FONTS: {
    LIST: '/fonts',
    GET: '/fonts/:id',
  },
  EXPORTS: {
    CREATE: '/exports',
    GET: '/exports/:id',
  },
};

// Whisper API Configuration
export const WHISPER_CONFIG = {
  MODEL: 'whisper-1',
  LANGUAGE: 'ar',
  RESPONSE_FORMAT: 'json',
  TEMPERATURE: 0,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالإنترنت',
  TIMEOUT: 'انتهت المهلة الزمنية',
  INVALID_FILE: 'الملف غير صالح',
  FILE_TOO_LARGE: 'الملف كبير جداً',
  UNAUTHORIZED: 'لم تتم المصادقة',
  FORBIDDEN: 'ليس لديك صلاحيات',
  NOT_FOUND: 'لم يتم العثور على الملف',
  SERVER_ERROR: 'خطأ في الخادم',
  GENERIC_ERROR: 'حدث خطأ ما',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'تم إنشاء المشروع بنجاح',
  PROJECT_UPDATED: 'تم تحديث المشروع بنجاح',
  PROJECT_DELETED: 'تم حذف المشروع بنجاح',
  FILE_UPLOADED: 'تم رفع الملف بنجاح',
  CHANGES_SAVED: 'تم حفظ التغييرات',
};

// Default Values
export const DEFAULTS = {
  FONT_SIZE: 32,
  FONT_WEIGHT: '600',
  FONT_COLOR: '#FFFFFF',
  BACKGROUND_COLOR: '#000000',
  BACKGROUND_OPACITY: 0.7,
  TEXT_POSITION_X: 50,
  TEXT_POSITION_Y: 80,
  PLAYBACK_SPEED: 1,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'kalamek_auth_token',
  REFRESH_TOKEN: 'kalamek_refresh_token',
  USER_ID: 'kalamek_user_id',
  LANGUAGE: 'kalamek_language',
  THEME: 'kalamek_theme',
  RECENT_PROJECTS: 'kalamek_recent_projects',
  DRAFT_PROJECTS: 'kalamek_draft_projects',
};

export default {
  API_CONFIG,
  SUBSCRIPTION_TIERS,
  FEATURE_LIMITS,
  SUPPORTED_LANGUAGES,
  VIDEO_UPLOAD_CONFIG,
  CAPTION_DISPLAY_MODES,
  FONT_CATEGORIES,
  EXPORT_QUALITY,
  PROCESSING_STATUS,
  PROJECT_STATUS,
  COLORS,
  TIMEOUTS,
  PAGINATION,
  CACHE_DURATION,
  API_ENDPOINTS,
  WHISPER_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS,
  STORAGE_KEYS,
};
