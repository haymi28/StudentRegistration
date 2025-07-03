
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { addMonths } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ScrollArea } from "./scroll-area"
import { ETC, constants } from "@/lib/abushakir"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  fromYear,
  toYear,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month || props.defaultMonth || new Date());
  
  const ethDate = new ETC(month);
  
  const handleMonthChange = (newEthMonthValue: string) => {
      const newEthMonth = parseInt(newEthMonthValue, 10);
      const newGregDate = new ETC(ethDate.year, newEthMonth, 1)._gregorian_date;
      setMonth(newGregDate);
  };

  const handleYearChange = (newEthYearValue: string) => {
      const newEthYear = parseInt(newEthYearValue, 10);
      const newGregDate = new ETC(newEthYear, ethDate.month, 1)._gregorian_date;
      setMonth(newGregDate);
  };

  const earliestYear = fromYear || new Date().getFullYear() - 100;
  const latestYear = toYear || new Date().getFullYear();
  
  const ethFromYear = new ETC(new Date(earliestYear, 0, 1)).year;
  const ethToYear = new ETC(new Date(latestYear, 11, 31)).year;
  
  const years: number[] = [];
  for (let i = ethToYear; i >= ethFromYear; i--) {
      years.push(i);
  }

  const hiddenDaysModifier = (date: Date) => {
      const ethEquivalent = new ETC(date);
      const ethContext = new ETC(month);
      return ethEquivalent.month !== ethContext.month || ethEquivalent.year !== ethContext.year;
  };
  
  const previousMonthDate = addMonths(month, -1);
  const nextMonthDate = addMonths(month, 1);
  
  const isPreviousDisabled = props.fromMonth ? previousMonthDate < props.fromMonth : false;
  const isNextDisabled = props.toMonth ? nextMonthDate > props.toMonth : false;

  return (
    <div>
        <div className="flex justify-center items-center relative mb-4">
            <button
                disabled={isPreviousDisabled}
                onClick={() => !isPreviousDisabled && setMonth(previousMonthDate)}
                className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0 absolute left-0')}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
                <Select onValueChange={handleMonthChange} value={ethDate.month.toString()}>
                    <SelectTrigger className="w-auto border-0 shadow-none focus:ring-0 text-lg font-medium">
                    <SelectValue>{ethDate.monthName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <ScrollArea className="h-80">
                            {constants.ET.months.map((monthName, index) => (
                                <SelectItem key={monthName} value={(index + 1).toString()}>
                                    {monthName}
                                </SelectItem>
                            ))}
                        </ScrollArea>
                    </SelectContent>
                </Select>

                <Select onValueChange={handleYearChange} value={ethDate.year.toString()}>
                    <SelectTrigger className="w-auto border-0 shadow-none focus:ring-0 text-lg font-medium">
                    <SelectValue>{ethDate.year}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <ScrollArea className="h-80">
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </ScrollArea>
                    </SelectContent>
                </Select>
            </div>

            <button
                disabled={isNextDisabled}
                onClick={() => !isNextDisabled && setMonth(nextMonthDate)}
                className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0 absolute right-0')}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>

        <DayPicker
            month={month}
            onMonthChange={setMonth}
            showOutsideDays={true}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
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
                day_hidden: "invisible",
                ...classNames,
            }}
            formatters={{
                formatWeekdayName: (day) => constants.ET.weekdays[day.getDay()],
                formatDay: (day) => new ETC(day).day.toString()
            }}
            modifiers={{
                hidden: hiddenDaysModifier,
            }}
            modifiersClassNames={{
                hidden: 'invisible',
            }}
            components={{
              Caption: () => null, // Hide the default caption
            }}
            {...props}
            />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
