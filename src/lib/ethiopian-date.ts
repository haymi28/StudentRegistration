import { ETC } from './abushakir';

export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date) || isNaN(gregorianDate.getTime())) {
    return "";
  }
  
  try {
    const ethiopianDate = new ETC(gregorianDate);
    
    const ethMonthName = ethiopianDate.monthName;
    const day = ethiopianDate.day;
    const year = ethiopianDate.year;
    
    return `${ethMonthName} ${day}, ${year}`;
  } catch (error) {
    console.error("Error converting date to Ethiopian format:", error);
    // Fallback to Gregorian date display on error
    return gregorianDate.toLocaleDateString();
  }
}
