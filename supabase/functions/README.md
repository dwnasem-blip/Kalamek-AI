# Supabase Edge Functions

This directory contains all Supabase Edge Functions that power the WRITEGO AI platform. These are serverless functions that run on Supabase infrastructure and handle all sensitive AI operations.

## Why Edge Functions?

- 🔒 **Security**: API keys are stored only on the server, not in the client app
- ⚡ **Performance**: Runs close to your database
- 💰 **Cost**: Reduces client-side overhead
- 🔐 **Authorization**: Built-in JWT verification

## Available Functions

### 1. `generate-article` - AI Article Writer

Generate high-quality articles using OpenAI.

**Request:**
```typescript
POST /functions/v1/generate-article

{
  "title": "Article Title",
  "description": "Brief description or topic",
  "tone": "professional" | "casual" | "academic" | "creative",
  "language": "ar" | "en",
  "maxWords": 500
}
```

**Response:**
```typescript
{
  "success": true,
  "content": "Generated article text...",
  "wordCount": 487,
  "creditsUsed": 10
}
```

**Credits:** 1 credit per 50 words

### 2. `summarize-text` - AI Text Summarizer

Summarize long texts and optionally extract keypoints.

**Request:**
```typescript
POST /functions/v1/summarize-text

{
  "text": "Long text to summarize...",
  "summaryLength": "short" | "medium" | "long",
  "language": "ar" | "en",
  "includeKeypoints": true | false
}
```

**Response:**
```typescript
{
  "success": true,
  "summary": "Summarized text...",
  "keypoints": ["Key point 1", "Key point 2", ...],
  "originalWordCount": 1200,
  "summaryWordCount": 150,
  "creditsUsed": 12
}
```

**Credits:** 1 credit per 100 words of original text

### 3. `rewrite-text` - AI Text Rewriter

Rewrite text in a specific style and tone.

**Request:**
```typescript
POST /functions/v1/rewrite-text

{
  "text": "Text to rewrite...",
  "style": "professional" | "casual" | "academic" | "creative" | "simple",
  "tone": "formal" | "friendly" | "persuasive" | "informative",
  "language": "ar" | "en"
}
```

**Response:**
```typescript
{
  "success": true,
  "rewrittenText": "Rewritten text...",
  "originalWordCount": 200,
  "rewrittenWordCount": 210,
  "creditsUsed": 5
}
```

**Credits:** 1 credit per 50 words

## Setup Instructions

### 1. Set Environment Variables

Configure the following secrets in your Supabase project:

```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to set them:**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Click **Create new secret**
4. Add each environment variable

### 2. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy generate-article
supabase functions deploy summarize-text
supabase functions deploy rewrite-text
```

### 3. Test Functions

```bash
# Get your JWT token from auth
supabase functions invoke generate-article \
  --body '{
    "title": "Test Article",
    "description": "A test description"
  }' \
  --headers "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Authentication

All Edge Functions require a valid JWT token from Supabase Auth:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use in function call
const response = await supabase.functions.invoke('generate-article', {
  body: { title: '...' },
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Error Handling

All functions return consistent error responses:

```typescript
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Invalid request parameters
- `401`: Unauthorized or invalid token
- `402`: Insufficient credits
- `500`: Server error

## Credit System

Each operation consumes credits based on text processing:

| Operation | Credits | Unit |
|-----------|---------|------|
| Article Generation | 1 | per 50 words |
| Text Summarization | 1 | per 100 words |
| Text Rewriting | 1 | per 50 words |

Credits are automatically deducted from the user's account and logged in the `credit_transactions` table.

## Database Tables

These functions interact with:

- `user_credits`: Stores user's available credits
- `credit_transactions`: Logs all credit operations
- `generated_articles`: Stores generated articles
- `summaries`: Stores text summaries
- `rewrites`: Stores rewritten texts

## Security Considerations

✅ **Implemented:**
- JWT token verification on all functions
- User isolation (each user can only access their own data)
- Credit validation before processing
- API key stored server-side only
- CORS headers configured
- Input validation

⚠️ **Important:**
- Never expose API keys in client code
- Always verify JWT tokens
- Use RLS policies on all tables
- Log all transactions for audit trail
- Rate limit functions if needed

## Monitoring

Check function execution logs:

```bash
supabase functions list

# View logs
supabase functions log generate-article --tail
```

## Future Functions

Planned additions:
- `generate-social-content` - Social media post generation
- `generate-video-script` - Script generation for video
- `process-video` - Video rendering and composition
- `generate-voice` - Voice synthesis integration

## Support

For issues or questions, refer to:
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [OpenAI API Docs](https://platform.openai.com/docs)
- Project documentation in `/docs/`

---

**Last Updated:** 2026-11-10
