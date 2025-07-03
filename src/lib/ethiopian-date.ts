
import { EtDatetime } from 'abushakir';

export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date) || isNaN(gregorianDate.getTime())) {
    return "";
  }
  try {
    const etDate = new EtDatetime(gregorianDate);
    // The default toString() returns in the format "Meskerem 1, 2011"
    return etDate.toString();
  } catch (error) {
    console.error("Error converting date to Ethiopian:", error);
    // Fallback to Gregorian if conversion fails for any reason
    return gregorianDate.toLocaleDateString();
  }
}
