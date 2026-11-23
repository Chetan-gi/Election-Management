/**
 * Indian Mobile Number Validator and Formatter
 * Checks 10 digits starting with 6, 7, 8, or 9
 */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function cleanMobile(mobile) {
  if (!mobile) return '';
  return mobile.replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
}

export function isValidIndianMobile(mobile) {
  const cleaned = cleanMobile(mobile);
  return INDIAN_MOBILE_REGEX.test(cleaned);
}

export function formatMobile(mobile) {
  const cleaned = cleanMobile(mobile);
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return mobile;
}
