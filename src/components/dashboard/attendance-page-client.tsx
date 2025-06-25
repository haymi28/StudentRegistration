"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { AttendanceRecord } from "@/lib/types";
import { getAttendanceRecords } from "@/lib/data";

export function AttendancePageClient() {
  const [allRecords, setAllRecords] = React.useState<AttendanceRecord[]>([]);
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    const loadRecords = () => {
      setAllRecords(getAttendanceRecords());
    };
    
    loadRecords();

    window.addEventListener('local-storage', loadRecords);

    return () => {
        window.removeEventListener('local-storage', loadRecords);
    }
  }, []);

  React.useEffect(() => {
    let filteredRecords = [...allRecords];

    if (searchTerm) {
      filteredRecords = filteredRecords.filter(
        (record) =>
          record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (date) {
        filteredRecords = filteredRecords.filter(
            (record) => format(record.checkInTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
    }

    setRecords(filteredRecords);
  }, [searchTerm, date, allRecords]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Attendance Records</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Log</CardTitle>
          <CardDescription>
            View and filter attendance records by student or date.
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or ID..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Filter by date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            { (date || searchTerm) && <Button onClick={() => { setDate(undefined); setSearchTerm(""); }}>Clear Filters</Button> }
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-in Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Badge variant="outline">{record.studentId}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{format(record.checkInTime, 'PPP')}</TableCell>
                  <TableCell>{format(record.checkInTime, 'p')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
