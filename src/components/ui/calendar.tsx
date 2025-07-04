
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation, type CaptionProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// --- Corrected Embedded Ethiopian Date Converter ---
const ETHIOPIAN_EPOCH = 1723855.5;

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

function ethiopianToJDN(year: number, month: number, day: number): number {
    return Math.round(ETHIOPIAN_EPOCH + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day);
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

function toEthiopian(gregDate: Date): [number, number, number] {
    if (!gregDate) return [0, 0, 0];
    const jdn = gregorianToJDN(gregDate.getUTCFullYear(), gregDate.getUTCMonth() + 1, gregDate.getUTCDate());
    return jdnToEthiopian(jdn);
}

function toGregorian(ethYear: number, ethMonth: number, ethDay: number): Date {
    const jdn = ethiopianToJDN(ethYear, ethMonth, ethDay);
    const [year, month, day] = jdnToGregorian(jdn);
    return new Date(Date.UTC(year, month - 1, day));
}
// --- End of Embedded Converter ---

const ETHIOPIAN_MONTH_NAMES = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

const AMHARIC_WEEKDAY_NAMES = ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዐ', 'ቅ'];

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  const { fromYear, toYear, displayMonth } = props;

  const [etYear, etMonth] = toEthiopian(displayMonth);

  const fromEtYear = fromYear ? toEthiopian(new Date(fromYear, 0, 1))[0] : etYear - 100;
  const toEtYear = toYear ? toEthiopian(new Date(toYear, 11, 31))[0] : 2017;
  
  const yearOptions = [];
  for (let i = toEtYear; i >= fromEtYear; i--) {
      yearOptions.push(i);
  }

  const handleYearChange = (year: string) => {
    const newDate = toGregorian(Number(year), etMonth, 1);
    goToMonth(newDate);
  };
  
  const handleMonthChange = (month: string) => {
    const newDate = toGregorian(etYear, Number(month), 1);
    goToMonth(newDate);
  };

  return (
    <div className="flex justify-between items-center p-1">
      <Button variant="outline" className="h-7 w-7 p-0" disabled={!previousMonth} onClick={() => previousMonth && goToMonth(previousMonth)}>
        <span className="sr-only">Go to previous month</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-2">
         <Select value={String(etMonth)} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[120px] focus:ring-0">
                <SelectValue placeholder="ወር" />
            </SelectTrigger>
            <SelectContent>
                {ETHIOPIAN_MONTH_NAMES.map((month, i) => (
                    <SelectItem key={month} value={String(i + 1)}>{month}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select value={String(etYear)} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px] focus:ring-0">
                <SelectValue placeholder="ዓመት" />
            </SelectTrigger>
            <SelectContent>
                {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="h-7 w-7 p-0" disabled={!nextMonth} onClick={() => nextMonth && goToMonth(nextMonth)}>
        <span className="sr-only">Go to next month</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "hidden", // We use our own custom caption
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
      }}
      formatters={{
        formatDay: (day) => String(toEthiopian(day)[2]),
        formatWeekdayName: (day) => AMHARIC_WEEKDAY_NAMES[day.getUTCDay()],
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
