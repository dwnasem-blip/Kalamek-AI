import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface GenerateArticleRequest {
  title: string;
  description: string;
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  language?: string;
  maxWords?: number;
}

interface GenerateArticleResponse {
  success: boolean;
  content?: string;
  wordCount?: number;
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
    const body: GenerateArticleRequest = await req.json();
    const { title, description, tone = 'professional', language = 'ar', maxWords = 500 } = body;

    // Validate inputs
    if (!title || !description) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title and description are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Calculate credits needed (1 credit per 50 words)
    const estimatedCreditsNeeded = Math.ceil((maxWords || 500) / 50);

    if (credits.available_credits < estimatedCreditsNeeded) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Insufficient credits. You need ${estimatedCreditsNeeded} credits but have ${credits.available_credits}`,
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

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
            content: `You are an expert content writer. Create high-quality articles in ${language === 'ar' ? 'Arabic' : 'English'} with a ${tone} tone. Write compelling, informative content that engages readers.`,
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nDescription: ${description}\n\nPlease write an article of approximately ${maxWords} words.`,
          },
        ],
        temperature: 0.7,
        max_tokens: Math.ceil((maxWords || 500) * 1.3),
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0].message.content;
    const wordCount = generatedContent.split(/\s+/).length;
    const creditsUsed = Math.ceil(wordCount / 50);

    // Save article to database
    const { error: insertError } = await supabase
      .from('generated_articles')
      .insert({
        user_id: user.id,
        title: title,
        content: generatedContent,
        word_count: wordCount,
        language: language,
        tone: tone,
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save article');
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        available_credits: credits.available_credits - creditsUsed,
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
        amount: creditsUsed,
        operation: 'deduct',
        reason: 'article_generation',
      });

    const response: GenerateArticleResponse = {
      success: true,
      content: generatedContent,
      wordCount: wordCount,
      creditsUsed: creditsUsed,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const response: GenerateArticleResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
