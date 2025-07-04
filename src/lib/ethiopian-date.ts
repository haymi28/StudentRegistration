

const ETHIOPIAN_MONTH_NAMES = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

// --- Internal Conversion Functions ---
// Using a known-correct JDN (Julian Day Number) conversion ensures accuracy.
const ETHIOPIC_EPOCH = 1724220.5;

function jdnToEthiopic(jdn: number): [number, number, number] {
  const r = (jdn - ETHIOPIC_EPOCH) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - ETHIOPIC_EPOCH) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return [year, month, day];
}

function ethiopicToJDN(year: number, month: number, day: number): number {
  return (ETHIOPIC_EPOCH - 1) + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day;
}

function gregorianToJDN(year: number, month: number, day: number): number {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToGregorian(jdn: number): [number, number, number] {
    let f = jdn + 1401 + Math.floor((Math.floor((4 * jdn + 274277) / 146097) * 3) / 4) - 38;
    let e = 4 * f + 3;
    let g = Math.floor((e % 1461) / 4);
    let h = 5 * g + 2;
    const day = Math.floor((h % 153) / 5) + 1;
    const month = ((Math.floor(h / 153) + 2) % 12) + 1;
    const year = Math.floor(e / 1461) - 4716 + Math.floor((12 + 2 - month) / 12);
    return [year, month, day];
}

// --- Exported Functions ---

/**
 * Converts a Gregorian JS Date object to an Ethiopian date array.
 * Uses UTC date parts to avoid timezone-related errors.
 * @param gregDate The Gregorian Date object.
 * @returns An array [year, month, day].
 */
export function toEthiopian(gregDate: Date): [number, number, number] {
    if (!gregDate) return [0, 0, 0];
    const jdn = gregorianToJDN(gregDate.getUTCFullYear(), gregDate.getUTCMonth() + 1, gregDate.getUTCDate());
    return jdnToEthiopic(jdn);
}

/**
 * Converts an Ethiopian date to a Gregorian JS Date object.
 * Creates a UTC date to ensure consistency across timezones.
 * @param ethYear The Ethiopian year.
 * @param ethMonth The Ethiopian month.
 * @param ethDay The Ethiopian day.
 * @returns A Gregorian Date object set to midnight UTC.
 */
export function toGregorian(ethYear: number, ethMonth: number, ethDay: number): Date {
    const jdn = ethiopicToJDN(ethYear, ethMonth, ethDay);
    const [year, month, day] = jdnToGregorian(jdn);
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Gregorian JS Date object into a readable Ethiopian date string.
 * @param gregorianDate The Gregorian Date object.
 * @returns A formatted string like "መስከረም 1, 2017".
 */
export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date) || isNaN(gregorianDate.getTime())) {
    return "";
  }
  
  try {
    const [year, month, day] = toEthiopian(gregorianDate);
    return `${ETHIOPIAN_MONTH_NAMES[month - 1]} ${day}, ${year}`;
  } catch (error) {
      console.error("Error converting date to Ethiopian:", error);
      // Fallback to a standard Gregorian date format on error.
      return gregorianDate.toLocaleDateString('en-CA');
  }
}
