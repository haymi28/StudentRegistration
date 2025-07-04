
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toEthiopian, toGregorian, ETHIOPIAN_MONTH_NAMES } from "@/lib/ethiopian-date"

// We use DayPickerProps for type compatibility with existing call sites,
// but the implementation is custom to render a simple 1-30 grid.
export type CalendarProps = DayPickerProps

function Calendar({
  className,
  selected,
  onSelect,
  month: monthProp,
  defaultMonth,
  fromYear,
  toYear,
  disabled,
  ...props
}: CalendarProps) {
  
  // State for the currently displayed month.
  const [displayDate, setDisplayDate] = React.useState<Date>(monthProp || defaultMonth || (selected as Date) || new Date())

  // Update displayDate if the controlled `month` prop changes.
  React.useEffect(() => {
    if (monthProp && monthProp.getTime() !== displayDate.getTime()) {
      setDisplayDate(monthProp)
    }
  }, [monthProp, displayDate])

  const [etYear, etMonth] = toEthiopian(displayDate)

  // --- Date Calculation & Navigation ---
  const daysInMonth = etMonth === 13 ? (etYear % 4 === 3 ? 6 : 5) : 30
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handleDayClick = (day: number) => {
    if (!onSelect) return
    const newGregorianDate = toGregorian(etYear, etMonth, day)
    
    // Check if the date is disabled
    if (disabled) {
        if (typeof disabled === 'function' && disabled(newGregorianDate)) {
            return;
        }
    }
    
    // The type signature for the onSelect handler from react-day-picker is complex,
    // but in "single" mode it effectively passes the selected date to the callback.
    // Our forms rely on this behavior for react-hook-form's `onChange`.
    // Casting to `any` bypasses the strict `DayPicker` prop types which we are not fully implementing.
    (onSelect as any)(newGregorianDate)
  }
  
  const handlePreviousMonth = () => {
    const newMonth = etMonth === 1 ? 13 : etMonth - 1;
    const newYear = etMonth === 1 ? etYear - 1 : etYear;
    setDisplayDate(toGregorian(newYear, newMonth, 1));
  }

  const handleNextMonth = () => {
    const newMonth = etMonth === 13 ? 1 : etMonth + 1;
    const newYear = etMonth === 13 ? etYear + 1 : etYear;
    setDisplayDate(toGregorian(newYear, newMonth, 1));
  }
  
  // --- Month/Year Dropdown Logic ---
  const defaultFromEtYear = toEthiopian(new Date())[0] - 100;
  const defaultToEtYear = toEthiopian(new Date())[0];

  const fromEtYear = fromYear ? toEthiopian(new Date(fromYear, 0, 1))[0] : defaultFromEtYear;
  const toEtYear = toYear ? toEthiopian(new Date(toYear, 11, 31))[0] : defaultToEtYear;

  const yearOptions = []
  for (let i = toEtYear; i >= fromEtYear; i--) {
    yearOptions.push(i)
  }

  const handleYearChange = (year: string) => {
    const newDate = toGregorian(Number(year), etMonth, 1)
    setDisplayDate(newDate)
  }

  const handleMonthChange = (month: string) => {
    const newDate = toGregorian(etYear, Number(month), 1)
    setDisplayDate(newDate)
  }
  
  // --- Determine Selected Day ---
  let selectedDay: number | undefined = undefined
  if (selected && selected instanceof Date && !isNaN(selected.getTime())) {
      const [selectedEtYear, selectedEtMonth, sDay] = toEthiopian(selected)
      if (selectedEtYear === etYear && selectedEtMonth === etMonth) {
          selectedDay = sDay
      }
  }

  return (
    <div className={cn("p-3 w-full", className)} {...props}>
      <div className="flex justify-between items-center p-1">
        <Button variant="outline" className="h-7 w-7 p-0" onClick={handlePreviousMonth}>
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
        <Button variant="outline" className="h-7 w-7 p-0" onClick={handleNextMonth}>
          <span className="sr-only">Go to next month</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mt-4">
        {days.map(day => {
          const dayIsSelected = day === selectedDay;
          let isDisabled = false;
          if (disabled) {
              const dateToCheck = toGregorian(etYear, etMonth, day);
              if (typeof disabled === 'function') {
                  isDisabled = disabled(dateToCheck);
              }
          }
          
          return (
            <Button
              key={day}
              variant={dayIsSelected ? "default" : "ghost"}
              className="h-9 w-9 p-0 font-normal"
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              aria-selected={dayIsSelected}
            >
              {day}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
