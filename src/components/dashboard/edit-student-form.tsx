
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { getStudentById, updateStudent } from "@/lib/data"
import type { Student, Role } from "@/lib/types"

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  christianName: z.string().min(2, "Christian name is required."),
  dob: z.date({ required_error: "A date of birth is required." }),
  address: z.string().min(5, "Address is required."),
  fatherPhone: z.string().min(10, "A valid phone number is required."),
  motherPhone: z.string().min(10, "A valid phone number is required."),
  joiningDate: z.date({ required_error: "A joining date is required." }),
  role: z.enum(["children", "juniors", "seniors"]),
})

export function EditStudentForm({ studentId }: { studentId: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const { role: adminRole, isLoading } = useAuth();
    const [student, setStudent] = React.useState<Student | null | undefined>(undefined)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const fetchAndSetStudent = React.useCallback(() => {
        const studentData = getStudentById(studentId);
        if (studentData) {
            setStudent(studentData);
            form.reset({
                ...studentData,
            });
        } else {
             setStudent(null);
        }
    }, [studentId, form]);

    React.useEffect(() => {
        fetchAndSetStudent();
        
        const handleStorageChange = () => fetchAndSetStudent();
        window.addEventListener('local-storage-update', handleStorageChange);

        return () => {
            window.removeEventListener('local-storage-update', handleStorageChange);
        };
    }, [fetchAndSetStudent]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!student) return;
        updateStudent({
            ...student,
            ...values,
        });
        toast({
            title: "Student Updated!",
            description: `${values.fullName}'s information has been updated.`,
        })
        router.push("/dashboard/students")
    }

    if (student === undefined || isLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    if (student === null) {
        return (
            <Card className="w-full max-w-2xl mx-auto"><CardHeader><CardTitle className="font-headline text-2xl">Student Not Found</CardTitle><CardDescription>The student you are trying to edit does not exist.</CardDescription></CardHeader><CardFooter><Button variant="outline" onClick={() => router.back()}>Go Back</Button></CardFooter></Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader><CardTitle className="font-headline text-2xl">Edit Student Information</CardTitle><CardDescription>Update the details for {student.fullName}.</CardDescription></CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div><Label>Student ID</Label><Input value={student.id} readOnly disabled className="mt-2" /><FormDescription className="mt-2">The student ID cannot be changed.</FormDescription></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="christianName" render={({ field }) => ( <FormItem><FormLabel>Christian Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem> )} />
                             <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date of birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="joiningDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date of Joining</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem><FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={adminRole !== 'superadmin'}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="children">Children</SelectItem>
                                            <SelectItem value="juniors">Juniors</SelectItem>
                                            <SelectItem value="seniors">Seniors</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Only a Super Admin can change the role here.</FormDescription>
                                <FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="address" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St, Anytown" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="fatherPhone" render={({ field }) => ( <FormItem><FormLabel>Father's Phone</FormLabel><FormControl><Input type="tel" placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="motherPhone" render={({ field }) => ( <FormItem><FormLabel>Mother's Phone</FormLabel><FormControl><Input type="tel" placeholder="098-765-4321" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
