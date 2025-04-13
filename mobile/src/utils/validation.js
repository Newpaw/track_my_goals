/**
 * Form validation utility functions
 */

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum password length (default: 8)
 * @param {boolean} options.requireUppercase - Whether to require uppercase letters (default: true)
 * @param {boolean} options.requireLowercase - Whether to require lowercase letters (default: true)
 * @param {boolean} options.requireNumbers - Whether to require numbers (default: true)
 * @param {boolean} options.requireSpecialChars - Whether to require special characters (default: false)
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options;
  
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long` };
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate that a field is not empty
 * @param {string} value - The value to validate
 * @param {string} fieldName - The name of the field (for error message)
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a field's minimum length
 * @param {string} value - The value to validate
 * @param {number} minLength - The minimum length required
 * @param {string} fieldName - The name of the field (for error message)
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (!value || value.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a field's maximum length
 * @param {string} value - The value to validate
 * @param {number} maxLength - The maximum length allowed
 * @param {string} fieldName - The name of the field (for error message)
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be no more than ${maxLength} characters long` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate that two fields match
 * @param {string} value1 - The first value
 * @param {string} value2 - The second value
 * @param {string} field1Name - The name of the first field
 * @param {string} field2Name - The name of the second field
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateMatch = (value1, value2, field1Name, field2Name) => {
  if (value1 !== value2) {
    return { isValid: false, message: `${field1Name} and ${field2Name} must match` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a date
 * @param {string|Date} date - The date to validate
 * @param {Object} options - Validation options
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateDate = (date, options = {}) => {
  const { minDate, maxDate } = options;
  
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }
  
  if (minDate && dateObj < minDate) {
    return { isValid: false, message: `Date must be on or after ${minDate.toLocaleDateString()}` };
  }
  
  if (maxDate && dateObj > maxDate) {
    return { isValid: false, message: `Date must be on or before ${maxDate.toLocaleDateString()}` };
  }
  
  return { isValid: true, message: '' };
};

export default {
  isValidEmail,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateMatch,
  validateDate,
};