// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  language: 'ar' | 'en';
  dialect?: string;
  created_at: string;
  updated_at: string;
}

// Project types
export type ProjectType = 'article' | 'video' | 'summary' | 'rewrite' | 'social';
export type ProjectStatus = 'draft' | 'generating' | 'completed' | 'failed';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

// Generated content types
export interface GeneratedArticle {
  id: string;
  project_id: string;
  content: string;
  word_count: number;
  created_at: string;
}

export interface Rewrite {
  id: string;
  project_id: string;
  original_text: string;
  rewritten_text: string;
  style: 'formal' | 'casual' | 'academic' | 'marketing';
  created_at: string;
}

export interface Summary {
  id: string;
  project_id: string;
  original_text: string;
  summary: string;
  length: 'short' | 'medium' | 'long';
  created_at: string;
}

// Video types
export interface VideoProject {
  id: string;
  project_id: string;
  script: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output_url?: string;
  processing_progress: number;
  created_at: string;
}

export interface VideoScene {
  id: string;
  video_project_id: string;
  scene_number: number;
  description: string;
  character_id?: string;
  duration: number;
  narration_text: string;
}

export interface Character {
  id: string;
  name: string;
  type: 'teacher' | 'student' | 'robot' | 'cartoon' | 'avatar';
  avatar_url: string;
  voice_id?: string;
  created_at: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  language: 'ar' | 'en' | 'fr' | 'es' | 'de' | 'tr' | 'ru';
  dialect?: string;
  provider: 'elevenlabs' | 'other';
  provider_voice_id: string;
  gender: 'male' | 'female' | 'neutral';
  age_group?: 'child' | 'young' | 'adult' | 'senior';
}

// Credits and subscription types
export interface UserCredits {
  user_id: string;
  total_credits: number;
  available_credits: number;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  operation: 'add' | 'deduct';
  reason: 'subscription' | 'purchase' | 'usage' | 'refund';
  created_at: string;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface Subscription {
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string;
  ends_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  success: boolean;
}

// Auth types
export interface AuthContext {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
