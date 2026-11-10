# UI/UX Design Skill

## نطاق المهارة
تصميم واجهات مستخدم احترافية، متجاوبة، مع دعم كامل للعربية (RTL) والإنجليزية (LTR).

## التقنيات المستخدمة
- **React Native** - للعناصر الأساسية
- **React Native Paper** - Material Design components
- **StyleSheet API** - للأنماط
- **Flexbox** - للتخطيط (Layout)
- **i18n** - للتوطين (Localization)

## المبادئ التصميمية

### 1. التجربة المستخدم (UX)
- **Intuitiveness** - واجهات سهلة الفهم
- **Consistency** - تصميم موحد في التطبيق
- **Feedback** - استجابة واضحة للتفاعلات
- **Performance** - تطبيق سريع الاستجابة
- **Accessibility** - accessible لجميع المستخدمين

### 2. المبادئ البصرية (UI)
- **Color Harmony** - ألوان متناسقة
- **Typography** - نوع خط واضح وقابل للقراءة
- **Spacing** - مسافات متسقة
- **Icons** - رموز واضحة ومفهومة
- **Contrast** - تباين كافي للقراءة

## نظام الألوان

### Primary Colors
```typescript
const colors = {
  primary: '#2563eb',      // أزرق (العمل الرئيسي)
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
};
```

### Semantic Colors
```typescript
const semanticColors = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#0ea5e9',
};
```

### Neutral Colors
```typescript
const neutralColors = {
  white: '#ffffff',
  light: '#f5f5f5',
  gray: '#9ca3af',
  dark: '#1f2937',
  black: '#000000',
};
```

### Dark Mode
```typescript
// Light theme
const lightTheme = {
  background: '#ffffff',
  text: '#000000',
  border: '#e5e7eb',
};

// Dark theme
const darkTheme = {
  background: '#1f2937',
  text: '#ffffff',
  border: '#374151',
};
```

## Typography

### Font Sizes
```typescript
const fontSize = {
  xs: 12,    // Small text
  sm: 14,    // Body text
  base: 16,  // Default
  lg: 18,    // Large
  xl: 20,    // Extra large
  '2xl': 24, // Headings
  '3xl': 32, // Main headings
};
```

### Font Weights
```typescript
const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

## Layout & Spacing

### Spacing System
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};
```

### Responsive Design
```typescript
// Mobile-first approach
const responsiveStyle = {
  // Mobile (< 600px)
  padding: 12,
  
  // Tablet (600px - 900px)
  // يتم التعامل معه عند الحاجة
  
  // Web (> 900px)
  // يتم التعامل معه عند الحاجة
};
```

## دعم العربية (RTL)

### استخدام I18nManager
```typescript
import { I18nManager } from 'react-native';
import { create } from 'zustand';

export const useLocaleStore = create((set) => ({
  locale: 'ar',
  isRTL: true,
  setLocale: (locale) => {
    I18nManager.forceRTL(locale === 'ar');
    set({ locale, isRTL: locale === 'ar' });
  },
}));
```

### Flexbox مع RTL
```typescript
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Flexbox تتعامل تلقائياً مع RTL
  },
  
  // لا تستخدم marginLeft/marginRight
  // استخدم marginStart/marginEnd
  item: {
    marginStart: 12,
    marginEnd: 12,
  },
});
```

### Alignment مع RTL
```typescript
// ❌ تجنب
marginLeft: 16
paddingRight: 12
alignItems: 'flex-start'

// ✅ استخدم
marginStart: 16
paddingEnd: 12
alignItems: Platform.OS === 'android' ? 'flex-start' : 'flex-end'
```

## Component Library (React Native Paper)

### الاستخدام الأساسي
```typescript
import { Button, TextInput, Card } from 'react-native-paper';

// Button
<Button mode="contained">اضغط هنا</Button>
<Button mode="outlined">إلغاء</Button>

// TextInput
<TextInput label="البريد الإلكتروني" mode="outlined" />

// Card
<Card>
  <Card.Content>
    محتوى البطاقة
  </Card.Content>
</Card>
```

## نماذج تصميمية (Design Patterns)

### Card Component
```typescript
const CardTemplate = ({ title, content, onPress }) => (
  <Card style={styles.card}>
    <Card.Content>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </Card.Content>
    <Card.Actions>
      <Button onPress={onPress}>تفاصيل</Button>
    </Card.Actions>
  </Card>
);
```

### Form Input
```typescript
const FormInput = ({ label, value, onChangeText, error }) => (
  <View>
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      error={!!error}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);
```

### Loading Indicator
```typescript
const LoadingIndicator = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color="#2563eb" />
  </View>
);
```

## Animations & Transitions

### Simple Animation
```typescript
import { Animated } from 'react-native';

const fadeIn = new Animated.Value(0);

Animated.timing(fadeIn, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,
}).start();

<Animated.View style={{ opacity: fadeIn }}>
  المحتوى
</Animated.View>
```

## Screen Layouts

### Full Screen Layout
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
```

## أفضل الممارسات

✅ **افعل**
- استخدم StyleSheet API (للأداء)
- استخدم flexbox للتخطيط
- اختبر على أجهزة حقيقية
- استخدم consistent spacing
- استخدم RTL-safe properties
- اختبر Dark Mode

❌ **لا تفعل**
- لا تستخدم absolute positioning بكثرة
- لا تنسى RTL
- لا تستخدم ألوان hardcoded
- لا تستخدم margin/padding غير متسقة
- لا تتجاهل accessibility

## الموارد

- [React Native Styling](https://reactnative.dev/docs/style)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Material Design](https://material.io/design)
- [RTL Guidelines](https://material.io/design/platform-guidance/android-bars.html)

---

**آخر تحديث**: 2026-11-10
