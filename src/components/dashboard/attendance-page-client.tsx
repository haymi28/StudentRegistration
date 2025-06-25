"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Present' | 'Absent'>('All');

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

    if (statusFilter !== 'All') {
        dailyRecords = dailyRecords.filter(record => record.status === statusFilter);
    }

    if (searchTerm) {
      dailyRecords = dailyRecords.filter(
        (record) =>
          record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setRecords(dailyRecords);
  }, [searchTerm, date, allStudents, allRecords, statusFilter]);

  const handleExport = () => {
    const dataToExport = records.map(record => ({
      'Student ID': record.studentId,
      'Full Name': record.studentName,
      'Status': record.status,
      'Check-in Time': record.checkInTime ? format(record.checkInTime, 'p') : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Manually set headers because json_to_sheet doesn't guarantee order and styling
    XLSX.utils.sheet_add_aoa(worksheet, [['Student ID', 'Full Name', 'Status', 'Check-in Time']], { origin: 'A1' });

    // Adjust column widths
    worksheet['!cols'] = [
        { wch: 15 }, // Student ID
        { wch: 25 }, // Full Name
        { wch: 10 }, // Status
        { wch: 20 }, // Check-in Time
    ];

    const today = format(date, 'yyyy-MM-dd');
    XLSX.writeFile(workbook, `Attendance-${today}.xlsx`);
  };

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
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name or ID..."
                    className="w-full appearance-none bg-background pl-8 shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal"
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
                 <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleExport} variant="outline" size="icon" className="w-full sm:w-auto">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="sr-only">Export</span>
                </Button>
            </div>
          </div>
          { searchTerm && <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-2 w-full sm:max-w-xs">Clear Search</Button> }
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
                    <Badge variant={record.status === 'Absent' ? 'destructive' : 'default'} className={cn(
                        record.status === 'Present' && 'bg-green-600 hover:bg-green-600/90'
                    )}>
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
