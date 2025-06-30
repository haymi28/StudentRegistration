
"use client"

import * as React from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

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
import type { Role, StudentCreateInput } from "@/lib/types"
import { toEthiopianDateString } from "@/lib/ethiopian-date"
import { Textarea } from "@/components/ui/textarea"

const ROLE_NAMES: Record<string, string> = {
    children: "ቀዳማይ -1 ክፍል",
    children2: "ቀዳማይ -2 ክፍል",
    juniors: "ካእላይ ክፍል",
    seniors: "ማእከላይ ክፍል"
};

const formSchema = z.object({
  studentId: z.string().min(2, { message: "የተማሪ መለያ ቢያንስ 2 ቁምፊዎች መሆን አለበት።" }),
  fullName: z.string().min(2, "ሙሉ ስም ያስፈልጋል።"),
  christianName: z.string().min(2, "የክርስትና ስም ያስፈልጋል።"),
  gender: z.enum(["ወንድ", "ሴት"], { required_error: "ጾታ ያስፈልጋል።" }),
  educationLevel: z.string().min(1, "የትምህርት ደረጃ ያስፈልጋል።"),
  dob: z.date({ required_error: "የትውልድ ቀን ያስፈልጋል።" }),
  subcity: z.string().min(1, "ክፍለ ከተማ ያስፈልጋል።"),
  kebele: z.string().min(1, "ቀበሌ ያስፈልጋል።"),
  houseNumber: z.string().min(1, "የቤት ቁጥር ያስፈልጋል።"),
  houseAddressDetail: z.string().min(1, "የቤት ልዩ አድራሻ ያስፈልጋል።"),
  phone: z.string().min(10, "ትክክለኛ ስልክ ቁጥር ያስፈልጋል።"),
  additionalPhone: z.string().min(10, "ትክክለኛ ተጨማሪ ስልክ ቁጥር ያስፈልጋል።").optional().or(z.literal('')),
  fatherPhone: z.string().min(10, "ትክክለኛ የአባት ስልክ ቁጥር ያስፈልጋል።").optional().or(z.literal('')),
  motherPhone: z.string().min(10, "ትክክለኛ የእናት ስልክ ቁጥር ያስፈልጋል።").optional().or(z.literal('')),
  joiningDate: z.date({ required_error: "የተቀላቀለበት ቀን ያስፈልጋል።" }),
  role: z.enum(["children", "children2", "juniors", "seniors"], { required_error: "ክፍል ያስፈልጋል።" }),
  photo: z.any().optional(),
})

export function RegisterStudentForm() {
    const router = useRouter()
    const { toast } = useToast()
    const { role: adminRole, isLoading } = useAuth()
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: "",
            fullName: "",
            christianName: "",
            educationLevel: "",
            subcity: "",
            kebele: "",
            houseNumber: "",
            houseAddressDetail: "",
            phone: "",
            additionalPhone: "",
            fatherPhone: "",
            motherPhone: "",
            role: adminRole !== 'superadmin' ? adminRole as Role : undefined,
        },
    })
    
    React.useEffect(() => {
        if (adminRole && adminRole !== 'superadmin') {
            form.setValue('role', adminRole as Role);
        }
    }, [adminRole, form]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        let photoUrl: string | null = null;
        if (values.photo && values.photo.length > 0) {
            const file = values.photo[0];
            try {
                photoUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
            } catch (error) {
                console.error("Error reading file:", error);
                toast({
                    variant: "destructive",
                    title: "ምስል መስቀል አልተሳካም።",
                    description: "የምስል ፋይሉን በማዘጋጀት ላይ ስህተት ነበር።",
                });
                return;
            }
        }
        
        const studentToSave: StudentCreateInput = {
          id: values.studentId.toUpperCase(),
          fullName: values.fullName,
          christianName: values.christianName,
          gender: values.gender,
          educationLevel: values.educationLevel,
          dob: values.dob,
          subcity: values.subcity,
          kebele: values.kebele,
          houseNumber: values.houseNumber,
          houseAddressDetail: values.houseAddressDetail,
          phone: values.phone,
          additionalPhone: values.additionalPhone ? values.additionalPhone : null,
          fatherPhone: values.fatherPhone ? values.fatherPhone : null,
          motherPhone: values.motherPhone ? values.motherPhone : null,
          joiningDate: values.joiningDate,
          role: values.role,
          photoUrl: photoUrl,
        };
        
        const result = await addStudent(studentToSave);

        if (result.error) {
            if (result.error.code === 'P2002') {
                 form.setError("studentId", {
                    type: "manual",
                    message: "ይህ የተማሪ መለያ አስቀድሞ አለ። እባክዎ ልዩ መለያ ይጠቀሙ።",
                });
                toast({
                    variant: "destructive",
                    title: "ምዝገባ አልተሳካም።",
                    description: `መለያ ${values.studentId.toUpperCase()} ያለው ተማሪ አስቀድሞ አለ።`,
                });
            } else {
                console.error("Failed to register student:", result.error.message);
                toast({
                    variant: "destructive",
                    title: "ምዝገባ አልተሳካም።",
                    description: "ያልተጠበቀ ስህተት ተፈጥሯል። እባክዎ ቆይተው እንደገና ይሞክሩ።",
                });
            }
        } else {
             toast({
                title: "ተማሪ ተመዝግቧል!",
                description: `${values.fullName} ወደ ስርዓቱ ተጨምሯል።`,
            });
            router.push("/dashboard/students");
        }
    }
    
    if (isLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">አዲስ ተማሪ ይመዝግቡ</CardTitle>
                <CardDescription>አዲስ ተማሪ ወደ ስርዓቱ ለመጨመር ከታች ያለውን ቅጽ ይሙሉ።</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem><FormLabel>ሙሉ ስም</FormLabel><FormControl><Input placeholder="እከሌ እከሌ" {...field} name="fullName" autoComplete="name" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="christianName" render={({ field }) => (
                            <FormItem><FormLabel>የክርስትና ስም</FormLabel><FormControl><Input placeholder="ዮሐንስ" {...field} name="christianName" autoComplete="off" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ጾታ</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} name="gender" autoComplete="sex">
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="ጾታ ይምረጡ" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ወንድ">ወንድ</SelectItem>
                                            <SelectItem value="ሴት">ሴት</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField control={form.control} name="educationLevel" render={({ field }) => (
                            <FormItem><FormLabel>የትምህርት ደረጃ</FormLabel><FormControl><Input placeholder="ለምሳሌ 5ኛ ክፍል" {...field} name="educationLevel" autoComplete="off" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dob" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>የትውልድ ቀን</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} name="dob" autoComplete="bday">{field.value ? toEthiopianDateString(field.value) : <span>ቀን ይምረጡ</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="studentId" render={({ field }) => (
                            <FormItem><FormLabel>የተማሪ መለያ</FormLabel><FormControl><Input placeholder="ተማሪ005" {...field} onInput={(e) => (e.currentTarget.value = e.currentTarget.value.toUpperCase())} name="studentId" autoComplete="off" /></FormControl><FormDescription>ልዩ መለያ መሆን አለበት።</FormDescription><FormMessage /></FormItem>
                        )} />
                        {adminRole === 'superadmin' ? (
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem><FormLabel>ክፍል</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} name="role" autoComplete="off">
                                        <FormControl><SelectTrigger><SelectValue placeholder="ለተማሪው ክፍል ይምረጡ" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="children">ቀዳማይ -1 ክፍል</SelectItem>
                                            <SelectItem value="children2">ቀዳማይ -2 ክፍል</SelectItem>
                                            <SelectItem value="juniors">ካእላይ ክፍል</SelectItem>
                                            <SelectItem value="seniors">ማእከላይ ክፍል</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                        ) : (
                             <FormItem><FormLabel>ክፍል</FormLabel><FormControl><Input id="role" name="role" value={adminRole ? ROLE_NAMES[adminRole] : ''} readOnly disabled /></FormControl></FormItem>
                        )}

                        <FormField control={form.control} name="joiningDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>የተቀላቀለበት ቀን</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} name="joiningDate" autoComplete="off">{field.value ? toEthiopianDateString(field.value) : <span>ቀን ይምረጡ</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                        )} />
                        
                        <FormField
                            control={form.control}
                            name="photo"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>የተማሪ ፎቶ</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            name="photo"
                                            accept="image/*"
                                            onChange={(e) => {
                                                field.onChange(e.target.files);
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPhotoPreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                } else {
                                                    setPhotoPreview(null);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>አማራጭ። የተማሪውን ፎቶ ይስቀሉ።</FormDescription>
                                    {photoPreview && (
                                        <div className="mt-4">
                                            <Image src={photoPreview} alt="Student preview" width={100} height={100} className="rounded-full aspect-square object-cover" data-ai-hint="person student" />
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="md:col-span-2 space-y-4 rounded-lg border p-4">
                            <h3 className="text-lg font-medium">አድራሻ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="subcity" render={({ field }) => ( <FormItem><FormLabel>ክፍለ ከተማ</FormLabel><FormControl><Input placeholder="ለምሳሌ ቂርቆስ" {...field} name="subcity" autoComplete="address-level1" /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="kebele" render={({ field }) => ( <FormItem><FormLabel>ቀበሌ</FormLabel><FormControl><Input placeholder="ለምሳሌ 08" {...field} name="kebele" autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="houseNumber" render={({ field }) => ( <FormItem><FormLabel>የቤት ቁጥር</FormLabel><FormControl><Input placeholder="ለምሳሌ 123" {...field} name="houseNumber" autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                            <FormField control={form.control} name="houseAddressDetail" render={({ field }) => ( <FormItem><FormLabel>የቤት ልዩ አድራሻ</FormLabel><FormControl><Textarea placeholder="የቤቱን አድራሻ በዝርዝር ያስገቡ (ለምሳሌ: ከትምህርት ቤቱ ጀርባ)" {...field} name="houseAddressDetail" autoComplete="street-address" /></FormControl><FormMessage /></FormItem> )} />
                        </div>

                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>ስልክ ቁጥር</FormLabel><FormControl><Input type="tel" placeholder="0911223344" {...field} name="phone" autoComplete="tel" /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="additionalPhone" render={({ field }) => ( <FormItem><FormLabel>ተጨማሪ ስልክ</FormLabel><FormControl><Input type="tel" placeholder="0911223344" {...field} name="additionalPhone" autoComplete="tel-additional" /></FormControl><FormDescription>አማራጭ</FormDescription><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="fatherPhone" render={({ field }) => ( <FormItem><FormLabel>የአባት ስልክ ቁጥር</FormLabel><FormControl><Input type="tel" placeholder="0911223344" {...field} name="fatherPhone" autoComplete="tel" /></FormControl><FormDescription>አማራጭ</FormDescription><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="motherPhone" render={({ field }) => ( <FormItem><FormLabel>የእናት ስልክ ቁጥር</FormLabel><FormControl><Input type="tel" placeholder="0911223344" {...field} name="motherPhone" autoComplete="tel" /></FormControl><FormDescription>አማራጭ</FormDescription><FormMessage /></FormItem> )} />

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>ሰርዝ</Button>
                        <Button type="submit">ተማሪ ይመዝግቡ</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}

    

    