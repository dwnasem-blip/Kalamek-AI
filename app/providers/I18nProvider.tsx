import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

interface I18nContextType {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  ar: {
    'app.name': 'كلام إيه آي',
    'app.description': 'تطبيق ذكاء اصطناعي لتحويل الكلام في الفيديو إلى نصوص',
    'auth.login': 'دخول',
    'auth.signup': 'إنشاء حساب',
    'auth.logout': 'خروج',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.username': 'اسم المستخدم',
    'auth.forgotPassword': 'هل نسيت كلمة المرور؟',
    'auth.rememberMe': 'تذكرني',
    'auth.signupQuestion': 'ليس لديك حساب؟',
    'auth.loginQuestion': 'هل لديك حساب بالفعل؟',

    'project.new': 'مشروع جديد',
    'project.myProjects': 'مشاريعي',
    'project.title': 'عنوان المشروع',
    'project.description': 'الوصف',
    'project.delete': 'حذف',
    'project.edit': 'تعديل',
    'project.create': 'إنشاء',
    'project.save': 'حفظ',
    'project.cancel': 'إلغاء',

    'video.upload': 'رفع الفيديو',
    'video.selectFromGallery': 'اختر من المكتبة',
    'video.recordNew': 'سجل فيديو جديد',
    'video.size': 'الحجم',
    'video.duration': 'المدة',
    'video.uploading': 'جاري الرفع...',
    'video.uploadError': 'خطأ في الرفع',

    'transcript.view': 'عرض النص',
    'transcript.edit': 'تعديل النص',
    'transcript.export': 'تصدير',
    'transcript.copy': 'نسخ',
    'transcript.search': 'بحث في النص',
    'transcript.noResults': 'لا توجد نتائج',

    'caption.new': 'عنوان جديد',
    'caption.edit': 'تعديل العنوان',
    'caption.delete': 'حذف العنوان',
    'caption.styling': 'التنسيق',
    'caption.font': 'الخط',
    'caption.fontSize': 'حجم الخط',
    'caption.color': 'اللون',
    'caption.position': 'الموضع',

    'font.selectFont': 'اختر الخط',
    'font.categories': 'الفئات',
    'font.favorites': 'المفضلة',
    'font.search': 'ابحث عن الخط',
    'font.addToFavorites': 'إضافة للمفضلة',
    'font.removeFromFavorites': 'إزالة من المفضلة',

    'export.start': 'ابدأ التصدير',
    'export.quality': 'الجودة',
    'export.format': 'الصيغة',
    'export.progress': 'جاري التصدير...',
    'export.success': 'تم التصدير بنجاح',
    'export.error': 'خطأ في التصدير',

    'error.networkError': 'خطأ في الاتصال بالإنترنت',
    'error.timeout': 'انتهت المهلة الزمنية',
    'error.invalidFile': 'الملف غير صالح',
    'error.fileTooLarge': 'الملف كبير جداً',
    'error.unauthorized': 'لم تتم المصادقة',
    'error.serverError': 'خطأ في الخادم',

    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'نجح',
    'common.close': 'إغلاق',
    'common.back': 'عودة',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.confirm': 'تأكيد',
    'common.delete': 'حذف',
    'common.share': 'مشاركة',
  },
  en: {
    'app.name': 'Kalamek AI',
    'app.description': 'AI app for converting speech to text in videos',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.username': 'Username',
    'auth.forgotPassword': 'Forgot password?',
    'auth.rememberMe': 'Remember me',
    'auth.signupQuestion': "Don't have an account?",
    'auth.loginQuestion': 'Already have an account?',

    'project.new': 'New Project',
    'project.myProjects': 'My Projects',
    'project.title': 'Project Title',
    'project.description': 'Description',
    'project.delete': 'Delete',
    'project.edit': 'Edit',
    'project.create': 'Create',
    'project.save': 'Save',
    'project.cancel': 'Cancel',

    'video.upload': 'Upload Video',
    'video.selectFromGallery': 'Select from Gallery',
    'video.recordNew': 'Record New',
    'video.size': 'Size',
    'video.duration': 'Duration',
    'video.uploading': 'Uploading...',
    'video.uploadError': 'Upload Error',

    'transcript.view': 'View Transcript',
    'transcript.edit': 'Edit Transcript',
    'transcript.export': 'Export',
    'transcript.copy': 'Copy',
    'transcript.search': 'Search',
    'transcript.noResults': 'No results',

    'caption.new': 'New Caption',
    'caption.edit': 'Edit Caption',
    'caption.delete': 'Delete Caption',
    'caption.styling': 'Styling',
    'caption.font': 'Font',
    'caption.fontSize': 'Font Size',
    'caption.color': 'Color',
    'caption.position': 'Position',

    'font.selectFont': 'Select Font',
    'font.categories': 'Categories',
    'font.favorites': 'Favorites',
    'font.search': 'Search fonts',
    'font.addToFavorites': 'Add to Favorites',
    'font.removeFromFavorites': 'Remove from Favorites',

    'export.start': 'Start Export',
    'export.quality': 'Quality',
    'export.format': 'Format',
    'export.progress': 'Exporting...',
    'export.success': 'Exported successfully',
    'export.error': 'Export failed',

    'error.networkError': 'Network error',
    'error.timeout': 'Request timeout',
    'error.invalidFile': 'Invalid file',
    'error.fileTooLarge': 'File too large',
    'error.unauthorized': 'Unauthorized',
    'error.serverError': 'Server error',

    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.share': 'Share',
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    if (user?.language) {
      setLanguageState(user.language);
    }
  }, [user]);

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
