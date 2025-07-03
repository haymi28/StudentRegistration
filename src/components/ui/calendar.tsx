
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps, useDayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ScrollArea } from "./scroll-area"
import { ETC, constants } from "@/lib/abushakir"


const amharicWeekdays = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];


export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      captionLayout="dropdowns"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center px-1 mb-2",
        caption_label: "hidden",
        caption_dropdowns: "flex justify-center gap-1",
        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "",
        nav_button_next: "",
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
        day_outside:
          "day-outside text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={{
          formatWeekdayName: (day) => amharicWeekdays[day.getDay()],
          formatDay: (day) => new ETC(day).day.toString()
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ name, fromYear, toYear }: DropdownProps) => {
            const { goToMonth, displayMonth } = useDayPicker();

            if (!displayMonth) {
              return null;
            }

            const ethDate = new ETC(displayMonth);
            const ethYear = ethDate.year;

            if (name === 'months') {
                return (
                    <Select
                        onValueChange={(newEthMonthValue) => {
                            const newEthMonth = parseInt(newEthMonthValue, 10);
                            const newGregDate = new ETC(ethYear, newEthMonth, 1)._gregorian_date;
                            goToMonth(newGregDate);
                        }}
                        value={ethDate.month.toString()}
                    >
                        <SelectTrigger className="w-auto border-0 shadow-none focus:ring-0">
                           {ethDate.monthName}
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
                );
            }

            if (name === 'years') {
                const earliestYear = fromYear || new Date().getFullYear() - 100;
                const latestYear = toYear || new Date().getFullYear();
                
                const gregYears: number[] = [];
                for (let i = latestYear; i >= earliestYear; i--) {
                    gregYears.push(i);
                }

                return (
                    <Select
                        onValueChange={(newGregYearValue) => {
                            const newGregYear = parseInt(newGregYearValue, 10);
                            const newDate = new Date(displayMonth);
                            newDate.setFullYear(newGregYear);
                            goToMonth(newDate);
                        }}
                        value={displayMonth.getFullYear().toString()}
                    >
                        <SelectTrigger className="w-auto border-0 shadow-none focus:ring-0">{ethYear}</SelectTrigger>
                        <SelectContent>
                            <ScrollArea className="h-80">
                                {gregYears.map((gregYear) => {
                                    // Use a date after Eth new year to get a reliable representative year
                                    const representativeEthYear = new ETC(new Date(gregYear, 11, 1)).year;
                                    return (
                                        <SelectItem key={gregYear} value={gregYear.toString()}>
                                            {representativeEthYear}
                                        </SelectItem>
                                    );
                                })}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                );
            }
            return null;
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
    
