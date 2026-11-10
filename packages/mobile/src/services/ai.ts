import { supabase } from './supabase';

export interface GenerateArticleParams {
  title: string;
  description: string;
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  language?: string;
  maxWords?: number;
}

export interface SummarizeTextParams {
  text: string;
  summaryLength?: 'short' | 'medium' | 'long';
  language?: string;
  includeKeypoints?: boolean;
}

export interface RewriteTextParams {
  text: string;
  style: 'professional' | 'casual' | 'academic' | 'creative' | 'simple';
  tone?: 'formal' | 'friendly' | 'persuasive' | 'informative';
  language?: string;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generate article using AI
export async function generateArticle(params: GenerateArticleParams): Promise<AIResponse<{
  content: string;
  wordCount: number;
  creditsUsed: number;
}>> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const response = await supabase.functions.invoke('generate-article', {
      body: {
        title: params.title,
        description: params.description,
        tone: params.tone || 'professional',
        language: params.language || 'ar',
        maxWords: params.maxWords || 500,
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to generate article',
      };
    }

    if (!response.data.success) {
      return {
        success: false,
        error: response.data.error || 'Failed to generate article',
      };
    }

    return {
      success: true,
      data: {
        content: response.data.content,
        wordCount: response.data.wordCount,
        creditsUsed: response.data.creditsUsed,
      },
    };
  } catch (error) {
    console.error('Error generating article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Summarize text using AI
export async function summarizeText(params: SummarizeTextParams): Promise<AIResponse<{
  summary: string;
  keypoints?: string[];
  originalWordCount: number;
  summaryWordCount: number;
  creditsUsed: number;
}>> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const response = await supabase.functions.invoke('summarize-text', {
      body: {
        text: params.text,
        summaryLength: params.summaryLength || 'medium',
        language: params.language || 'ar',
        includeKeypoints: params.includeKeypoints || false,
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to summarize text',
      };
    }

    if (!response.data.success) {
      return {
        success: false,
        error: response.data.error || 'Failed to summarize text',
      };
    }

    return {
      success: true,
      data: {
        summary: response.data.summary,
        keypoints: response.data.keypoints,
        originalWordCount: response.data.originalWordCount,
        summaryWordCount: response.data.summaryWordCount,
        creditsUsed: response.data.creditsUsed,
      },
    };
  } catch (error) {
    console.error('Error summarizing text:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Rewrite text using AI
export async function rewriteText(params: RewriteTextParams): Promise<AIResponse<{
  rewrittenText: string;
  originalWordCount: number;
  rewrittenWordCount: number;
  creditsUsed: number;
}>> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const response = await supabase.functions.invoke('rewrite-text', {
      body: {
        text: params.text,
        style: params.style,
        tone: params.tone || 'informative',
        language: params.language || 'ar',
      },
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to rewrite text',
      };
    }

    if (!response.data.success) {
      return {
        success: false,
        error: response.data.error || 'Failed to rewrite text',
      };
    }

    return {
      success: true,
      data: {
        rewrittenText: response.data.rewrittenText,
        originalWordCount: response.data.originalWordCount,
        rewrittenWordCount: response.data.rewrittenWordCount,
        creditsUsed: response.data.creditsUsed,
      },
    };
  } catch (error) {
    console.error('Error rewriting text:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Get user's remaining credits
export async function getUserCredits(): Promise<AIResponse<{
  availableCredits: number;
  usedThisMonth: number;
  totalCredits: number;
}>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch credits',
      };
    }

    return {
      success: true,
      data: {
        availableCredits: data.available_credits,
        usedThisMonth: data.used_this_month || 0,
        totalCredits: data.total_credits,
      },
    };
  } catch (error) {
    console.error('Error fetching credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
