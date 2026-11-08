/**
 * Formatting Utilities
 * General formatting functions for the app
 */

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format duration in milliseconds to readable format
 */
export const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

/**
 * Format duration for subtitle display (HH:MM:SS.mmm)
 */
export const formatTimestampMs = (milliseconds: number, includeMs: boolean = false): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number, len: number = 2) => String(num).padStart(len, '0');

  let result = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (includeMs) {
    result += `.${pad(ms, 3)}`;
  }
  return result;
};

/**
 * Convert milliseconds to MM:SS format
 */
export const formatTimeCompact = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Parse time string to milliseconds
 */
export const parseTimeToMs = (timeStr: string): number => {
  const parts = timeStr.split(':').map(p => parseInt(p, 10));
  let ms = 0;

  if (parts.length === 3) {
    // HH:MM:SS
    ms = parts[0] * 3600000 + parts[1] * 60000 + parts[2] * 1000;
  } else if (parts.length === 2) {
    // MM:SS
    ms = parts[0] * 60000 + parts[1] * 1000;
  } else if (parts.length === 1) {
    // SS
    ms = parts[0] * 1000;
  }

  return ms;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;

  return formatDate(d);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Slugify text (convert to URL-friendly string)
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Calculate word count
 */
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Estimate reading time in minutes
 */
export const estimateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  const words = countWords(text);
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Format list to readable string
 */
export const formatList = (items: string[], separator: string = ', ', lastSeparator: string = ' و '): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}${lastSeparator}${items[1]}`;
  return `${items.slice(0, -1).join(separator)}${lastSeparator}${items[items.length - 1]}`;
};

export default {
  formatBytes,
  formatDuration,
  formatTimestampMs,
  formatTimeCompact,
  parseTimeToMs,
  truncateText,
  capitalize,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  generateRandomString,
  isValidEmail,
  slugify,
  formatCurrency,
  getInitials,
  countWords,
  estimateReadingTime,
  formatList,
};
