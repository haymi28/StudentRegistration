
"use client";

import * as React from "react";
import Link from 'next/link';
import { format } from "date-fns";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Users,
  ChevronsRight,
  Loader2,
  Download,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Student, Role } from "@/lib/types";
import { getStudents, deleteStudent, transferStudents, getStudentById } from "@/lib/data";

const ROLE_NAMES: Record<string, string> = {
    children: "Children",
    juniors: "Juniors",
    seniors: "Seniors"
};

export function StudentsPageClient() {
  const { role, isLoading } = useAuth();
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);
  const [studentToView, setStudentToView] = React.useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [transferToRole, setTransferToRole] = React.useState<Role | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const loadStudents = () => {
      if (role) {
        setAllStudents(getStudents(role));
      }
    };
    loadStudents();
    window.addEventListener("local-storage-update", loadStudents);
    return () => {
      window.removeEventListener("local-storage-update", loadStudents);
    };
  }, [role]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };
  
  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
        setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
        setSelectedStudents([]);
    }
  };

  const handleDeleteStudent = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    toast({
      title: "Student Deleted",
      description: `${studentToDelete.fullName} has been removed from the system.`,
    });
    setStudentToDelete(null);
  };

  const isTransferDisabled = React.useMemo(() => {
    if (selectedStudents.length === 0) return true;

    if (role === 'superadmin') {
      const firstStudentRole = allStudents.find(s => s.id === selectedStudents[0])?.role;
      if (!firstStudentRole) return true;
      return !selectedStudents.every(id => allStudents.find(s => s.id === id)?.role === firstStudentRole);
    }
    
    return false;
  }, [selectedStudents, allStudents, role]);


  const getTransferOptions = (): Role[] => {
    const allRoles: Role[] = ['children', 'juniors', 'seniors'];
    let fromRole: Role | undefined;

    if (role === 'superadmin') {
        if (selectedStudents.length > 0 && !isTransferDisabled) {
            fromRole = allStudents.find(s => s.id === selectedStudents[0])?.role;
        }
    } else {
        fromRole = role as Role;
    }
    
    if (!fromRole) return allRoles;
    
    return allRoles.filter(r => r !== fromRole);
  }

  const generateTransferReport = async (transferredStudentIds: string[], fromRole: Role, toRole: Role) => {
    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const transferredStudents = transferredStudentIds.map(id => getStudentById(id)).filter(Boolean) as Student[];

        if (transferredStudents.length === 0) {
            toast({ variant: 'destructive', title: 'Report Error', description: 'No student data found for the report.' });
            return;
        }

        const tableColumn = ["Student ID", "Full Name", "Christian Name"];
        const tableRows: (string | null)[][] = [];

        transferredStudents.forEach(student => {
            const studentData = [
                student.id,
                student.fullName,
                student.christianName,
            ];
            tableRows.push(studentData);
        });

        const date = new Date().toLocaleDateString();
        doc.setFontSize(18);
        doc.text(`Student Transfer Report - ${date}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Transferred ${transferredStudents.length} student(s) from ${ROLE_NAMES[fromRole]} to ${ROLE_NAMES[toRole]}.`, 14, 30);

        autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
        });
        
        doc.save(`transfer_report_${fromRole}_to_${toRole}_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
            title: "Transfer Report Downloaded",
            description: `The report for the transfer has been downloaded.`,
        });

    } catch (error) {
        console.error("Failed to generate PDF report:", error);
        toast({ variant: 'destructive', title: 'Report Generation Failed', description: 'There was an error creating the PDF report.' });
    }
  };

  const handleTransfer = async () => {
      if (!transferToRole || selectedStudents.length === 0) {
          return;
      }
      
      const fromRole = role === 'superadmin' 
        ? allStudents.find(s => s.id === selectedStudents[0])?.role
        : role as Role;

      if (!fromRole) {
          toast({ variant: 'destructive', title: 'Transfer Failed', description: 'Could not determine the original group of the students.' });
          return;
      }
      
      const transferredIds = [...selectedStudents];
      transferStudents(transferredIds, transferToRole);

      await generateTransferReport(transferredIds, fromRole, transferToRole);
      
      toast({
        title: "Transfer Complete",
        description: `${transferredIds.length} student(s) moved from ${ROLE_NAMES[fromRole]} to ${ROLE_NAMES[transferToRole]}.`
      });

      setSelectedStudents([]);
      setIsTransferring(false);
      setTransferToRole(null);
  };

  const filteredStudents = allStudents.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const isAllSelected = selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length;

  if (isLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl font-headline flex items-center gap-2"><Users /> Student Roster</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/dashboard/students/register">
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Register Student</span>
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Manage Students</CardTitle>
            <CardDescription>
                {role === 'superadmin' ? 'Viewing all students.' : `Viewing students in the ${ROLE_NAMES[role!] || ''} group.`}
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search by name or ID..." className="w-full appearance-none bg-background pl-8 shadow-none md:w-80" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {selectedStudents.length > 0 && (
                <Dialog open={isTransferring} onOpenChange={(open) => {
                    setIsTransferring(open);
                    if (!open) {
                        setTransferToRole(null);
                    }
                }}>
                    <DialogTrigger asChild>
                       <Button 
                            variant="outline" 
                            className="h-9 gap-1"
                            disabled={isTransferDisabled}
                            title={isTransferDisabled ? 'As Super Admin, you can only transfer students from the same group at a time.' : 'Transfer selected students'}
                        >
                            <ChevronsRight className="h-4 w-4" />
                            <span>Transfer {selectedStudents.length} Student(s)</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Student Transfer</DialogTitle>
                            <DialogDescription>
                                Select the group to transfer the {selectedStudents.length} selected student(s) to. A PDF report will be downloaded automatically.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Label htmlFor="transfer-role">Transfer To</Label>
                            <Select onValueChange={(v) => setTransferToRole(v as Role)} value={transferToRole || undefined}>
                                <SelectTrigger id="transfer-role">
                                    <SelectValue placeholder="Select destination group..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {getTransferOptions().map(opt => (
                                        <SelectItem key={opt} value={opt}>{ROLE_NAMES[opt]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTransferring(false)}>Cancel</Button>
                            <Button onClick={handleTransfer} disabled={!transferToRole}>Confirm & Transfer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                     <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} aria-label="Select all" />
                  </TableHead>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  {role === 'superadmin' && <TableHead>Role</TableHead>}
                  <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
                  <TableHead className="hidden lg:table-cell">Joining Date</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <TableRow key={student.id} data-state={selectedStudents.includes(student.id) ? "selected" : ""}>
                     <TableCell>
                       <Checkbox onCheckedChange={() => handleSelectStudent(student.id)} checked={selectedStudents.includes(student.id)} aria-label={`Select ${student.fullName}`} />
                    </TableCell>
                    <TableCell>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={student.photoUrl} alt={student.fullName} data-ai-hint="person student" />
                            <AvatarFallback>{student.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell className="font-medium"><Badge variant="outline">{student.id}</Badge></TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    {role === 'superadmin' && <TableCell><Badge variant="secondary">{ROLE_NAMES[student.role]}</Badge></TableCell>}
                    <TableCell className="hidden md:table-cell">{format(student.dob, 'PPP')}</TableCell>
                    <TableCell className="hidden lg:table-cell">{format(student.joiningDate, 'PPP')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setStudentToView(student)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/dashboard/students/edit/${student.id}`}>Edit</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setStudentToDelete(student)} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={role === 'superadmin' ? 8 : 7} className="h-24 text-center">
                        No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!studentToView} onOpenChange={(open) => !open && setStudentToView(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Student Details</DialogTitle><DialogDescription>Full information for {studentToView?.fullName}.</DialogDescription></DialogHeader>
          {studentToView && (
            <div>
              <div className="flex justify-center my-4">
                  <Avatar className="h-24 w-24">
                      <AvatarImage src={studentToView.photoUrl} alt={studentToView.fullName} data-ai-hint="person student" />
                      <AvatarFallback className="text-3xl">
                          {studentToView.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                  </Avatar>
              </div>
              <div className="grid gap-4 py-4 text-sm">
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Student ID</Label><span className="col-span-2 font-mono"><Badge variant="outline">{studentToView.id}</Badge></span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Full Name</Label><span className="col-span-2 font-semibold">{studentToView.fullName}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Christian Name</Label><span className="col-span-2">{studentToView.christianName}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Role</Label><span className="col-span-2"><Badge variant="secondary">{ROLE_NAMES[studentToView.role]}</Badge></span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Date of Birth</Label><span className="col-span-2">{format(studentToView.dob, "PPP")}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Address</Label><span className="col-span-2">{studentToView.address}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Father's Phone</Label><span className="col-span-2">{studentToView.fatherPhone}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Mother's Phone</Label><span className="col-span-2">{studentToView.motherPhone}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">Joining Date</Label><span className="col-span-2">{format(studentToView.joiningDate, "PPP")}</span></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setStudentToView(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete <span className="font-semibold">{studentToDelete?.fullName}</span> and all associated data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive hover:bg-destructive/90">Delete Student</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
