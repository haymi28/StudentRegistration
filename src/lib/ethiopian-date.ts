


const ETHIOPIAN_EPOCH = 1723855.5;

const ETHIOPIAN_MONTH_NAMES = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

function gregorianToJDN(year: number, month: number, day: number): number {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToEthiopian(jdn: number): [number, number, number] {
    const jdnOffset = Math.floor(jdn - ETHIOPIAN_EPOCH);
    const r = (jdnOffset % 1461) | 0;
    const n = (r % 365) + 365 * Math.floor(r / 1460);
    const year = 4 * Math.floor(jdnOffset / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
    const month = Math.floor(n / 30) + 1;
    const day = (n % 30) + 1;
    return [year, month, day];
}


export function toEthiopianDateString(gregorianDate: Date | null | undefined): string {
  if (!gregorianDate || !(gregorianDate instanceof Date) || isNaN(gregorianDate.getTime())) {
    return "";
  }
  
  try {
    const jdn = gregorianToJDN(gregorianDate.getUTCFullYear(), gregorianDate.getUTCMonth() + 1, gregorianDate.getUTCDate());
    const [year, month, day] = jdnToEthiopian(jdn);
    return `${ETHIOPIAN_MONTH_NAMES[month - 1]} ${day}, ${year}`;
  } catch (error) {
      console.error("Error converting date to Ethiopian:", error);
      // Fallback to a standard Gregorian date format on error.
      return gregorianDate.toLocaleDateString('en-CA');
  }
}
