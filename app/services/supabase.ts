/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants';

if (!API_CONFIG.SUPABASE_URL || !API_CONFIG.SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration. Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

// Initialize Supabase client with AsyncStorage for persistence
export const supabase = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Health check - test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return false;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  } catch (error) {
    console.error('Get current session error:', error);
    return null;
  }
};

/**
 * Project queries
 */
export const projectService = {
  // Get all projects for current user
  getProjects: async (userId: string) => {
    return supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  // Get single project
  getProject: async (projectId: string) => {
    return supabase.from('projects').select('*').eq('id', projectId).single();
  },

  // Create new project
  createProject: async (
    userId: string,
    title: string,
    description?: string,
    language: string = 'ar'
  ) => {
    return supabase.from('projects').insert([
      {
        user_id: userId,
        title,
        description,
        language,
        status: 'draft',
      },
    ]);
  },

  // Update project
  updateProject: async (
    projectId: string,
    updates: Record<string, any>
  ) => {
    return supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    return supabase.from('projects').delete().eq('id', projectId);
  },

  // Toggle favorite
  toggleFavorite: async (projectId: string, isFavorite: boolean) => {
    return supabase
      .from('projects')
      .update({ is_favorite: isFavorite })
      .eq('id', projectId);
  },
};

/**
 * Transcript queries
 */
export const transcriptService = {
  // Get transcript for project
  getTranscript: async (projectId: string) => {
    return supabase
      .from('transcripts')
      .select('*')
      .eq('project_id', projectId)
      .single();
  },

  // Get transcript with words
  getTranscriptWithWords: async (projectId: string) => {
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (transcriptError) return { data: null, error: transcriptError };

    const { data: words, error: wordsError } = await supabase
      .from('transcript_words')
      .select('*')
      .eq('transcript_id', transcript.id)
      .order('word_index', { ascending: true });

    if (wordsError) return { data: null, error: wordsError };

    return {
      data: { ...transcript, words: words || [] },
      error: null,
    };
  },

  // Create transcript
  createTranscript: async (
    projectId: string,
    fullText: string,
    durationMs: number,
    confidenceScore: number
  ) => {
    return supabase.from('transcripts').insert([
      {
        project_id: projectId,
        full_text: fullText,
        duration_ms: durationMs,
        confidence_score: confidenceScore,
        word_count: fullText.split(/\s+/).length,
      },
    ]);
  },

  // Insert words
  insertWords: async (transcriptId: string, words: any[]) => {
    return supabase.from('transcript_words').insert(
      words.map((word, index) => ({
        transcript_id: transcriptId,
        word: word.word,
        word_index: index,
        start_time_ms: word.startTimeMs,
        end_time_ms: word.endTimeMs,
        confidence: word.confidence,
      }))
    );
  },
};

/**
 * Caption queries
 */
export const captionService = {
  // Get captions for transcript
  getCaptions: async (transcriptId: string) => {
    return supabase
      .from('captions')
      .select('*')
      .eq('transcript_id', transcriptId)
      .order('start_time_ms', { ascending: true });
  },

  // Create caption
  createCaption: async (transcriptId: string, caption: any) => {
    return supabase.from('captions').insert([
      {
        transcript_id: transcriptId,
        ...caption,
      },
    ]);
  },

  // Update caption
  updateCaption: async (captionId: string, updates: any) => {
    return supabase
      .from('captions')
      .update(updates)
      .eq('id', captionId);
  },

  // Delete caption
  deleteCaption: async (captionId: string) => {
    return supabase.from('captions').delete().eq('id', captionId);
  },
};

/**
 * Font queries
 */
export const fontService = {
  // Get all active fonts
  getFonts: async (category?: string) => {
    let query = supabase
      .from('fonts')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    return query.order('popularity_score', { ascending: false });
  },

  // Get featured fonts
  getFeaturedFonts: async () => {
    return supabase
      .from('fonts')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(10);
  },

  // Get user favorite fonts
  getUserFavoriteFonts: async (userId: string) => {
    return supabase
      .from('user_favorite_fonts')
      .select('fonts(*)')
      .eq('user_id', userId);
  },

  // Add font to favorites
  addToFavorites: async (userId: string, fontId: string) => {
    return supabase
      .from('user_favorite_fonts')
      .insert([{ user_id: userId, font_id: fontId }]);
  },

  // Remove font from favorites
  removeFromFavorites: async (userId: string, fontId: string) => {
    return supabase
      .from('user_favorite_fonts')
      .delete()
      .eq('user_id', userId)
      .eq('font_id', fontId);
  },
};

/**
 * Storage queries
 */
export const storageService = {
  // Upload file
  uploadFile: async (bucket: string, path: string, file: any) => {
    return supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  },

  // Download file
  downloadFile: async (bucket: string, path: string) => {
    return supabase.storage.from(bucket).download(path);
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    return supabase.storage.from(bucket).remove([path]);
  },
};

export default supabase;
