
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, CaptionProps } from "react-day-picker"
import { toEthiopian, toGregorian, isLeap } from "ethiopian-calendar-date-converter"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const ETHIOPIAN_MONTHS = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'];

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // `month` is the Gregorian month to display. We control it to navigate through the Ethiopian calendar.
  const [month, setMonth] = React.useState<Date>(props.selected as Date || new Date());
  
  // A formatter to show Ethiopian day numbers instead of Gregorian.
  const etDayFormatter = (date: Date): React.ReactNode => {
    try {
      const [,, etDay] = toEthiopian(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return etDay;
    } catch {
      return date.getDate(); // Fallback to Gregorian day number
    }
  };

  // Custom Caption component with Ethiopian month/year dropdowns and navigation.
  function CustomCaption(captionProps: CaptionProps) {
    // Get the Ethiopian representation of the currently displayed Gregorian month
    const [etYear, etMonth] = toEthiopian(captionProps.displayMonth.getFullYear(), captionProps.displayMonth.getMonth() + 1, captionProps.displayMonth.getDate());
    const [etTodayYear] = toEthiopian(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

    const handleYearChange = (newYearStr: string) => {
      const newYear = parseInt(newYearStr, 10);
      // Go to the first day of the new Ethiopian month/year.
      const greg = toGregorian(newYear, etMonth, 1);
      setMonth(new Date(greg.year, greg.month - 1, greg.day));
    };

    const handleMonthSelectChange = (newMonthStr: string) => {
      const newMonth = parseInt(newMonthStr, 10);
      // Go to the first day of the new Ethiopian month/year.
      const greg = toGregorian(etYear, newMonth, 1);
      setMonth(new Date(greg.year, greg.month - 1, greg.day));
    };
    
    const handlePreviousMonth = () => {
        const [currentEtYear, currentEtMonth] = toEthiopian(month.getFullYear(), month.getMonth() + 1, month.getDate());
        let newEtMonth = currentEtMonth - 1;
        let newEtYear = currentEtYear;
        if (newEtMonth < 1) {
            newEtMonth = 13;
            newEtYear -= 1;
        }
        const greg = toGregorian(newEtYear, newEtMonth, 1);
        setMonth(new Date(greg.year, greg.month - 1, greg.day));
    };

    const handleNextMonth = () => {
        const [currentEtYear, currentEtMonth] = toEthiopian(month.getFullYear(), month.getMonth() + 1, month.getDate());
        let newEtMonth = currentEtMonth + 1;
        let newEtYear = currentEtYear;
        if (newEtMonth > 13) {
            newEtMonth = 1;
            newEtYear += 1;
        }
        const greg = toGregorian(newEtYear, newEtMonth, 1);
        setMonth(new Date(greg.year, greg.month - 1, greg.day));
    };

    const fromYear = props.fromYear || etTodayYear - 100;
    const toYear = props.toYear || etTodayYear + 5;
    const yearOptions = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);

    return (
       <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
           <Select value={String(etMonth)} onValueChange={handleMonthSelectChange}>
              <SelectTrigger className="w-[130px] focus:ring-0">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  {ETHIOPIAN_MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={String(etYear)} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[90px] focus:ring-0">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={handlePreviousMonth} className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-7 w-7')}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleNextMonth} className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-7 w-7')}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <DayPicker
      month={month}
      onMonthChange={setMonth}
      formatters={{ formatDay: etDayFormatter }}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "hidden", // We use a custom caption, so hide the default one
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
        IconLeft: () => null, // Hide default navigation icons
        IconRight: () => null,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
