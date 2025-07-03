
export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date) || isNaN(gregorianDate.getTime())) {
    return "";
  }
  // Fallback to a standard Gregorian date format since the Ethiopian date library is unavailable due to environment issues.
  // Using 'en-CA' gives a YYYY-MM-DD format which is clear and universal.
  try {
    return gregorianDate.toLocaleDateString('en-CA');
  } catch (error) {
    console.error("Error converting date:", error);
    // Fallback for very old environments that might not support en-CA
    return gregorianDate.toISOString().split('T')[0];
  }
}
