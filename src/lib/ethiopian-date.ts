import { toEthiopian } from 'ethiopian-calendar-date-converter';

const ETHIOPIAN_MONTHS = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'];

export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date) || isNaN(gregorianDate.getTime())) {
    return "";
  }
  try {
    const [year, month, day] = toEthiopian(gregorianDate.getFullYear(), gregorianDate.getMonth() + 1, gregorianDate.getDate());
    const monthName = ETHIOPIAN_MONTHS[month - 1];
    if (!monthName) {
        // Fallback for safety, this should not happen with correct library usage
        return gregorianDate.toLocaleDateString();
    }
    return `${day} ${monthName}, ${year}`;
  } catch (error) {
    console.error("Error converting date to Ethiopian:", error);
    // Fallback to Gregorian if conversion fails for any reason
    return gregorianDate.toLocaleDateString();
  }
}
