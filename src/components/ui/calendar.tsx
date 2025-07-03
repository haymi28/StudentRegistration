
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

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
  // Use the month from props or default to today's date
  const [month, setMonth] = React.useState<Date>(props.month || props.defaultMonth || new Date());
  
  // Create an Ethiopian Date object from the current Gregorian month for calculations
  const ethDate = new ETC(month);
  
  // Handler for changing the month via the dropdown
  const handleMonthChange = (newEthMonthValue: string) => {
      const newEthMonth = parseInt(newEthMonthValue, 10);
      // Create a new Gregorian date that corresponds to the 1st of the selected Ethiopian month/year
      const newGregDate = new ETC(ethDate.year, newEthMonth, 1)._gregorian_date;
      setMonth(newGregDate);
  };

  // Handler for changing the year via the dropdown
  const handleYearChange = (newEthYearValue: string) => {
      const newEthYear = parseInt(newEthYearValue, 10);
       // Create a new Gregorian date that corresponds to the 1st of the selected Ethiopian month/year
      const newGregDate = new ETC(newEthYear, ethDate.month, 1)._gregorian_date;
      setMonth(newGregDate);
  };
  
  const handlePreviousMonth = () => {
    let newEthYear = ethDate.year;
    let newEthMonth = ethDate.month;

    if (newEthMonth === 1) {
      newEthMonth = 13;
      newEthYear -= 1;
    } else {
      newEthMonth -= 1;
    }
    
    const newGregDate = new ETC(newEthYear, newEthMonth, 1)._gregorian_date;
    setMonth(newGregDate);
  }

  const handleNextMonth = () => {
    let newEthYear = ethDate.year;
    let newEthMonth = ethDate.month;

    if (newEthMonth === 13) {
      newEthMonth = 1;
      newEthYear += 1;
    } else {
      newEthMonth += 1;
    }

    const newGregDate = new ETC(newEthYear, newEthMonth, 1)._gregorian_date;
    setMonth(newGregDate);
  }

  // Determine the year range for the dropdown
  const earliestYear = fromYear || new Date().getFullYear() - 100;
  const latestYear = toYear || new Date().getFullYear();
  
  // Convert Gregorian year range to Ethiopian year range
  const ethFromYear = new ETC(new Date(earliestYear, 0, 1)).year;
  const ethToYear = new ETC(new Date(latestYear, 11, 31)).year;
  
  // Create an array of years for the dropdown
  const years: number[] = [];
  for (let i = ethToYear; i >= ethFromYear; i--) {
      years.push(i);
  }
  
  // Modifier to hide days that are not in the current Ethiopian month
  const hiddenDaysModifier = (date: Date) => {
      const ethEquivalent = new ETC(date);
      const ethContext = new ETC(month);
      // Hide if the month or year doesn't match the currently displayed Ethiopian month/year
      return ethEquivalent.month !== ethContext.month || ethEquivalent.year !== ethContext.year;
  };

  return (
    <div>
        <div className="flex justify-center items-center relative mb-4">
            <button
                onClick={handlePreviousMonth}
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
                onClick={handleNextMonth}
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
                caption_label: "text-lg font-medium",
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
