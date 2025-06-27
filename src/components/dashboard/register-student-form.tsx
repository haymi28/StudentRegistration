
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { addStudent } from "@/lib/data"
import type { Role } from "@/lib/types"

const ROLE_NAMES: Record<string, string> = {
    children: "Children",
    juniors: "Juniors",
    seniors: "Seniors"
};

const formSchema = z.object({
  studentId: z.string().min(2, { message: "Student ID must be at least 2 characters." }),
  fullName: z.string().min(2, "Full name is required."),
  christianName: z.string().min(2, "Christian name is required."),
  dob: z.date({ required_error: "A date of birth is required." }),
  address: z.string().min(5, "Address is required."),
  fatherPhone: z.string().min(10, "A valid phone number is required."),
  motherPhone: z.string().min(10, "A valid phone number is required."),
  joiningDate: z.date({ required_error: "A joining date is required." }),
  role: z.enum(["children", "juniors", "seniors"], { required_error: "Role is required." }),
})

export function RegisterStudentForm() {
    const router = useRouter()
    const { toast } = useToast()
    const { role: adminRole, isLoading } = useAuth()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: "",
            fullName: "",
            christianName: "",
            address: "",
            fatherPhone: "",
            motherPhone: "",
            role: adminRole !== 'superadmin' ? adminRole as Role : undefined,
        },
    })
    
    // Set the role once the admin role is loaded
    React.useEffect(() => {
        if (adminRole && adminRole !== 'superadmin') {
            form.setValue('role', adminRole as Role);
        }
    }, [adminRole, form]);


    function onSubmit(values: z.infer<typeof formSchema>) {
        const success = addStudent({
            id: values.studentId.toUpperCase(),
            ...values
        })
        
        if (success) {
            toast({
                title: "Student Registered!",
                description: `${values.fullName} has been added to the system.`,
            })
            router.push("/dashboard/students")
        } else {
             form.setError("studentId", {
                type: "manual",
                message: "This Student ID already exists. Please use a unique ID.",
            });
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: `A student with ID ${values.studentId.toUpperCase()} already exists.`,
            })
        }
    }
    
    if (isLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Register New Student</CardTitle>
                <CardDescription>Fill in the form below to add a new student to the system.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="christianName" render={({ field }) => (
                            <FormItem><FormLabel>Christian Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dob" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Date of birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="studentId" render={({ field }) => (
                            <FormItem><FormLabel>Student ID</FormLabel><FormControl><Input placeholder="STU005" {...field} onInput={(e) => (e.currentTarget.value = e.currentTarget.value.toUpperCase())} /></FormControl><FormDescription>Must be a unique ID.</FormDescription><FormMessage /></FormItem>
                        )} />
                        {adminRole === 'superadmin' ? (
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem><FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a role for the student" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="children">Children</SelectItem>
                                            <SelectItem value="juniors">Juniors</SelectItem>
                                            <SelectItem value="seniors">Seniors</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                        ) : (
                             <FormItem><FormLabel>Role</FormLabel><FormControl><Input value={adminRole ? ROLE_NAMES[adminRole] : ''} readOnly disabled /></FormControl></FormItem>
                        )}

                        <FormField control={form.control} name="joiningDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Date of Joining</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St, Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="fatherPhone" render={({ field }) => (
                            <FormItem><FormLabel>Father's Phone</FormLabel><FormControl><Input type="tel" placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="motherPhone" render={({ field }) => (
                            <FormItem><FormLabel>Mother's Phone</FormLabel><FormControl><Input type="tel" placeholder="098-765-4321" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit">Register Student</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
