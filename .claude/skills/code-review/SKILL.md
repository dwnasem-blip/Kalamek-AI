# Code Review Skill

## نطاق المهارة
مراجعة جودة الكود قبل الاعتماد وضمان اتباع أفضل الممارسات.

## معايير المراجعة

### 1. TypeScript & Type Safety
```typescript
// ❌ تجنب
const data = await supabase.from('projects').select();
const result = data[0];
console.log(result.title); // قد يكون undefined

// ✅ استخدم types
interface Project {
  id: string;
  title: string;
}

const { data, error } = await supabase
  .from('projects')
  .select('*') as { data: Project[] };

if (data) {
  console.log(data[0].title);
}
```

### 2. Error Handling
```typescript
// ❌ تجنب
async function fetchData() {
  return await supabase.from('users').select();
}

// ✅ صحيح
async function fetchData() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error; // أو return default value
  }
}
```

### 3. Performance
```typescript
// ❌ تجنب - استدعاء متكرر
function MyComponent() {
  return (
    <View>
      {items.map(() => fetchData())} // مشكلة
    </View>
  );
}

// ✅ صحيح - استخدم useEffect
function MyComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return (
    <View>
      {data.map(item => <Item key={item.id} {...item} />)}
    </View>
  );
}
```

### 4. Code Organization
```
✅ الهيكل الصحيح:
services/
├── supabase.ts      # Supabase client
├── api.ts          # API calls
└── auth.ts         # Auth logic

store/
├── authStore.ts
└── projectsStore.ts

components/
├── Button.tsx
├── Card.tsx
└── Form.tsx

// استيراد منظم
import { supabase } from '@services/supabase';
import { useAuthStore } from '@store/authStore';
import { Button } from '@components/Button';
```

### 5. Naming Conventions
```typescript
// ❌ أسماء سيئة
const d = 'data';
const h = () => {};
function get() {}

// ✅ أسماء واضحة
const userData = 'data';
const handleNavigate = () => {};
function getUserProfile() {}

// Rules:
// - Components: PascalCase (MyComponent)
// - Functions: camelCase (myFunction)
// - Constants: UPPER_CASE (MY_CONSTANT)
// - Files: kebab-case (my-file.ts)
```

### 6. DRY Principle (Don't Repeat Yourself)
```typescript
// ❌ تكرار الكود
function getArticles() {
  return supabase.from('articles').select();
}

function getSummaries() {
  return supabase.from('summaries').select();
}

function getProjects() {
  return supabase.from('projects').select();
}

// ✅ اعادة استخدام
function getTableData<T>(table: string) {
  return supabase.from(table).select<T>();
}

const articles = getTableData<Article>('articles');
```

### 7. Comments & Documentation
```typescript
// ❌ تجنب - comments واضحة جداً
i++; // increment i

// ✅ استخدم عند الحاجة - شرح المنطق
// حساب الأرصدة المستهلكة مع ضريبة 10%
const totalCost = baseCost * 1.1;

// ✅ استخدم JSDoc للـ functions
/**
 * تحويل النص إلى فيديو
 * @param text - النص المراد تحويله
 * @param characterId - معرف الشخصية
 * @returns رابط الفيديو النهائي
 */
async function textToVideo(
  text: string,
  characterId: string
): Promise<string> {
  // implementation
}
```

### 8. Testing
```typescript
// قبل الـ merge يجب:
// ✅ اختبار الوظيفة الجديدة
// ✅ اختبار الحالات الخاصة (edge cases)
// ✅ اختبار الأخطاء
// ✅ عدم توجد console errors

// مثال اختبار:
describe('generateArticle', () => {
  it('should return article when valid input', async () => {
    const result = await generateArticle('Title', 'Description');
    expect(result).toBeDefined();
  });
  
  it('should throw error when title is empty', async () => {
    expect(
      async () => await generateArticle('', 'Description')
    ).rejects.toThrow();
  });
});
```

## قائمة فحص المراجعة

### Before Merge
- [ ] **Functionality**: هل تعمل الميزة كما متوقع؟
- [ ] **Code Quality**: هل الكود نظيف وسهل القراءة؟
- [ ] **Types**: هل يوجد TypeScript types صحيحة؟
- [ ] **Error Handling**: هل معالجة الأخطاء كافية؟
- [ ] **Performance**: هل هناك مشاكل أداء؟
- [ ] **Security**: هل البيانات الحساسة محمية؟
- [ ] **Testing**: هل الوظيفة مختبرة؟
- [ ] **Documentation**: هل هناك توثيق كافي؟
- [ ] **No Console Errors**: هل لا توجد تحذيرات أو أخطاء؟
- [ ] **Git**: هل الـ commits منظمة؟

### Common Issues

#### 1. Props Drilling
```typescript
// ❌ تجنب
<Component prop1={prop1} prop2={prop2} prop3={prop3} />

// ✅ استخدم context أو zustand
const { prop1, prop2, prop3 } = useStore();
```

#### 2. Memory Leaks
```typescript
// ❌ تجنب
useEffect(() => {
  const subscription = subscribeToData();
  // نسيان cleanup
}, []);

// ✅ صحيح
useEffect(() => {
  const subscription = subscribeToData();
  return () => subscription.unsubscribe();
}, []);
```

#### 3. Async/Await Issues
```typescript
// ❌ تجنب
useEffect(() => {
  async function load() {
    setData(await fetchData());
  }
  load(); // race conditions
}, []);

// ✅ صحيح
useEffect(() => {
  let mounted = true;
  
  (async () => {
    const data = await fetchData();
    if (mounted) setData(data);
  })();
  
  return () => { mounted = false; };
}, []);
```

## معايير الرفض (Red Flags)

🚨 سيتم رفض الـ PR إذا كانت فيها:

```
- [ ] لا توجد tests
- [ ] console.log أو console.error بكثرة
- [ ] API keys مكشوفة
- [ ] لا توجد error handling
- [ ] code duplication كبيرة
- [ ] type errors
- [ ] performance issues واضحة
- [ ] لا توجد توثيق للـ API الجديدة
- [ ] commits غير منظمة
- [ ] لم تتم إضافة .env للـ .gitignore
```

## عملية المراجعة

### الخطوات
1. **فهم الهدف**: اقرأ PR description
2. **فحص الملفات**: انظر للملفات المتغيرة
3. **قراءة الكود**: افهم المنطق
4. **اختبر محلياً**: شغّل الكود وجرّبه
5. **ركز على الأمان**: تحقق من الثغرات
6. **أرسل comments**: اذكر المشاكل بوضوح

### كيفية الـ Comment
```
❌ "هذا خطأ"
✅ "هنا نحتاج type annotation. استخدم:
   const data: Project[] = ..."

❌ "سيء جداً"
✅ "هذه الدالة تستدعي supabase 3 مرات في كل render
   يمكن تحسينها باستخدام useCallback"
```

## أفضل الممارسات

✅ **افعل**
- اقرأ الكود بعناية
- جرّب الميزة بنفسك
- اطلب الإصلاحات بوضوح
- شجّع الأفكار الجديدة
- وافق بسرعة على الكود الجيد

❌ **لا تفعل**
- لا تكن قاسياً
- لا تنتقد الأسلوب الشخصي
- لا تقبل الكود السيء
- لا تنسى اختبار الأخطاء
- لا تتجاهل الثغرات الأمنية

## الموارد

- [Google Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

---

**آخر تحديث**: 2026-11-10
