# قائمة المتطلبات التقنية - WAIN Compliance

**التاريخ:** 2026-11-14  
**الإصدار:** 1.0  
**الحالة:** جاهزة للتطبيق

---

## 🎯 نظرة عامة

هذا الملف يوثق **المتطلبات التقنية** اللازمة لإكمال Phase 0 (القانوني) و Phase 1 (التقني) لـ WAIN.

تم تقسيم المتطلبات إلى:
1. **ملفات يجب إنشاؤها** (8 ملفات)
2. **تعديلات على ملفات موجودة** (5 ملفات)
3. **قاعدة بيانات - Migrations** (3 migrations)
4. **Edge Functions** (4 functions)

---

## 📋 ملخص تنفيذي

### ✅ مكتمل (5 ملفات قانونية)

```
docs/
├─ PRIVACY_POLICY_WAIN_AR.md              ✅
├─ TERMS_OF_SERVICE_WAIN_AR.md            ✅
├─ DATA_RETENTION_POLICY_WAIN_AR.md       ✅ (لتوّ)
├─ DPA_SUPABASE_WAIN_AR.md                ✅ (لتوّ)
├─ BREACH_RESPONSE_PLAN_WAIN_AR.md        ✅ (لتوّ)
├─ IOS_PRIVACY_MANIFEST_WAIN_AR.md        ✅ (لتوّ)
└─ TECHNICAL_IMPLEMENTATION_CHECKLIST     ✅ (هنا)
```

### ⏳ بقي (متطلبات تقنية)

```
1. Supabase Migrations:
   ├─ 002_audit_logging.sql
   ├─ 003_consent_records.sql
   └─ 004_data_retention_policies.sql

2. Edge Functions:
   ├─ user-export/index.ts
   ├─ user-delete/index.ts
   ├─ user-audit-log/index.ts
   └─ user-consent/index.ts

3. Mobile Components:
   ├─ ConsentFlow.tsx
   ├─ UserRightsManager.tsx
   └─ PrivacySettings.tsx

4. Xcode Files:
   └─ PrivacyInfo.xcprivacy (XML)
```

---

## 1️⃣ Supabase Migrations

### Migration 002: Audit Logging (`002_audit_logging.sql`)

**الغرض:** تسجيل جميع الأنشطة الأمنية

```sql
-- جدول تسجيل التدقيق
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index للبحث السريع
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- RLS: المستخدمون يرون سجلاتهم فقط
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- إدارة الأرشيفة: حذف السجلات الأقدم من سنتين
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- جدول البيانات المحذوفة (للامتثال)
CREATE TABLE IF NOT EXISTS deleted_data_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  data_type VARCHAR(50),
  deletion_reason VARCHAR(100),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_by_user BOOLEAN DEFAULT true
);

CREATE INDEX idx_deleted_data_log_user_id ON deleted_data_log(user_id);
```

**الحقول المسجلة:**
- `action`: login, logout, create, update, delete, export, consent_change
- `resource_type`: profiles, projects, financial_documents, etc
- `ip_address`: للأمان
- `user_agent`: نوع الجهاز والمتصفح
- `status`: success أو failed
- `error_message`: في حالة الفشل

---

### Migration 003: Consent Records (`003_consent_records.sql`)

**الغرض:** تسجيل موافقات المستخدمين

```sql
-- جدول تسجيل الموافقات
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN NOT NULL,
  given_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- الأنواع المقبولة
CREATE TYPE consent_type_enum AS ENUM (
  'service_terms',      -- استخدام الخدمة الأساسي
  'data_collection',    -- جمع البيانات الشخصية
  'openai_vision',      -- تحليل OCR عبر OpenAI
  'analytics',          -- التحليلات والإحصائيات
  'marketing_email',    -- البريد التسويقي
  'child_parental'      -- موافقة الوالدين للأطفال
);

ALTER TABLE consent_records
ADD COLUMN consent_type consent_type_enum;

-- Indexes
CREATE INDEX idx_consent_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type);
CREATE INDEX idx_consent_granted ON consent_records(granted);

-- RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
  ON consent_records FOR SELECT
  USING (auth.uid() = user_id);

-- دالة للتحقق من الموافقة النشطة
CREATE OR REPLACE FUNCTION has_active_consent(
  p_user_id UUID,
  p_consent_type consent_type_enum
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM consent_records
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND granted = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql;
```

---

### Migration 004: Data Retention Policies (`004_data_retention_policies.sql`)

**الغرض:** إدارة سياسات الحذف التلقائي

```sql
-- جدول سياسات الاحتفاظ
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type VARCHAR(100) NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT true,
  legal_basis VARCHAR(200),
  enforcement_function VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إدراج السياسات الافتراضية
INSERT INTO data_retention_policies (data_type, retention_days, auto_delete, legal_basis, notes) VALUES
  ('user_account', -1, false, 'Until user deletion', 'حتى يطلب المستخدم الحذف'),
  ('audit_logs', 730, true, 'Security compliance', 'سنتان للأمان'),
  ('credit_transactions', 2555, true, 'Tax law', '7 سنوات قانونية'),
  ('financial_documents', 2555, true, 'Saudi tax law', '7 سنوات للفواتير'),
  ('backup_data', 30, true, 'Recovery window', '30 يوم للنسخ الاحتياطية'),
  ('device_logs', 30, true, 'Performance', '30 يوم فقط');

-- جدول سجل الحذف المجدول
CREATE TABLE IF NOT EXISTS deletion_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  data_type VARCHAR(100),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  reason VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- دالة الحذف التلقائي
CREATE OR REPLACE FUNCTION auto_delete_expired_data()
RETURNS void AS $$
DECLARE
  policy RECORD;
BEGIN
  -- حذف سجلات التدقيق القديمة
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- حذف الوثائق المالية القديمة
  DELETE FROM financial_documents
  WHERE created_at < NOW() - INTERVAL '7 years';
  
  -- حذف السجلات القديمة
  DELETE FROM device_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- إدراج سجل الحذف
  INSERT INTO audit_logs (user_id, action, status)
  VALUES (NULL, 'auto_delete_expired_data', 'success');
END;
$$ LANGUAGE plpgsql;

-- Scheduled function (يتطلب pg_cron)
-- SELECT cron.schedule('auto-delete-expired-data', '0 3 * * *', 'SELECT auto_delete_expired_data()');
```

---

## 2️⃣ Edge Functions

### Function 1: User Export (`user-export/index.ts`)

**الغرض:** تصدير جميع بيانات المستخدم (GDPR Right to Portability)

```typescript
// File: supabase/functions/user-export/index.ts

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

serve(async (req: Request): Promise<Response> => {
  try {
    // 1. تحقق من التفويض
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. أنشئ عميل Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. احصل على المستخدم
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // 4. جمع البيانات من جميع الجداول
    const [profile, projects, documents, transactions, consents] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('financial_documents').select('*').eq('user_id', user.id),
      supabase.from('credit_transactions').select('*').eq('user_id', user.id),
      supabase.from('consent_records').select('*').eq('user_id', user.id)
    ]);

    // 5. أنشئ كائن البيانات المصدرة
    const exportData = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      profile: profile.data,
      projects: projects.data,
      financial_documents: documents.data,
      transactions: transactions.data,
      consents: consents.data,
    };

    // 6. سجل الطلب
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'data_export',
      resource_type: 'user_data',
      status: 'success'
    });

    // 7. أرجع البيانات
    return new Response(
      JSON.stringify(exportData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="wain_export_${user.id}.json"`
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

### Function 2: User Delete (`user-delete/index.ts`)

**الغرض:** حذف حساب المستخدم والبيانات

```typescript
// File: supabase/functions/user-delete/index.ts
// سياق: قم بحذف الحساب بعد فترة انتظار 7 أيام

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

serve(async (req: Request): Promise<Response> => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    // 1. تسجيل طلب الحذف
    await supabase.from('deleted_data_log').insert({
      user_id: user.id,
      data_type: 'full_account',
      deletion_reason: 'user_requested',
      deleted_by_user: true
    });

    // 2. جدولة الحذف النهائي (بعد 7 أيام)
    await supabase.from('deletion_queue').insert({
      user_id: user.id,
      data_type: 'full_account',
      scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      reason: 'user_requested',
      status: 'pending'
    });

    // 3. حذف فوري للبيانات الحساسة
    await Promise.all([
      supabase.from('credit_transactions').delete().eq('user_id', user.id),
      supabase.from('consent_records').delete().eq('user_id', user.id),
    ]);

    // 4. إرسال بريد تأكيد
    // TODO: أرسل بريد: "تم جدولة حذف حسابك في 7 أيام"

    return new Response(JSON.stringify({ success: true, message: 'Account deletion scheduled' }));
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
});
```

---

### Function 3 & 4: User Audit Log & Consent Manager

**المبدأ:**
- `user-audit-log`: إرجاع سجل الوصول والأنشطة
- `user-consent`: تحديث حالة الموافقات

---

## 3️⃣ Mobile Components (React Native)

### Component 1: Consent Flow (`ConsentFlow.tsx`)

**الموقع:** `packages/mobile/src/screens/ConsentFlow.tsx`

```typescript
// مبادئ التطبيق:
// 1. عرض 4 موافقات منفصلة:
//    ├─ استخدام الخدمة (إلزامي)
//    ├─ جمع البيانات (اختياري)
//    ├─ OpenAI Vision (اختياري)
//    └─ التحليلات (اختياري)
//
// 2. المستخدم يجب أن يختار بوعي
// 3. حفظ الموافقات في Supabase
// 4. الامتثال الكامل لـ PDPL

// تنفيذ مبسط:
import React, { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { useSupabase } from '@services/supabase';

export const ConsentFlow: React.FC = () => {
  const [consents, setConsents] = useState({
    service_terms: true,      // إلزامي
    data_collection: false,   // اختياري
    openai_vision: false,     // اختياري
    analytics: false          // اختياري
  });

  const handleConsent = async (type: string, value: boolean) => {
    setConsents(prev => ({ ...prev, [type]: value }));
    
    // احفظ في Supabase
    // await supabase.from('consent_records').insert({...})
  };

  return (
    <ScrollView>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>الموافقات</Text>
      
      {/* استخدام الخدمة */}
      <View>
        <Text>استخدام تطبيق WAIN</Text>
        <Text>إلزامي - لتشغيل التطبيق</Text>
        <Switch value={true} disabled />
      </View>

      {/* جمع البيانات */}
      <View>
        <Text>جمع البيانات الشخصية</Text>
        <Text>اختياري - لتحسين الخدمة</Text>
        <Switch 
          value={consents.data_collection}
          onValueChange={(v) => handleConsent('data_collection', v)}
        />
      </View>

      {/* OpenAI */}
      <View>
        <Text>تحليل الوثائق بـ OpenAI</Text>
        <Text>اختياري - لـ OCR الذكي</Text>
        <Switch
          value={consents.openai_vision}
          onValueChange={(v) => handleConsent('openai_vision', v)}
        />
      </View>

      {/* التحليلات */}
      <View>
        <Text>التحليلات والإحصائيات</Text>
        <Text>اختياري - لتحسين التجربة</Text>
        <Switch
          value={consents.analytics}
          onValueChange={(v) => handleConsent('analytics', v)}
        />
      </View>
    </ScrollView>
  );
};
```

---

## ✅ قائمة الجاهزية النهائية

### Phase 0: القانوني (✅ مكتمل)

- [x] سياسة الخصوصية
- [x] الشروط والأحكام
- [x] سياسة الاحتفاظ بالبيانات
- [x] اتفاقية معالجة البيانات (Supabase)
- [x] خطة الاستجابة للحوادث
- [x] توثيق iOS Privacy Manifest
- [x] توثيق Consent Flow
- [x] توثيق User Rights APIs

### Phase 1: التقني (⏳ يبدأ الآن)

**Database:**
- [ ] Migration 002 (Audit Logging)
- [ ] Migration 003 (Consent Records)
- [ ] Migration 004 (Retention Policies)

**Edge Functions:**
- [ ] user-export
- [ ] user-delete
- [ ] user-audit-log
- [ ] user-consent

**Mobile:**
- [ ] ConsentFlow.tsx component
- [ ] PrivacySettings.tsx screen
- [ ] consentStore.ts (Zustand)

**Xcode:**
- [ ] PrivacyInfo.xcprivacy file

---

## 🎯 الخطوات التالية الفورية

1. **اليوم:** مراجعة جميع الملفات القانونية بواسطة محام سعودي
2. **الأسبوع 1:** تطبيق Migrations في Supabase
3. **الأسبوع 2:** تطبيق Edge Functions
4. **الأسبوع 3:** تطبيق Mobile Components
5. **الأسبوع 4:** الاختبار الشامل والتجهيز للإطلاق

---

**النسخة:** 1.0  
**التاريخ:** 2026-11-14  
**الحالة:** جاهز للتطبيق الفوري ✅

_جميع الملفات القانونية مكتملة وجاهزة للمراجعة والإطلاق_
