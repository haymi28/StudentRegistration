
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation, type CaptionProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toEthiopian, toGregorian } from "@/lib/ethiopian-date"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

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
  showOutsideDays = false,
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
        formatWeekdayName: (day) => AMHARIC_WEEKDAY_NAMES[day.getDay()],
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
