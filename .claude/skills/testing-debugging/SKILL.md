# Testing & Debugging Skill

## نطاق المهارة
اختبار التطبيق واكتشاف وإصلاح الأخطاء بكفاءة.

## أنواع الاختبارات

### 1. Unit Tests
```typescript
// packages/mobile/__tests__/store/authStore.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@store/authStore';

describe('authStore', () => {
  it('should sign up user', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.signUp(
        'test@example.com',
        'password123',
        'testuser'
      );
    });
    
    expect(result.current.isSignedIn).toBe(true);
  });
});
```

### 2. Integration Tests
```typescript
// اختبار تكامل Supabase مع التطبيق
describe('Supabase Integration', () => {
  it('should fetch user profile', async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    expect(data.email).toBeDefined();
  });
});
```

### 3. Component Tests
```typescript
import { render, screen } from '@testing-library/react-native';
import LoginScreen from '@app/(auth)/login';

describe('LoginScreen', () => {
  it('renders input fields', () => {
    render(<LoginScreen />);
    
    expect(screen.getByPlaceholderText('البريد الإلكتروني')).toBeDefined();
    expect(screen.getByPlaceholderText('كلمة المرور')).toBeDefined();
  });
});
```

## Debugging Tools

### React DevTools
```bash
npx react-devtools

# في التطبيق
npm run dev -- --dev-client
```

### Expo DevTools
```bash
# Debug باستخدام Expo
npm run dev -- --inspector
```

### Console Logging
```typescript
// استخدم console بحذر
console.log('Debug info:', data);
console.warn('Warning:', issue);
console.error('Error:', error);

// بدلاً من console في الإنتاج:
import { logError } from '@utils/logger';
logError('Error occurred', error);
```

## أدوات البحث عن الأخطاء

### Network Debugging
```bash
# استخدم Supabase SQL Editor للاختبار
# أو استخدم curl:
curl -X GET 'https://your-project.supabase.co/rest/v1/projects' \
  -H "apikey: $SUPABASE_ANON_KEY"
```

### Performance Profiling
```typescript
// قياس الأداء
console.time('fetchData');
const data = await fetchUserData();
console.timeEnd('fetchData');
```

## استراتيجيات الاختبار

### قبل الالتزام (Pre-commit)
```bash
npm run lint      # فحص الكود
npm run type-check  # تحقق من Types
npm run test      # اختبر
```

### الاختبار اليدوي
1. اختبر على الهاتف الفعلي
2. اختبر الملاحة الكاملة
3. اختبر عند بطء الإنترنت
4. اختبر مع تعطل الشبكة
5. اختبر مع بطارية منخفضة

## معالجة الأخطاء الشائعة

### خطأ: "Cannot find module"
```bash
# الحل:
rm -rf node_modules
npm install

# أو:
npm ci  # clean install
```

### خطأ: "Permission denied"
```bash
# تحقق من الأذونات
chmod +x ./scripts/build.sh

# أو في Supabase RLS
# تأكد من Policies صحيحة
```

### خطأ: "Network timeout"
```typescript
// أضف retry logic
async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < maxRetries - 1) {
        await sleep(1000 * (i + 1)); // exponential backoff
      } else {
        throw error;
      }
    }
  }
}
```

## أفضل الممارسات

✅ افعل:
- اختبر محلياً قبل الـ push
- استخدم TypeScript strict mode
- أضف error boundaries
- log الأخطاء المهمة
- اختبر edge cases

❌ لا تفعل:
- لا تتجاهل Type errors
- لا تستخدم console.log في الإنتاج
- لا تنسى اختبار الأخطاء
- لا تستخدم magic strings
- لا تصدر الأخطاء للمستخدم مباشرة

---

**آخر تحديث**: 2026-11-10
