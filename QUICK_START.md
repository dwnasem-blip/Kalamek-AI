# WRITEGO AI Platform - Quick Start Guide

## 🎯 What's Ready Now

✅ **Complete**:
- Mobile app structure (React Native + Expo)
- Database schema and migrations
- Authentication system
- 3 Edge Functions (Article, Summarize, Rewrite)
- AI service layer
- 10 Claude Code skills
- Comprehensive documentation

## 🚀 Quick Setup (Next Steps)

### Step 1: Create Supabase Project (5 min)
```
1. Go to https://supabase.com
2. Click "New Project"
3. Choose free tier
4. Wait for project to initialize
5. Copy your project URL and API keys
```

### Step 2: Set Environment Variables (2 min)

**In `packages/mobile/.env`:**
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**In Supabase Dashboard → Settings → Edge Functions Secrets:**
```
OPENAI_API_KEY=sk-... (get from https://openai.com/api/)
```

### Step 3: Apply Database Schema (3 min)

```bash
cd supabase
supabase link --project-ref your-project-ref
supabase db push
```

### Step 4: Deploy Edge Functions (5 min)

```bash
supabase functions deploy generate-article
supabase functions deploy summarize-text
supabase functions deploy rewrite-text
```

### Step 5: Test the Setup (10 min)

```bash
cd packages/mobile
npm install
npm run dev
```

Then:
1. Signup with test email
2. Login
3. Try generating an article
4. Check credits were deducted

## 📁 Project Structure

```
Kalamek-AI/
├── packages/
│   ├── mobile/                 # React Native app
│   │   ├── app/               # Expo Router screens
│   │   ├── src/
│   │   │   ├── services/      # AI, Supabase services
│   │   │   ├── store/         # Zustand state
│   │   │   └── types/         # TypeScript types
│   │   └── package.json
│   └── admin/                 # (Coming next)
│
├── supabase/
│   ├── migrations/            # Database schema
│   ├── functions/             # Edge Functions
│   │   ├── generate-article/
│   │   ├── summarize-text/
│   │   └── rewrite-text/
│   └── policies/              # RLS policies
│
├── docs/                      # Documentation
├── .claude/
│   └── skills/               # 10 specialized skills
└── README.md
```

## 🔑 Important Files

### Mobile App
- `app/_layout.tsx` - Root navigation
- `src/services/ai.ts` - AI operations
- `src/services/supabase.ts` - Supabase client
- `src/store/authStore.ts` - Auth state

### Backend
- `supabase/migrations/001_initial_schema.sql` - Database
- `supabase/functions/*/index.ts` - Edge Functions
- `supabase/README.md` - Functions documentation

### Documentation
- `docs/SETUP.md` - Detailed setup
- `docs/ARCHITECTURE.md` - System design
- `docs/PHASE_1_IMPLEMENTATION.md` - Current phase details
- `docs/NEXT_STEPS.md` - Future roadmap

## 🛠️ Available Commands

```bash
# Development
npm install           # Install dependencies
npm run dev          # Start dev server
npm run lint         # Check code
npm run type-check   # TypeScript check

# Supabase
supabase login       # Login to Supabase
supabase link        # Link project
supabase functions deploy    # Deploy functions
supabase functions log       # View logs
```

## 🧪 Testing

### Test Authentication
```typescript
// Login → signup → logout
1. Open app
2. Signup with test@example.com / password
3. Try logging out
4. Try logging in again
```

### Test AI Functions
```typescript
// Generate article
1. Login
2. Go to Writer tab
3. Enter title and description
4. Click Generate
5. Verify credits deducted
```

## ⚠️ Important Security Notes

✅ **Correct**:
- API keys in Supabase secrets
- .env.example in git
- .env in .gitignore
- JWT tokens for auth
- RLS policies enabled

❌ **Never Do**:
- Commit API keys
- Put keys in client code
- Use HTTP (always HTTPS)
- Trust client-side validation alone
- Skip RLS policies

## 📊 Current Progress

| Phase | Status | Tasks |
|-------|--------|-------|
| Phase 0 | ✅ 100% | Foundation complete |
| Phase 1 | 🔄 45% | Edge Functions done, awaiting Supabase setup |
| Phase 2 | ⏳ 0% | UI & Testing |
| Phase 3 | ⏳ 0% | Admin Dashboard |
| Phase 4 | ⏳ 0% | Video Studio |

## 📱 Next Features

After setup testing:
1. **AI Writer** - Full UI and testing
2. **AI Summarizer** - Full UI and testing
3. **AI Rewriter** - Full UI and testing
4. **Settings & Profile** - User preferences
5. **Credit Purchase** - RevenueCat integration

## 🆘 Troubleshooting

**Problem**: "Cannot connect to Supabase"
- Check SUPABASE_URL is correct
- Check ANON_KEY is valid
- Ensure network connection

**Problem**: "Insufficient credits"
- Check user_credits table
- Verify subscription active
- Check credit deduction logic

**Problem**: "OpenAI API error"
- Check OPENAI_API_KEY is set
- Verify API key is valid
- Check rate limits

**Problem**: "JWT token expired"
- Logout and login again
- Check Supabase session
- Verify auth flow

## 📚 Learning Resources

- **React Native**: https://reactnative.dev
- **Expo**: https://docs.expo.dev
- **TypeScript**: https://www.typescriptlang.org
- **Supabase**: https://supabase.com/docs
- **OpenAI**: https://platform.openai.com/docs

## 🎯 Success Criteria

When Phase 1 is complete, you should be able to:
- ✅ Login/Signup
- ✅ Generate articles with credits deducted
- ✅ Summarize texts
- ✅ Rewrite text
- ✅ View remaining credits
- ✅ See transaction history

## 🚀 Ready to Start?

1. Read `docs/SETUP.md` for detailed instructions
2. Create Supabase project
3. Follow setup steps above
4. Check `docs/PHASE_1_IMPLEMENTATION.md` for details

---

**Questions?** Check the docs in `/docs/` folder.

**Need help?** Refer to the comprehensive documentation and Claude Code skills.

**Ready for next phase?** All files are structured for easy expansion.
