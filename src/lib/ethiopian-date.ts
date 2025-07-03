import { format } from 'date-fns';

export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date) || isNaN(gregorianDate.getTime())) {
    return "";
  }
  
  // As a fallback, format the date in a standard Gregorian way.
  // This ensures the application remains functional.
  // We can revisit implementing a stable Ethiopian calendar solution later.
  try {
    return format(gregorianDate, 'dd MMMM, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return gregorianDate.toLocaleDateString();
  }
}
