# RevenueCat Payments Skill

## نطاق المهارة
إدارة الاشتراكات المدفوعة ونظام الأرصدة باستخدام RevenueCat.

## مقدمة RevenueCat

### الفوائد
- إدارة اشتراكات موحدة (iOS + Android)
- معالجة الدفع الآمنة
- تقارير متقدمة
- تكامل سهل

## التثبيت والإعداد

### التثبيت
```bash
npm install react-native-purchases
```

### التهيئة
```typescript
import Purchases from 'react-native-purchases';

// في app startup
const PurchasesConfiguration = await Purchases.configure({
  apiKey: 'your_public_api_key', // من RevenueCat Dashboard
});

// للـ Development
await Purchases.setUp({
  apiKeys: {
    android: 'your_android_api_key',
    ios: 'your_ios_api_key',
  },
});
```

## نموذج الاشتراكات

### الخطط المتاحة
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
}

const plans: SubscriptionPlan[] = [
  {
    id: 'writego_free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '500 credits/month',
      'Limited tools',
      '1 character',
    ],
  },
  {
    id: 'writego_basic',
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '5,000 credits/month',
      'All text tools',
      '5 characters',
      'Email support',
    ],
  },
  {
    id: 'writego_pro',
    name: 'Pro',
    price: 29.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '∞ credits',
      'All tools including video',
      'All characters',
      'Priority support',
      '4K export',
    ],
  },
];
```

## عمليات الاشتراك

### الحصول على المنتجات
```typescript
async function fetchSubscriptions() {
  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null) {
      // عرض الخطط للمستخدم
      offerings.current.availablePackages.forEach(package => {
        console.log(`${package.identifier}: ${package.packageType}`);
      });
      
      return offerings.current;
    }
  } catch (error) {
    console.error('Error fetching offerings:', error);
  }
}
```

### الشراء (Purchasing)
```typescript
async function purchaseSubscription(packageId: string) {
  try {
    const offerings = await Purchases.getOfferings();
    const package = offerings.current?.availablePackages
      .find(pkg => pkg.identifier === packageId);
    
    if (package) {
      const { customerInfo } = await Purchases.purchasePackage(package);
      
      // تحديث الـ subscription في Supabase
      await updateUserSubscription(customerInfo);
      
      return true;
    }
  } catch (error) {
    console.error('Purchase error:', error);
    return false;
  }
}
```

### استعادة الشراء (Restore Purchase)
```typescript
async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();
    
    // تحديث الـ subscription
    await updateUserSubscription(customerInfo);
    
    return customerInfo;
  } catch (error) {
    console.error('Restore error:', error);
  }
}
```

## التحقق من الاشتراك

### الحصول على معلومات الاشتراك
```typescript
async function getSubscriptionStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    
    // التحقق من الاشتراكات النشطة
    const activeSubscriptions = customerInfo.activeSubscriptions;
    
    // الحصول على معلومات الاشتراك
    const entitlements = customerInfo.entitlements;
    
    if (entitlements.active['pro'].isActive) {
      return 'pro';
    } else if (entitlements.active['basic'].isActive) {
      return 'basic';
    } else {
      return 'free';
    }
  } catch (error) {
    console.error('Error getting subscription:', error);
    return 'free';
  }
}
```

### Listener للتحديثات
```typescript
import { customerInfoUpdateEmitter } from 'react-native-purchases';

// الاستماع للتغييرات
const subscription = customerInfoUpdateEmitter.addEventListener(
  'customerInfoUpdated',
  (customerInfo) => {
    // حدث تغيير في الاشتراك
    updateUIWithSubscription(customerInfo);
  }
);
```

## نظام الأرصدة (Credits)

### هيكل الأرصدة
```typescript
interface UserCreditsSystem {
  subscription: 'free' | 'basic' | 'pro';
  monthlyAllowance: number;
  usedThisMonth: number;
  purchasedCredits: number;
  expiresAt?: Date;
}

const creditPrices = {
  free: { monthly: 500 },
  basic: { monthly: 5000 },
  pro: { monthly: Infinity },
};
```

### منح الأرصدة الشهرية
```typescript
async function grantMonthlyCredits(userId: string) {
  const subscription = await getSubscriptionStatus();
  const monthlyCredits = creditPrices[subscription].monthly;
  
  // تحديث في Supabase
  await supabase
    .from('user_credits')
    .update({
      available_credits: monthlyCredits,
      updated_at: new Date(),
    })
    .eq('user_id', userId);
}

// استدعاء هذه الدالة كل شهر (استخدم Trigger في Supabase)
```

### استهلاك الأرصدة
```typescript
async function deductCredits(userId: string, amount: number) {
  // تحقق من الأرصدة المتاحة
  const { data: credits } = await supabase
    .from('user_credits')
    .select('available_credits')
    .eq('user_id', userId)
    .single();
  
  if (!credits || credits.available_credits < amount) {
    throw new Error('Insufficient credits');
  }
  
  // تقليل الأرصدة
  await supabase
    .from('user_credits')
    .update({
      available_credits: credits.available_credits - amount,
    })
    .eq('user_id', userId);
  
  // تسجيل العملية
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount,
      operation: 'deduct',
      reason: 'usage',
    });
}
```

### شراء أرصدة إضافية
```typescript
async function purchaseCredits(userId: string, creditAmount: number) {
  // يمكن إضافة منتجات إضافية في RevenueCat
  // للأرصدة الإضافية
  
  const costPerCredit = 0.001; // $0.001 per credit
  const totalCost = creditAmount * costPerCredit;
  
  // معالجة الشراء عبر RevenueCat
  // ثم تحديث الأرصدة
  
  await supabase
    .from('user_credits')
    .update({
      purchased_credits: creditAmount,
    })
    .eq('user_id', userId);
}
```

## الحسابات والتقارير

### تتبع الإيرادات
```typescript
async function trackRevenue(
  userId: string,
  amount: number,
  subscriptionType: string
) {
  await supabase
    .from('revenue_tracking')
    .insert({
      user_id: userId,
      amount,
      subscription_type: subscriptionType,
      timestamp: new Date(),
    });
}
```

### Dashboard الإيرادات
```typescript
// احصل على إيرادات اليوم
async function getDailyRevenue() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from('revenue_tracking')
    .select('amount')
    .gte('timestamp', today);
  
  return data?.reduce((sum, item) => sum + item.amount, 0) || 0;
}

// احصل على إيرادات الشهر
async function getMonthlyRevenue() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const { data } = await supabase
    .from('revenue_tracking')
    .select('amount')
    .gte('timestamp', startOfMonth.toISOString());
  
  return data?.reduce((sum, item) => sum + item.amount, 0) || 0;
}
```

## معالجة الأخطاء

### الأخطاء الشائعة
```typescript
try {
  await purchaseSubscription(packageId);
} catch (error) {
  if (error.code === 'PurchaseCancelledError') {
    console.log('المستخدم ألغى الشراء');
  } else if (error.code === 'ProductNotAvailableForPurchaseError') {
    console.log('المنتج غير متاح');
  } else if (error.code === 'PurchaseInProgressError') {
    console.log('عملية شراء قيد التنفيذ بالفعل');
  }
}
```

## أفضل الممارسات

✅ **افعل**
- تحقق من الاشتراك قبل كل ميزة
- حدّث الأرصدة فوراً بعد الشراء
- سجّل جميع المعاملات
- اختبر على أجهزة حقيقية
- استخدم test flight قبل الإطلاق

❌ **لا تفعل**
- لا تثق في الـ client-side فقط
- لا تنسى التحقق من الخادم
- لا تستخدم API keys مباشرة
- لا تتجاهل الأخطاء
- لا تنسى معالجة الاشتراكات المنتهية

## الموارد

- [RevenueCat Docs](https://docs.revenuecat.com)
- [React Native Purchases](https://github.com/RevenueCat/react-native-purchases)
- [App Store Subscriptions](https://developer.apple.com/app-store/subscriptions/)
- [Google Play Billing](https://developer.android.com/google/play/billing)

---

**آخر تحديث**: 2026-11-10
