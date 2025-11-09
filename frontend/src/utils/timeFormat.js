/**
 * Convert 24-hour time format to 12-hour AM/PM format
 * @param {string} time24 - Time in 24-hour format (e.g., "09:00", "21:00", "13:30")
 * @returns {string} Time in 12-hour format (e.g., "9:00 AM", "9:00 PM", "1:30 PM")
 */
export const convertTo12Hour = (time24) => {
  if (!time24) return '';
  
  // Split the time string into hours and minutes
  const [hours24, minutes] = time24.split(':').map(Number);
  
  // Determine AM or PM
  const period = hours24 >= 12 ? 'PM' : 'AM';
  
  // Convert hours to 12-hour format
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12; // Handle midnight (0) and noon (12)
  
  // Format minutes with leading zero if needed
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${hours12}:${formattedMinutes} ${period}`;
};

/**
 * Format store hours range from 24-hour to 12-hour format
 * @param {string} openTime - Opening time in 24-hour format
 * @param {string} closeTime - Closing time in 24-hour format
 * @returns {string} Formatted time range (e.g., "9:00 AM - 9:00 PM")
 */
export const formatStoreHours = (openTime, closeTime) => {
  if (!openTime || !closeTime) return '';
  
  const open12 = convertTo12Hour(openTime);
  const close12 = convertTo12Hour(closeTime);
  
  return `${open12} - ${close12}`;
};
