export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date)) return "";
  
  // The Ethiopian calendar packages were causing installation issues.
  // Reverting to browser-native Gregorian dates with Amharic locale formatting
  // as a temporary measure to fix the build.
  try {
    return gregorianDate.toLocaleDateString('am-ET', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        calendar: 'gregory' // Explicitly use Gregorian calendar
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    // Fallback for environments that might not support am-ET locale
    return gregorianDate.toLocaleDateString();
  }
}
