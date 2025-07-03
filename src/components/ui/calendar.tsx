
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps, useDayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ScrollArea } from "./scroll-area"
import { ETC } from "@/lib/abushakir"


const gregorianAmharicMonths = [
    'ጥር',
    'የካቲት',
    'መጋቢት',
    'ሚያዝያ',
    'ግንቦት',
    'ሰኔ',
    'ሐምሌ',
    'ነሐሴ',
    'መስከረም',
    'ጥቅምት',
    'ኅዳር',
    'ታኅሣሥ',
];

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
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4 mt-4",
        caption_label: "hidden",
        caption_dropdowns: "flex justify-center gap-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
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
        Dropdown: ({ name, value, onChange, fromYear, toYear, fromMonth, toMonth }: DropdownProps) => {
            const { goToMonth, displayMonth } = useDayPicker();

            if (!displayMonth) {
              return null;
            }

            const handleValueChange = (newValue: string) => {
                const newDate = new Date(displayMonth);
                if (name === "months") {
                    newDate.setMonth(parseInt(newValue, 10));
                } else if (name === "years") {
                    newDate.setFullYear(parseInt(newValue, 10));
                }
                goToMonth(newDate);
            };

            if (name === "months") {
                return (
                    <Select onValueChange={handleValueChange} value={value?.toString()}>
                        <SelectTrigger>{gregorianAmharicMonths[value as number]}</SelectTrigger>
                        <SelectContent>
                           <ScrollArea className="h-80">
                            {Array.from({ length: 12 }).map((_, i) => {
                                const month = fromMonth ? new Date(fromMonth.getFullYear(), fromMonth.getMonth() + i) : new Date(new Date().getFullYear(), i);
                                if (toMonth && month > toMonth) return null;
                                return (
                                    <SelectItem key={i} value={i.toString()}>
                                        {gregorianAmharicMonths[i]}
                                    </SelectItem>
                                );
                            })}
                           </ScrollArea>
                        </SelectContent>
                    </Select>
                );
            }

            if (name === "years") {
                const earliestYear = fromYear || new Date().getFullYear() - 100;
                const latestYear = toYear || new Date().getFullYear();

                const gregYears: number[] = [];
                for (let i = latestYear; i >= earliestYear; i--) {
                    gregYears.push(i);
                }
                
                const displayedEthYear = new ETC(displayMonth).year;
                const ethMonthName = new ETC(displayMonth).monthName;
                const captionText = `${ethMonthName}, ${displayedEthYear}`;

                return (
                    <>
                        <div className="absolute inset-x-0 -top-4 text-center text-sm font-medium">
                           {captionText}
                        </div>
                        <Select onValueChange={handleValueChange} value={displayMonth.getFullYear().toString()}>
                            <SelectTrigger>{displayedEthYear}</SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-80">
                                    {gregYears.map((gregYear) => {
                                        const ethYear = new ETC(new Date(gregYear, 6, 1)).year;
                                        return (
                                            <SelectItem key={gregYear} value={gregYear.toString()}>
                                                {ethYear}
                                            </SelectItem>
                                        );
                                    })}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </>
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
    
