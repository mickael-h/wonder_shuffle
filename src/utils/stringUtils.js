/**
 * String utility functions
 */

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalizeFirst(str) {
  if (!str || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

