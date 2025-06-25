"use client";

import * as React from "react";
import Link from 'next/link';
import { format } from "date-fns";
import {
  FileUp,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import type { Student } from "@/lib/types";
import { getStudents, deleteStudent } from "@/lib/data";

export function StudentsPageClient() {
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [studentToView, setStudentToView] = React.useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const loadStudents = () => {
      setAllStudents(getStudents());
    };

    loadStudents(); // Initial load

    window.addEventListener("local-storage", loadStudents);

    return () => {
      window.removeEventListener("local-storage", loadStudents);
    };
  }, []);

  React.useEffect(() => {
    const filteredStudents = allStudents.filter(
      (student) =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setStudents(filteredStudents);
  }, [searchTerm, allStudents]);

  const handleDeleteStudent = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    toast({
      title: "Student Deleted",
      description: `${studentToDelete.fullName} has been removed from the system.`,
    });
    setStudentToDelete(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Students</h1>
          <div className="ml-auto flex items-center gap-2">
              <Dialog>
                  <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                          <FileUp className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                              Upload Excel
                          </span>
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                      <DialogTitle>Upload Student Data</DialogTitle>
                      <DialogDescription>
                          Upload an .xlsx file with student information to add them to the database.
                          Make sure the columns match the required format.
                      </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="excel-file" className="text-right">
                          Excel file
                          </Label>
                          <Input id="excel-file" type="file" className="col-span-3" accept=".xlsx, .xls"/>
                      </div>
                      </div>
                      <DialogFooter>
                      <Button type="submit">Upload</Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
            <Link href="/dashboard/students/register">
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Register Student
                </span>
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Student Roster</CardTitle>
            <CardDescription>
              Manage your students and view their details.
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or ID..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead className="hidden md:table-cell">Christian Name</TableHead>
                  <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
                  <TableHead className="hidden lg:table-cell">Joining Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{student.id}</Badge>
                    </TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.christianName}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.dob.toLocaleDateString()}</TableCell>
                    <TableCell className="hidden lg:table-cell">{student.joiningDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setStudentToView(student)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/edit/${student.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setStudentToDelete(student)} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Student Details Dialog */}
      <Dialog open={!!studentToView} onOpenChange={(open) => !open && setStudentToView(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Full information for {studentToView?.fullName}.
            </DialogDescription>
          </DialogHeader>
          {studentToView && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Student ID</Label>
                <span className="col-span-2 font-mono"><Badge variant="outline">{studentToView.id}</Badge></span>
              </div>
               <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Full Name</Label>
                <span className="col-span-2 font-semibold">{studentToView.fullName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Christian Name</Label>
                <span className="col-span-2">{studentToView.christianName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Date of Birth</Label>
                <span className="col-span-2">{format(studentToView.dob, "PPP")}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Address</Label>
                <span className="col-span-2">{studentToView.address}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Father's Phone</Label>
                <span className="col-span-2">{studentToView.fatherPhone}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Mother's Phone</Label>
                <span className="col-span-2">{studentToView.motherPhone}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Joining Date</Label>
                <span className="col-span-2">{format(studentToView.joiningDate, "PPP")}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentToView(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <span className="font-semibold">{studentToDelete?.fullName}</span> and all of their associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive hover:bg-destructive/90">Delete Student</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
