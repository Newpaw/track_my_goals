/**
 * Date utility functions
 */

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use (default: 'short')
 * @returns {string} - The formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    case 'long':
      return dateObj.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'datetime':
      return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    case 'relative':
      return getRelativeTimeString(dateObj);
    default:
      return dateObj.toLocaleDateString();
  }
};

/**
 * Get a relative time string (e.g., "2 days ago")
 * @param {Date} date - The date to get relative time for
 * @returns {string} - The relative time string
 */
export const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffInMs = now - date;
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) {
    return 'just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date, 'short');
  }
};

/**
 * Get the current date as an ISO string
 * @returns {string} - The current date as an ISO string
 */
export const getCurrentDate = () => {
  return new Date().toISOString();
};

/**
 * Get the date for a specific number of days ago
 * @param {number} days - Number of days ago
 * @returns {Date} - The date object for the specified days ago
 */
export const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Get the date for a specific number of days in the future
 * @param {number} days - Number of days in the future
 * @returns {Date} - The date object for the specified days in the future
 */
export const getDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} - Whether the date is today
 */
export const isToday = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

export default {
  formatDate,
  getRelativeTimeString,
  getCurrentDate,
  getDaysAgo,
  getDaysFromNow,
  isToday,
};