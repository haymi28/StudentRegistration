
"use client";

import * as React from "react";
import Link from 'next/link';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Users,
  ChevronsRight,
  Loader2,
  Upload,
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
import type { Student, Role, Gender } from "@/lib/types";
import { getStudents, deleteStudent, transferStudents, getStudentById, addStudent } from "@/lib/data";
import { toEthiopianDateString } from "@/lib/ethiopian-date";

const ROLE_NAMES: Record<string, string> = {
    children: "ቀዳማይ -1 ክፍል",
    children2: "ቀዳማይ -2 ክፍል",
    juniors: "ካእላይ ክፍል",
    seniors: "ማእከላይ ክፍል"
};

const AMHARIC_TO_ROLE: Record<string, Role> = {
    "ቀዳማይ -1 ክፍል": "children",
    "ቀዳማይ -2 ክፍል": "children2",
    "ካእላይ ክፍል": "juniors",
    "ማእከላይ ክፍል": "seniors"
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
  
  const [isImporting, setIsImporting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImportProcessing, setIsImportProcessing] = React.useState(false);


  React.useEffect(() => {
    const loadStudents = () => {
      setAllStudents(getStudents());
    };
    loadStudents();
    window.addEventListener("local-storage-update", loadStudents);
    return () => {
      window.removeEventListener("local-storage-update", loadStudents);
    };
  }, []);

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
      title: "ተማሪ ተሰርዟል።",
      description: `${studentToDelete.fullName} ከስርዓቱ ተወግዷል።`,
    });
    setStudentToDelete(null);
  };

  const isTransferDisabled = React.useMemo(() => {
    if (selectedStudents.length === 0) return true;
    const firstStudentRole = allStudents.find(s => s.id === selectedStudents[0])?.role;
    if (!firstStudentRole) return true;
    return !selectedStudents.every(id => allStudents.find(s => s.id === id)?.role === firstStudentRole);
  }, [selectedStudents, allStudents]);

  const getTransferOptions = (): Role[] => {
    if (selectedStudents.length === 0) return [];
  
    const fromRole = allStudents.find(s => s.id === selectedStudents[0])?.role;
    if (!fromRole) return [];
    
    const allRoles: Role[] = ['children', 'children2', 'juniors', 'seniors'];
    const currentIndex = allRoles.indexOf(fromRole);
    const options: Role[] = [];
  
    // Allow downgrade
    if (currentIndex > 0) {
      options.push(allRoles[currentIndex - 1]);
    }
    // Allow upgrade
    if (currentIndex < allRoles.length - 1) {
      options.push(allRoles[currentIndex + 1]);
    }
  
    return options;
  };

  const generateTransferReport = async (transferredStudentIds: string[], fromRole: Role, toRole: Role) => {
    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const { amharicFont } = await import('@/lib/noto-sans-ethiopic-regular-font');

        const doc = new jsPDF();
        
        doc.addFileToVFS('NotoSansEthiopic-Regular.ttf', amharicFont);
        doc.addFont('NotoSansEthiopic-Regular.ttf', 'NotoSansEthiopic', 'normal');
        doc.setFont('NotoSansEthiopic');
        
        const transferredStudents = transferredStudentIds.map(id => getStudentById(id)).filter(Boolean) as Student[];

        if (transferredStudents.length === 0) {
            return;
        }

        const tableColumn = ["የተማሪ መለያ", "ሙሉ ስም", "የክርስትና ስም"];
        const tableRows: (string | null)[][] = [];

        transferredStudents.forEach(student => {
            const studentData = [
                student.id,
                student.fullName,
                student.christianName,
            ];
            tableRows.push(studentData);
        });

        const date = toEthiopianDateString(new Date());
        doc.setFontSize(18);
        doc.text(`የተማሪ ዝውውር ሪፖርት - ${date}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`${transferredStudents.length} ተማሪ(ዎች) ከ${ROLE_NAMES[fromRole]} ወደ ${ROLE_NAMES[toRole]} ተዘዋውረዋል።`, 14, 30);

        autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: { font: 'NotoSansEthiopic', fontStyle: 'normal' },
            headStyles: { font: 'NotoSansEthiopic', fillColor: [41, 128, 185], fontStyle: 'bold' },
        });
        
        doc.save(`transfer_report_${fromRole}_to_${toRole}_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
            title: "የዝውውር ሪፖርት ወርዷል።",
            description: `የፒዲኤፍ ሪፖርቱ በተሳካ ሁኔታ ተፈጥሯል።`,
        });

    } catch (error) {
        console.error("Failed to generate PDF report:", error);
        toast({ variant: 'destructive', title: 'ሪፖርት መፍጠር አልተሳካም።', description: 'የፒዲኤፍ ሪፖርቱን በመፍጠር ላይ ስህተት ነበር።' });
    }
  };

  const handleTransfer = async () => {
      if (!transferToRole || selectedStudents.length === 0) {
          return;
      }
      
      const fromRole = allStudents.find(s => s.id === selectedStudents[0])?.role;

      if (!fromRole) {
          return;
      }
      
      const transferredIds = [...selectedStudents];
      transferStudents(transferredIds, transferToRole);
      
      await generateTransferReport(transferredIds, fromRole, transferToRole);
      
      toast({
        title: "ዝውውር ተጠናቅቋል።",
        description: `${transferredIds.length} ተማሪ(ዎች) ከ${ROLE_NAMES[fromRole]} ወደ ${ROLE_NAMES[transferToRole]} ተዘዋውረዋል።`
      });

      setSelectedStudents([]);
      setIsTransferring(false);
      setTransferToRole(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || isImportProcessing) return;
    setIsImportProcessing(true);

    try {
        const XLSX = await import('xlsx');
        const data = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let failureCount = 0;
        let failedStudents: string[] = [];

        for (const row of json) {
            const amharicRole = String(row.role || '').trim();
            const studentRole = AMHARIC_TO_ROLE[amharicRole];
            const gender = String(row.gender || '').trim();
            
            if (!row.id || !row.fullName || !row.dob || !studentRole || !row.joiningDate || !row.christianName || !row.educationLevel || !row.subcity || !row.kebele || !row.houseNumber || !row.houseAddressDetail || !row.fatherPhone || !row.motherPhone || !gender) {
                failureCount++;
                failedStudents.push(`${row.id || 'ID የለም'} (የጎደለ መረጃ)`);
                continue;
            }
             if (gender !== 'ወንድ' && gender !== 'ሴት') {
                failureCount++;
                failedStudents.push(`${row.id} (የተሳሳተ ጾታ)`);
                continue;
            }
            if (!['children', 'children2', 'juniors', 'seniors'].includes(studentRole)) {
                failureCount++;
                failedStudents.push(`${row.id} (የተሳሳተ ክፍል)`);
                continue;
            }
            if (role !== 'superadmin' && studentRole !== role) {
                failureCount++;
                failedStudents.push(`${row.id} (ያልተፈቀደ ክፍል)`);
                continue;
            }
            if (!(row.dob instanceof Date) || !(row.joiningDate instanceof Date)) {
                failureCount++;
                failedStudents.push(`${row.id} (የተሳሳተ የቀን ቅርጸት)`);
                continue;
            }

            const studentToAdd: Student = {
                id: String(row.id).toUpperCase(),
                fullName: String(row.fullName),
                christianName: String(row.christianName),
                gender: gender as Gender,
                educationLevel: String(row.educationLevel),
                dob: row.dob,
                subcity: String(row.subcity),
                kebele: String(row.kebele),
                houseNumber: String(row.houseNumber),
                houseAddressDetail: String(row.houseAddressDetail),
                fatherPhone: String(row.fatherPhone),
                motherPhone: String(row.motherPhone),
                joiningDate: row.joiningDate,
                role: studentRole,
            };

            const success = addStudent(studentToAdd);
            if (success) {
                successCount++;
            } else {
                failureCount++;
                failedStudents.push(`${studentToAdd.id} (የተባዛ)`);
            }
        }

        toast({
            title: "ማስመጣት ተጠናቅቋል",
            description: `${successCount} ተማሪዎች ገብተዋል። ${failureCount} አልተሳካም።${failureCount > 0 ? ` ያልተሳኩ: ${failedStudents.slice(0, 5).join(', ')}${failedStudents.length > 5 ? '...' : ''}` : ''}`,
            duration: 10000
        });

    } catch (error) {
        console.error("Error processing Excel file:", error);
        toast({
            variant: "destructive",
            title: "ማስመጣት አልተሳካም",
            description: "ፋይሉን በማስኬድ ላይ ስህተት ተፈጥሯል። ቅርጸቱ ትክክል መሆኑን ያረጋግጡ።",
        });
    } finally {
        setIsImporting(false);
        setSelectedFile(null);
        setIsImportProcessing(false);
    }
  };

  const filteredStudents = allStudents.filter(
    (student) =>
      (student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (role === 'superadmin' || student.role === role)
  );
  
  const isAllSelected = selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length;

  if (isLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl font-headline flex items-center gap-2"><Users /> የተማሪዎች ዝርዝር</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsImporting(true)}>
              <Upload className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">ከኤክሴል አስመጣ</span>
            </Button>
            <Link href="/dashboard/students/register">
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">ተማሪ ይመዝግቡ</span>
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>ተማሪዎችን ያስተዳድሩ</CardTitle>
            <CardDescription>
                {role === 'superadmin' ? 'ሁሉንም ተማሪዎች በማየት ላይ።' : `በ${ROLE_NAMES[role!] || ''} ክፍል ውስጥ ያሉ ተማሪዎችን በማየት ላይ።`}
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="በስም ወይም በመለያ ይፈልጉ..." className="w-full appearance-none bg-background pl-8 shadow-none md:w-80" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                            title={isTransferDisabled ? 'እንደ ሱፐር አስተዳዳሪ፣ ተማሪዎችን ከአንድ ክፍል ብቻ በአንድ ጊዜ ማስተላለፍ ይችላሉ።' : 'የተመረጡ ተማሪዎችን ያስተላልፉ'}
                        >
                            <ChevronsRight className="h-4 w-4" />
                            <span>{selectedStudents.length} ተማሪ(ዎች) ያስተላልፉ</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>የተማሪ ዝውውርን ያረጋግጡ</DialogTitle>
                            <DialogDescription>
                               የተመረጡትን {selectedStudents.length} ተማሪ(ዎች) የሚያስተላልፉበትን ክፍል ይምረጡ።
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Label htmlFor="transfer-role">ማስተላለፊያ</Label>
                            <Select onValueChange={(v) => setTransferToRole(v as Role)} value={transferToRole || undefined}>
                                <SelectTrigger id="transfer-role">
                                    <SelectValue placeholder="የመድረሻ ክፍል ይምረጡ..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {getTransferOptions().map(opt => (
                                        <SelectItem key={opt} value={opt}>{ROLE_NAMES[opt]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTransferring(false)}>ሰርዝ</Button>
                            <Button onClick={handleTransfer} disabled={!transferToRole}>አረጋግጥ እና አስተላልፍ</Button>
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
                     <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} aria-label="ሁሉንም ምረጥ" />
                  </TableHead>
                  <TableHead className="w-16">ፎቶ</TableHead>
                  <TableHead>የተማሪ መለያ</TableHead>
                  <TableHead>ሙሉ ስም</TableHead>
                  <TableHead>ጾታ</TableHead>
                  <TableHead>የትምህርት ደረጃ</TableHead>
                  <TableHead>ክፍል</TableHead>
                  <TableHead className="hidden md:table-cell">የትውልድ ቀን</TableHead>
                  <TableHead className="hidden lg:table-cell">የተቀላቀለበት ቀን</TableHead>
                  <TableHead><span className="sr-only">ድርጊቶች</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <TableRow key={student.id} data-state={selectedStudents.includes(student.id) ? "selected" : ""}>
                     <TableCell>
                       <Checkbox onCheckedChange={() => handleSelectStudent(student.id)} checked={selectedStudents.includes(student.id)} aria-label={`${student.fullName} ምረጥ`} />
                    </TableCell>
                    <TableCell>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={student.photoUrl} alt={student.fullName} data-ai-hint="person student" />
                            <AvatarFallback>{student.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell className="font-medium"><Badge variant="outline">{student.id}</Badge></TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{student.educationLevel}</TableCell>
                    <TableCell><Badge variant="secondary">{ROLE_NAMES[student.role]}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{toEthiopianDateString(student.dob)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{toEthiopianDateString(student.joiningDate)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">ምናሌ ቀይር</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>ድርጊቶች</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setStudentToView(student)}>ዝርዝሮችን ይመልከቱ</DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/dashboard/students/edit/${student.id}`}>አርትዕ</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setStudentToDelete(student)} className="text-destructive focus:text-destructive focus:bg-destructive/10">ሰርዝ</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                        ምንም ተማሪዎች አልተገኙም።
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!studentToView} onOpenChange={(open) => !open && setStudentToView(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>የተማሪ ዝርዝሮች</DialogTitle><DialogDescription>የ{studentToView?.fullName} ሙሉ መረጃ።</DialogDescription></DialogHeader>
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
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የተማሪ መለያ</Label><span className="col-span-2 font-mono"><Badge variant="outline">{studentToView.id}</Badge></span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">ሙሉ ስም</Label><span className="col-span-2 font-semibold">{studentToView.fullName}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የክርስትና ስም</Label><span className="col-span-2">{studentToView.christianName}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">ጾታ</Label><span className="col-span-2">{studentToView.gender}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የትምህርት ደረጃ</Label><span className="col-span-2">{studentToView.educationLevel}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">ክፍል</Label><span className="col-span-2"><Badge variant="secondary">{ROLE_NAMES[studentToView.role]}</Badge></span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የትውልድ ቀን</Label><span className="col-span-2">{toEthiopianDateString(studentToView.dob)}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">ክፍለ ከተማ</Label><span className="col-span-2">{studentToView.subcity}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">ቀበሌ</Label><span className="col-span-2">{studentToView.kebele}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የቤት ቁጥር</Label><span className="col-span-2">{studentToView.houseNumber}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የቤት ልዩ አድራሻ</Label><span className="col-span-2">{studentToView.houseAddressDetail}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የአባት ስልክ</Label><span className="col-span-2">{studentToView.fatherPhone}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የእናት ስልክ</Label><span className="col-span-2">{studentToView.motherPhone}</span></div>
                <div className="grid grid-cols-3 items-center gap-2"><Label className="text-right text-muted-foreground">የተቀላቀለበት ቀን</Label><span className="col-span-2">{toEthiopianDateString(studentToView.joiningDate)}</span></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setStudentToView(null)}>ዝጋ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>ሙሉ በሙሉ እርግጠኛ ነዎት?</AlertDialogTitle>
            <AlertDialogDescription>ይህ እርምጃ ሊቀለበስ አይችልም። ይህ በቋሚነት <span className="font-semibold">{studentToDelete?.fullName}</span> እና ሁሉንም ተዛማጅ መረጃዎች ይሰርዛል።</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setStudentToDelete(null)}>ሰርዝ</AlertDialogCancel><AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive hover:bg-destructive/90">ተማሪ ሰርዝ</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isImporting} onOpenChange={(open) => {
        setIsImporting(open);
        if (!open) setSelectedFile(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ተማሪዎችን ከኤክሴል አስመጣ</DialogTitle>
            <DialogDescription>
            የተማሪዎችን ዝርዝር ከ.xlsx ወይም ከ.xls ፋይል ያስመጡ። ፋይሉ "id", "fullName", "christianName", "gender", "educationLevel", "dob", "subcity", "kebele", "houseNumber", "houseAddressDetail", "fatherPhone", "motherPhone", "joiningDate", እና "role" አምዶችን መያዝ አለበት። ለ "gender" አምድ፣ እሴቶቹ “ወንድ” ወይም “ሴት” መሆን አለባቸው። ለ "role" አምድ፣ እሴቶቹ “ቀዳማይ -1 ክፍል”፣ “ቀዳማይ -2 ክፍል”፣ “ካእላይ ክፍል” ወይም “ማእከላይ ክፍል” መሆን አለባቸው። ለ "dob" እና "joiningDate" አምዶች ቀኖች በጎርጎርያን ካላንደር (ለምሳሌ 2024-07-26) መቀመጥ አለባቸው።
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="excel-file">የኤክሴል ፋይል</Label>
            <Input id="excel-file" type="file" accept=".xlsx, .xls" onChange={handleFileSelect} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImporting(false)}>ሰርዝ</Button>
            <Button onClick={handleImport} disabled={!selectedFile || isImportProcessing}>
                {isImportProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                አስመጣ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    

    