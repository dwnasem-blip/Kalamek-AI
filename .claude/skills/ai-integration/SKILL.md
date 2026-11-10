# AI Integration Skill

## نطاق المهارة
التكامل مع خدمات الذكاء الاصطناعي الخارجية: OpenAI, ElevenLabs, Runway, و D-ID.

## نمط Provider Pattern

### البنية الأساسية
```typescript
// interfaces
interface AIProvider {
  generateText(prompt: string): Promise<string>;
  generateVoice(text: string, config: VoiceConfig): Promise<Buffer>;
  generateVideo(script: Script): Promise<VideoOutput>;
}

// implementations
class OpenAIProvider implements AIProvider { }
class ElevenLabsProvider implements AIProvider { }
class RunwayProvider implements AIProvider { }
```

## OpenAI Integration

### المهام الأساسية

#### 1. توليد النصوص (Text Generation)
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// توليد مقالة
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'user',
      content: 'اكتب مقالة عن: ${title}'
    }
  ],
  temperature: 0.7,
  max_tokens: 2000,
});

const article = response.choices[0].message.content;
```

#### 2. تلخيص النصوص (Summarization)
```typescript
const summary = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'user',
      content: `لخص هذا النص بـ 100 كلمة:\n${text}`
    }
  ],
  max_tokens: 150,
});
```

#### 3. إعادة الصياغة (Rewriting)
```typescript
const rewritten = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'user',
      content: `أعد صياغة هذا النص بأسلوب ${style}:\n${text}`
    }
  ],
});
```

#### 4. توليد السيناريو (Script Generation)
```typescript
const script = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'user',
      content: `حول هذا المحتوى إلى سيناريو فيديو:
        
المحتوى: ${content}

الصيغة المطلوبة:
[
  {
    "sceneNumber": 1,
    "narrationText": "...",
    "description": "...",
    "duration": 10
  }
]`
    }
  ],
  temperature: 0.8,
});
```

## ElevenLabs Integration

### توليد الأصوات
```typescript
import axios from 'axios';

const elevenLabsApi = 'https://api.elevenlabs.io/v1';

async function generateVoice(text: string, voiceId: string) {
  const response = await axios.post(
    `${elevenLabsApi}/text-to-speech/${voiceId}`,
    {
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      responseType: 'arraybuffer',
    }
  );
  
  return response.data; // Audio buffer
}

// استخدام
const audioBuffer = await generateVoice('مرحباً بك', 'voice_id_123');
```

### صوتيات اللغات والهجات
```typescript
const arabicVoices = {
  fus_male: 'XrExE9yKIg1WjnnlVkGP',     // فصحى رجل
  fus_female: 'oWAxZDx7w5VEj9dCyTzz',  // فصحى امرأة
  ems_male: 'Xb7hH8MSUJpSbvxmIgoK',    // إماراتية رجل
  ems_female: 'DXN002xIHmSDNBWQqFVe',  // إماراتية امرأة
  msr_male: 'EXAVITQu7ch7qrWXIIFF',    // مصرية رجل
  msr_female: 'VR6AewLVsFAPc2u7aZ9E',  // مصرية امرأة
};
```

## Runway Integration

### توليد الفيديو
```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateVideo(imageUrl: string, prompt: string) {
  const output = await replicate.run(
    'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51394c716d25e1dd188f6823f3e7e',
    {
      input: {
        image: imageUrl,
        prompt: prompt,
        num_inference_steps: 25,
      },
    }
  );
  
  return output; // Video URL
}
```

## D-ID Integration

### Talking Avatar
```typescript
import axios from 'axios';

const dIdApi = 'https://api.d-id.com/api/v1';

async function createTalkingVideo(script: {
  audio_url: string;
  background_url: string;
}) {
  const response = await axios.post(
    `${dIdApi}/talks`,
    {
      script: {
        type: 'audio',
        audio_url: script.audio_url,
      },
      background: {
        type: 'image',
        image_url: script.background_url,
      },
      presenter_id: 'ava-1', // Avatar ID
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.DID_API_KEY}`,
      },
    }
  );
  
  return response.data.result_url; // Video URL
}
```

## Error Handling

### معالجة الأخطاء الشاملة
```typescript
async function callAIProvider(
  provider: AIProvider,
  task: string,
  params: any
) {
  try {
    const result = await provider[task](params);
    return result;
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limit - retry after delay
      await sleep(5000);
      return callAIProvider(provider, task, params);
    }
    
    if (error.response?.status === 401) {
      // Invalid API key
      throw new Error('Invalid API credentials');
    }
    
    if (error.message.includes('timeout')) {
      // Timeout
      throw new Error('Request timeout - try again');
    }
    
    throw error;
  }
}
```

## Cost Management

### تتبع الاستهلاك
```typescript
interface CostTracking {
  provider: string;
  operation: string;
  inputTokens?: number;
  outputTokens?: number;
  costUSD: number;
  timestamp: Date;
}

// حفظ تتبع التكاليف
async function trackCost(tracking: CostTracking) {
  await supabase
    .from('ai_costs')
    .insert([tracking]);
}

// حساب استهلاك الأرصدة
const calculateCreditsUsed = (cost: number, creditRate: number) => {
  return Math.ceil(cost * creditRate);
};
```

## API Keys Management

### Environment Variables
```bash
# .env (قاعدة وعدم الالتزام)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
RUNWAY_API_TOKEN=...
DID_API_KEY=...
```

### Edge Functions (آمن)
```typescript
// supabase/functions/generate-article/index.ts
const openaiKey = Deno.env.get('OPENAI_API_KEY');
const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');

// استخدم الـ API Keys هنا فقط
```

## Caching & Optimization

### حفظ النتائج
```typescript
// قبل استدعاء API
const cacheKey = `${provider}_${prompt}`;
const cached = await cache.get(cacheKey);

if (cached) {
  return cached;
}

// استدعاء API
const result = await provider.generate(prompt);

// حفظ النتيجة
await cache.set(cacheKey, result, { ttl: 86400 });
return result;
```

## Fallback Strategy

### خطة الرجوع للخلف
```typescript
async function generateWithFallback(
  text: string,
  primaryProvider: AIProvider,
  fallbackProvider: AIProvider
) {
  try {
    return await primaryProvider.generateText(text);
  } catch (error) {
    console.warn('Primary provider failed, trying fallback', error);
    return await fallbackProvider.generateText(text);
  }
}
```

## أفضل الممارسات

✅ **افعل**
- استخدم API rate limits
- احفظ النتائج في cache
- تتبع التكاليف والاستهلاك
- استخدم Edge Functions للمفاتيح
- اختبر مع free tiers أولاً

❌ **لا تفعل**
- لا تضع API keys في الموبايل
- لا تستدعِ API بلا حدود
- لا تنسى معالجة الأخطاء
- لا تستخدم API keys مجاناً في الإنتاج
- لا تتجاهل rate limits

## الموارد

- [OpenAI API](https://platform.openai.com/docs)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [Runway ML](https://runwayml.com/docs)
- [D-ID API](https://docs.d-id.com)

---

**آخر تحديث**: 2026-11-10
