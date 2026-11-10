# WRITEGO - Claude Code Development Guide

**Platform**: AI Content Creation Platform  
**Repository**: https://github.com/dwnasem-blip/Kalamek-AI  
**Current Branch**: `claude/writego-ai-platform-9gc5wc`  
**Status**: Phase 1 - 60% Complete  

---

## 📋 مرحبا في WRITEGO 👋

هذا ملف تكوين Claude Code لمشروع WRITEGO - منصة إنشاء محتوى بالذكاء الاصطناعي.

---

## 🏗️ بنية المشروع

```
Kalamek-AI/
├── packages/
│   ├── mobile/              # تطبيق Expo Go (React Native + TypeScript)
│   │   ├── app/             # Expo Router screens
│   │   │   ├── (auth)/      # Auth screens (login, signup, forgot-password)
│   │   │   ├── (app)/       # App screens (home, writer, summarizer, etc)
│   │   │   └── _layout.tsx  # Root navigation
│   │   ├── src/
│   │   │   ├── services/    # Supabase & API services
│   │   │   ├── store/       # Zustand state management
│   │   │   ├── types/       # TypeScript types
│   │   │   └── styles/      # Styling & theme
│   │   └── package.json
│   ├── admin/               # Admin Dashboard (Next.js) - Future
│   └── shared/              # Shared types & utilities
├── supabase/
│   ├── migrations/          # SQL migrations
│   ├── functions/           # Edge Functions (TypeScript)
│   │   ├── generate-article/
│   │   ├── summarize-text/
│   │   ├── rewrite-text/
│   │   └── README.md
│   └── policies/            # RLS policies
├── docs/                    # Documentation
├── .github/
│   ├── workflows/           # GitHub Actions CI/CD
│   └── PULL_REQUEST_TEMPLATE.md
├── package.json             # Monorepo root
├── README.md
└── CLAUDE.md               # This file

```

---

## 🔧 أهم الأوامر (Essential Commands)

### Mobile App Development

```bash
# Navigate to mobile app
cd packages/mobile

# Install dependencies
npm install

# Start Expo development server
npm run start          # Generic start
npm run start:ios     # iOS emulator
npm run start:android # Android emulator
npm run dev          # Development build (Phase 2)

# Code quality
npm run lint         # ESLint check
npm run format       # Prettier format
npm run type-check   # TypeScript type checking

# Build for deployment (Phase 2)
npm run build:ios    # EAS build for iOS
npm run build:android # EAS build for Android
```

### Root Level

```bash
# From repository root
npm install           # Install all dependencies
npm run type-check   # Check TypeScript across all packages
npm run lint         # Lint all packages
npm run format       # Format all packages
```

### Supabase & Backend

```bash
# Local Supabase development (when set up)
supabase start       # Start local Supabase stack
supabase stop        # Stop local Supabase stack
supabase functions deploy generate-article  # Deploy Edge Function
```

---

## 🔐 Environment Variables

### Mobile App (.env.example)

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# API Keys (when implemented)
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_ELEVENLABS_API_KEY=...
```

**Important**: 
- Never commit `.env` files
- Use `.env.example` as template
- Store sensitive keys in GitHub Secrets for CI/CD

---

## ✨ الأساليب والأفضليات (Patterns & Best Practices)

### TypeScript

- ✅ Strict mode enabled (`strict: true` in tsconfig.json)
- ✅ Use explicit types over `any`
- ✅ Use `interface` for object contracts, `type` for unions/tuples
- ✅ Enable ESLint and Prettier for consistency

### React Native / Expo

- ✅ Use Expo Router for navigation (not React Navigation)
- ✅ Separate UI components from business logic
- ✅ Use Zustand for state management (not Redux)
- ✅ Keep components small and focused

### Backend / Supabase

- ✅ Use RLS (Row Level Security) on all tables
- ✅ Implement Edge Functions for sensitive operations
- ✅ Use JWT for authentication
- ✅ Document all API endpoints and Edge Functions

### Git & Commits

- ✅ Use conventional commits: `type: description`
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation
  - `refactor:` code reorganization
  - `test:` tests
  - `chore:` maintenance
- ✅ Keep commits atomic and focused
- ✅ Write clear commit messages in English
- ✅ Example: `feat: add AsyncStorage integration for session persistence`

---

## 🚀 المرحلة الحالية (Current Phase)

### Phase 1: Expo Go Foundation (60% Complete)

#### ✅ مكتمل
1. Monorepo structure with TypeScript
2. React Native + Expo setup
3. Expo Router navigation
4. Supabase authentication
5. Zustand state management
6. 3 Edge Functions (generate-article, summarize-text, rewrite-text)
7. AsyncStorage integration for session persistence
8. Root navigation with proper auth state handling
9. EAS build configuration
10. GitHub Actions CI/CD workflow
11. PR template

#### 🔄 جاري العمل
- [ ] Supabase project setup & configuration
- [ ] Deploy Edge Functions to live Supabase
- [ ] Test on real iPhone with Expo Go

#### ⏳ القادم (Phase 2+)
- Development Build setup
- UI screens for AI tools (Writer, Summarizer, Rewriter)
- Admin dashboard
- AI Video Studio

---

## 🧪 Testing & Quality Assurance

### Before Pushing

```bash
# 1. Run type checking
npm run type-check

# 2. Run linting
npm run lint

# 3. Run formatter
npm run format

# 4. Test locally
cd packages/mobile
npm start
# Test in Expo Go on your device
```

### GitHub Actions CI/CD

Automated checks on every push to `main` and `claude/**` branches:
- ✅ TypeScript type checking (Node 18.x, 20.x)
- ✅ ESLint code quality
- ✅ Prettier formatting check
- ✅ npm audit security check
- ✅ package.json & tsconfig.json validation

---

## 🔑 Useful Resources

### Official Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://expo.dev/router)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand](https://github.com/pmndrs/zustand)

### Project Documentation
- [`README.md`](./README.md) - Project overview
- [`docs/SETUP.md`](./docs/SETUP.md) - Setup instructions
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - System architecture
- [`docs/EXPO_GO_SETUP.md`](./docs/EXPO_GO_SETUP.md) - Expo Go testing guide
- [`supabase/functions/README.md`](./supabase/functions/README.md) - Edge Functions docs

### GitHub
- [Repository](https://github.com/dwnasem-blip/Kalamek-AI)
- [Issues](https://github.com/dwnasem-blip/Kalamek-AI/issues)
- [Pull Requests](https://github.com/dwnasem-blip/Kalamek-AI/pulls)
- [Discussions](https://github.com/dwnasem-blip/Kalamek-AI/discussions)

---

## 🎯 Branch Strategy

- **`main`**: Stable, production-ready code
  - ✅ Protected branch (requires PR review)
  - ✅ Requires passing CI/CD checks
- **`claude/writego-ai-platform-9gc5wc`**: Development branch
  - Current work-in-progress
  - Synced with main when ready
  - Safe for experimentation

### Workflow

1. Create feature branch from `claude/writego-ai-platform-9gc5wc`
2. Make changes and commit
3. Push to GitHub
4. Create PR to `claude/writego-ai-platform-9gc5wc` or `main`
5. Wait for CI/CD checks
6. Request review
7. Merge when approved

---

## ⚡ Troubleshooting

### Issue: `npm install` fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors after changes
```bash
# Force recheck
npm run type-check -- --force
```

### Issue: Expo Go not connecting
```bash
# Restart dev server
npm start -- --clear

# Make sure device and laptop are on same WiFi
# Or use USB connection for physical device
```

### Issue: Supabase connection fails
```bash
# Verify environment variables in .env
# Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📊 Performance Tips

- Keep components small and focused
- Use `React.memo()` for expensive components
- Lazy load screens with Expo Router
- Minimize bundle size
- Monitor with Expo's built-in tools

---

## 🛡️ Security Checklist

- [ ] Never commit API keys or secrets
- [ ] Always use `.env.example` for template
- [ ] Store secrets in GitHub Secrets for CI/CD
- [ ] Use HTTPS only for API calls
- [ ] Verify RLS policies on all Supabase tables
- [ ] Validate user input on frontend and backend
- [ ] Use JWT tokens for authentication
- [ ] Review dependency vulnerabilities with `npm audit`

---

## 📞 Getting Help

- Check `README.md` for project overview
- Check relevant docs in `docs/` folder
- Review code comments and commit messages
- Check GitHub issues for known problems
- Ask questions in GitHub Discussions

---

## 🎉 الخطوات التالية (Next Steps)

1. ✅ Set up Supabase project (free tier)
2. ✅ Configure environment variables
3. ✅ Test on real iPhone with Expo Go
4. ✅ Deploy Edge Functions
5. ✅ Build AI tool UI screens
6. → Continue with Phase 2 features

---

**Last Updated**: 2026-11-10  
**Status**: Phase 1 - 60% Complete  
**Maintained by**: Claude Code  

---

_This is a Claude Code development guide. For more information about the project, see the main README.md_
