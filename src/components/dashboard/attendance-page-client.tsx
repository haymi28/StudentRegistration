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

import type { AttendanceRecord, Student } from "@/lib/types";
import { getAttendanceRecords, getStudents } from "@/lib/data";

interface DailyAttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent';
  checkInTime: Date | null;
}

export function AttendancePageClient() {
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [allRecords, setAllRecords] = React.useState<AttendanceRecord[]>([]);
  const [records, setRecords] = React.useState<DailyAttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [date, setDate] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const loadData = () => {
      setAllStudents(getStudents());
      setAllRecords(getAttendanceRecords());
    };
    
    loadData();

    window.addEventListener('local-storage', loadData);

    return () => {
        window.removeEventListener('local-storage', loadData);
    }
  }, []);

  React.useEffect(() => {
    const checkInsForDate = allRecords.filter(
      (record) => format(record.checkInTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const checkedInStudentIds = new Set(checkInsForDate.map(r => r.studentId));

    let dailyRecords: DailyAttendanceRecord[] = allStudents.map(student => {
      const isPresent = checkedInStudentIds.has(student.id);
      if (isPresent) {
        const record = checkInsForDate.find(r => r.studentId === student.id)!;
        return {
          studentId: student.id,
          studentName: student.fullName,
          status: 'Present',
          checkInTime: record.checkInTime,
        };
      } else {
        return {
          studentId: student.id,
          studentName: student.fullName,
          status: 'Absent',
          checkInTime: null,
        };
      }
    });

    if (searchTerm) {
      dailyRecords = dailyRecords.filter(
        (record) =>
          record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setRecords(dailyRecords);
  }, [searchTerm, date, allStudents, allRecords]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Attendance Records</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Status</CardTitle>
          <CardDescription>
            View attendance status for all students on a selected date. Defaults to today.
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
                    "w-full md:w-[280px] justify-start text-left font-normal"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            { searchTerm && <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button> }
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.studentId}>
                  <TableCell>
                    <Badge variant="outline">{record.studentId}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                   <TableCell>
                    <Badge variant={record.status === 'Present' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.checkInTime ? format(record.checkInTime, 'p') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
