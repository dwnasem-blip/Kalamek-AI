/**
 * Arabic Text Utilities
 * Handles RTL, diacritics, and Arabic-specific text processing
 */

// Arabic diacritics marks
export const DIACRITICS = {
  FATHA: 'َ',
  DAMMA: 'ُ',
  KASRA: 'ِ',
  SUKUN: 'ْ',
  SHADDA: 'ّ',
  TANWIN_FATHA: 'ً',
  TANWIN_DAMMA: 'ٍ',
  TANWIN_KASRA: 'ٌ',
};

// Arabic letter ranges
const ARABIC_START = 0x0600;
const ARABIC_END = 0x06FF;

/**
 * Check if text contains Arabic characters
 */
export const isArabic = (text: string): boolean => {
  return /[؀-ۿ]/.test(text);
};

/**
 * Check if character is Arabic
 */
export const isArabicChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= ARABIC_START && code <= ARABIC_END;
};

/**
 * Remove all diacritics from text
 */
export const removeDiacritics = (text: string): string => {
  const diacriticsRegex = /[ً-ْ]/g;
  return text.replace(diacriticsRegex, '');
};

/**
 * Normalize Arabic text (remove extra spaces, etc.)
 */
export const normalizeArabicText = (text: string): string => {
  return text
    .replace(/ً/g, '') // FATHATAN
    .replace(/ٌ/g, '') // DAMMATAN
    .replace(/ٍ/g, '') // KASRATAN
    .replace(/َ/g, '') // FATHA
    .replace(/ُ/g, '') // DAMMA
    .replace(/ِ/g, '') // KASRA
    .replace(/ّ/g, '') // SHADDA
    .replace(/ْ/g, '') // SUKUN
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Get dominant language in text (Arabic or English)
 */
export const getDominantLanguage = (text: string): 'ar' | 'en' => {
  const arabicCount = (text.match(/[؀-ۿ]/g) || []).length;
  const englishCount = (text.match(/[A-Za-z]/g) || []).length;
  return arabicCount > englishCount ? 'ar' : 'en';
};

/**
 * Split Arabic text by word boundaries
 */
export const splitArabicText = (text: string): string[] => {
  return text.split(/\s+/).filter(word => word.length > 0);
};

/**
 * Detect Arabic dialects/accents based on letter frequency
 * Returns: 'classical', 'gulf', 'egyptian', 'levantine', 'moroccan'
 */
export const detectDialect = (text: string): string => {
  const normalizedText = normalizeArabicText(text);

  // Simple heuristic based on common dialect markers
  const gulfMarkers = /([أ]|ما|ايش|هاي)/g.test(normalizedText);
  const egyptianMarkers = /([ـي]|كويس|تمام)/g.test(normalizedText);
  const levanteseMarkers = /([ي]|كيف|شو)/g.test(normalizedText);

  if (gulfMarkers) return 'gulf';
  if (egyptianMarkers) return 'egyptian';
  if (levanteseMarkers) return 'levantine';
  return 'classical';
};

/**
 * Convert numbers in Arabic text to Western numerals
 */
export const arabicToWesternNumbers = (text: string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = text;
  for (let i = 0; i < arabicNumerals.length; i++) {
    result = result.replace(new RegExp(arabicNumerals[i], 'g'), String(i));
  }
  return result;
};

/**
 * Check if word is correctly connected (for display validation)
 */
export const isWordWellFormed = (word: string): boolean => {
  // Basic validation for Arabic word structure
  if (!word || word.length === 0) return false;
  if (!/[؀-ۿ]/.test(word)) return true; // Non-Arabic words are considered valid

  // Word should have minimum length and valid characters
  return word.length >= 1 && !/[؀-ۿ]{20,}/.test(word); // Reject words that are too long
};

/**
 * Format time in Arabic or English
 */
export const formatTimeLabel = (timeMs: number, language: 'ar' | 'en' = 'ar'): string => {
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const minutes = Math.floor((timeMs % 3600000) / 60000);
  const hours = Math.floor(timeMs / 3600000);

  const pad = (num: number) => String(num).padStart(2, '0');

  const parts: string[] = [];
  if (hours > 0) parts.push(pad(hours));
  parts.push(pad(minutes));
  parts.push(pad(seconds));

  const timeStr = parts.join(':');

  if (language === 'ar') {
    return arabicToWesternNumbers(timeStr);
  }
  return timeStr;
};

/**
 * Get text direction (RTL for Arabic, LTR for English)
 */
export const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  const dominant = getDominantLanguage(text);
  return dominant === 'ar' ? 'rtl' : 'ltr';
};

/**
 * Align text based on direction
 */
export const getTextAlign = (text: string): 'right' | 'left' => {
  const dominant = getDominantLanguage(text);
  return dominant === 'ar' ? 'right' : 'left';
};

/**
 * Common Arabic search terms (for autocomplete)
 */
export const COMMON_ARABIC_SEARCH_TERMS = [
  'الرياض',
  'جدة',
  'الدمام',
  'بالعربية',
  'الإمارات',
  'مصر',
  'السعودية',
];

/**
 * Arabic language codes and names
 */
export const ARABIC_LANGUAGES = {
  ar: 'العربية',
  'ar-SA': 'العربية - السعودية',
  'ar-AE': 'العربية - الإمارات',
  'ar-EG': 'العربية - مصر',
  'ar-SY': 'العربية - سوريا',
  'ar-JO': 'العربية - الأردن',
  'ar-KW': 'العربية - الكويت',
  'ar-BH': 'العربية - البحرين',
  'ar-QA': 'العربية - قطر',
  'ar-OM': 'العربية - عمان',
  'ar-YE': 'العربية - اليمن',
  'ar-LB': 'العربية - لبنان',
  'ar-PS': 'العربية - فلسطين',
};

/**
 * Validate Arabic text input
 */
export const validateArabicInput = (text: string): { valid: boolean; error?: string } => {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'النص لا يمكن أن يكون فارغاً' };
  }

  if (text.length > 10000) {
    return { valid: false, error: 'النص طويل جداً (الحد الأقصى 10000 حرف)' };
  }

  return { valid: true };
};

/**
 * Split words and preserve punctuation
 */
export const splitWordsPreservePunctuation = (text: string): string[] => {
  return text.match(/[؀-ۿ]+|[A-Za-z]+|[0-9]+|[^\s]/g) || [];
};

export default {
  isArabic,
  isArabicChar,
  removeDiacritics,
  normalizeArabicText,
  getDominantLanguage,
  splitArabicText,
  detectDialect,
  arabicToWesternNumbers,
  isWordWellFormed,
  formatTimeLabel,
  getTextDirection,
  getTextAlign,
  validateArabicInput,
  splitWordsPreservePunctuation,
};
