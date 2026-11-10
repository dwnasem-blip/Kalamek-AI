# Mobile App Development Skill

## نطاق المهارة
تطوير تطبيقات الموبايل باستخدام React Native و Expo و TypeScript مع أفضل الممارسات.

## التقنيات المستخدمة
- **React Native** - Framework لتطوير الموبايل
- **Expo** - مجموعة أدوات لـ React Native
- **Expo Router** - نظام الملاحة والتوجيه
- **TypeScript** - لضمان Type Safety
- **Zustand** - إدارة الحالة (State Management)
- **React Native Paper** - مكتبة UI components

## المسؤوليات

### تطوير الشاشات
- إنشاء شاشات جديدة مع Expo Router
- استخدام نمط المجموعات (Groups) للملاحة (`(auth)`, `(app)`)
- تطبيق Tab Navigation و Stack Navigation

### إدارة الحالة
- استخدام Zustand stores للحالة العالمية
- إنشاء custom hooks للمنطق المشترك
- تحديث state بشكل يقظ (reactive updates)

### الأداء والتحسينات
- تحسين render performance
- استخدام `React.memo` للمكونات الثقيلة
- تجنب re-renders غير الضرورية

### التعامل مع النماذج
- بناء forms احترافية
- التحقق من البيانات (Validation)
- معالجة الأخطاء

### التصميم والـ UI
- اتباع Material Design principles
- دعم الوضع الداكن والفاتح
- استجابة للأجهزة المختلفة

## الممارسات الأساسية

### البنية المشروع
```
packages/mobile/
├── app/                 # Expo Router screens
├── src/
│   ├── components/      # Re-usable components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API calls
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
└── __tests__/           # Test files
```

### معايير الكود
- TypeScript strict mode
- Function components فقط (Hooks)
- لا استخدام Class components
- أسماء واضحة ومعنية
- Custom hooks لإعادة الاستخدام

### الملاحة
```typescript
// استخدام Expo Router
import { useRouter, Link } from 'expo-router';

// Tab Navigation
<Tabs>
  <Tabs.Screen name="index" />
  <Tabs.Screen name="settings" />
</Tabs>

// Screen Linking
router.push('/(app)/writer');
<Link href="/(auth)/login">Login</Link>
```

### State Management
```typescript
// Zustand store pattern
import { create } from 'zustand';

export const useStore = create((set) => ({
  state: value,
  action: () => set({ state: newValue })
}));

// استخدام في Components
const { state, action } = useStore();
```

## الخطوات المعتادة

### عند إنشاء شاشة جديدة
1. أنشئ ملف في `app/(group)/screen-name.tsx`
2. استخدم TypeScript types من `src/types/`
3. استخدم Zustand stores للحالة
4. أضف استدعاءات API عند الحاجة
5. اختبر على أجهزة فعلية

### عند إضافة ميزة جديدة
1. حدد الحالة المطلوبة
2. أنشئ Zustand store إن لزم
3. بناء المكونات (Components)
4. أضف الخدمات (Services)
5. اختبر شاملاً

### عند معالجة الأخطاء
```typescript
try {
  const data = await fetchData();
} catch (error) {
  console.error('Error:', error);
  Alert.alert('خطأ', error.message);
  // Handle error gracefully
}
```

## أدوات مفيدة

### Debugging
```bash
# React DevTools
npx react-devtools

# Expo DevTools
npm run dev -- --dev-client
```

### Performance Profiling
- استخدام React DevTools Profiler
- قياس render times
- تحسين slowest components

### Testing
```bash
# Run tests
npm run test -- packages/mobile

# Watch mode
npm run test -- packages/mobile --watch
```

## أفضل الممارسات

✅ **افعل**
- استخدم TypeScript لكل شيء
- اكتب types واضحة
- استخدم custom hooks
- اختبر على أجهزة حقيقية
- قلل bundle size

❌ **لا تفعل**
- لا تضع logic في JSX
- لا تنسخ وألصق الكود
- لا تستخدم magic strings
- لا تتجاهل type errors
- لا تنسى في performance

## الموارد

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Expo Router Guide](https://expo.dev/router)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## الأسئلة الشائعة

**س: هل نستخدم Class Components؟**
ج: لا، فقط Function Components مع Hooks

**س: كيف نتعامل مع الملاحة المعقدة؟**
ج: استخدم Expo Router مع nested routing

**س: كيف نشارك المنطق بين الشاشات؟**
ج: استخدم custom hooks أو Zustand stores

---

**آخر تحديث**: 2026-11-10
