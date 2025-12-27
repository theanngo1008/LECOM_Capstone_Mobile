/**
 * Utility functions for date/time handling in Vietnam timezone (UTC+7)
 */

/**
 * Converts UTC date string to Vietnam timezone (UTC+7)
 * @param utcDateString - ISO date string in UTC
 * @returns Date object adjusted to Vietnam timezone
 */
export const toVietnamTime = (utcDateString: string): Date => {
  const utcDate = new Date(utcDateString);
  // Add 7 hours (7 * 60 * 60 * 1000 milliseconds) to convert UTC to Vietnam time
  const vietnamTime = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  return vietnamTime;
};

/**
 * Formats a date string to Vietnam locale with date and time
 * @param dateString - ISO date string in UTC
 * @returns Formatted date string in Vietnamese format
 */
export const formatVietnamDateTime = (dateString: string): string => {
  const vnDate = toVietnamTime(dateString);
  return vnDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats a date string to Vietnam locale (date only)
 * @param dateString - ISO date string in UTC
 * @returns Formatted date string in Vietnamese format
 */
export const formatVietnamDate = (dateString: string): string => {
  const vnDate = toVietnamTime(dateString);
  return vnDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Formats a date string to Vietnam locale with date and time (full format)
 * @param dateString - ISO date string in UTC
 * @returns Formatted date string in Vietnamese format
 */
export const formatVietnamDateTimeFull = (dateString: string): string => {
  const vnDate = toVietnamTime(dateString);
  return vnDate.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Gets relative time string in Vietnamese (e.g., "5 phút trước")
 * @param dateString - ISO date string in UTC
 * @returns Relative time string in Vietnamese
 */
export const getRelativeTime = (dateString: string): string => {
  const vnDate = toVietnamTime(dateString);
  const now = new Date();
  const diffMs = now.getTime() - vnDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return vnDate.toLocaleDateString("vi-VN", { 
    month: "short", 
    day: "numeric",
    year: diffDays > 365 ? "numeric" : undefined,
  });
};


