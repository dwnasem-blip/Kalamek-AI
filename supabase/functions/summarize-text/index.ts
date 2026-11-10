import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface SummarizeTextRequest {
  text: string;
  summaryLength?: 'short' | 'medium' | 'long'; // short: 50 words, medium: 100 words, long: 200 words
  language?: string;
  includeKeypoints?: boolean;
}

interface SummarizeTextResponse {
  success: boolean;
  summary?: string;
  keypoints?: string[];
  originalWordCount?: number;
  summaryWordCount?: number;
  creditsUsed?: number;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
        },
      });
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: SummarizeTextRequest = await req.json();
    const {
      text,
      summaryLength = 'medium',
      language = 'ar',
      includeKeypoints = false,
    } = body;

    // Validate inputs
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate word count
    const originalWordCount = text.split(/\s+/).length;

    // Set summary length
    const summaryLengthMap = {
      short: 50,
      medium: 100,
      long: 200,
    };
    const targetLength = summaryLengthMap[summaryLength];

    // Check user credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('available_credits')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !credits) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check credits' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate credits needed (1 credit per 100 words of original text)
    const creditsNeeded = Math.ceil(originalWordCount / 100);

    if (credits.available_credits < creditsNeeded) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Insufficient credits. You need ${creditsNeeded} credits but have ${credits.available_credits}`,
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = includeKeypoints
      ? `You are an expert summarizer. Summarize the following text in ${language === 'ar' ? 'Arabic' : 'English'} in approximately ${targetLength} words. Also provide 3-5 key points as a bullet list.`
      : `You are an expert summarizer. Summarize the following text in ${language === 'ar' ? 'Arabic' : 'English'} in approximately ${targetLength} words.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.5,
        max_tokens: targetLength * 2,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedSummary = openaiData.choices[0].message.content;
    const summaryWordCount = generatedSummary.split(/\s+/).length;

    // Extract keypoints if requested
    let keypoints: string[] = [];
    if (includeKeypoints) {
      const lines = generatedSummary.split('\n');
      keypoints = lines
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[•\-]\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // Save summary to database
    const { error: insertError } = await supabase
      .from('summaries')
      .insert({
        user_id: user.id,
        original_text: text,
        summary: generatedSummary,
        original_word_count: originalWordCount,
        summary_word_count: summaryWordCount,
        language: language,
        summary_length: summaryLength,
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save summary');
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        available_credits: credits.available_credits - creditsNeeded,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Credit deduction error:', updateError);
      throw new Error('Failed to deduct credits');
    }

    // Log transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: creditsNeeded,
        operation: 'deduct',
        reason: 'text_summarization',
      });

    const response: SummarizeTextResponse = {
      success: true,
      summary: generatedSummary,
      keypoints: keypoints,
      originalWordCount: originalWordCount,
      summaryWordCount: summaryWordCount,
      creditsUsed: creditsNeeded,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const response: SummarizeTextResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
