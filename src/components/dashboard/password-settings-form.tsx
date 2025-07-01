"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateAdminPassword } from "@/lib/data";
import type { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  role: z.enum(["children", "children2", "juniors", "seniors", "superadmin"], { required_error: "ሚና መምረጥ ያስፈልጋል።" }),
  password: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።"),
});

const ROLE_NAMES: Record<string, string> = {
    superadmin: "ዋና አስተዳዳሪ",
    children: "የቀዳማይ -1 ክፍል አስተዳዳሪ",
    children2: "የቀዳማይ -2 ክፍል አስተዳዳሪ",
    juniors: "የካእላይ ክፍል አስተዳዳሪ",
    seniors: "የማእከላይ ክፍል አስተዳዳሪ",
};


export function PasswordSettingsForm() {
    const { role: adminRole, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
        },
    });
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await updateAdminPassword(values.role, values.password);
            toast({
                title: "የይለፍ ቃል ተዘምኗል",
                description: `የ${ROLE_NAMES[values.role]} የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል።`,
            });
            form.reset({role: values.role, password: ''});
        } catch (error) {
            toast({
                variant: "destructive",
                title: "ስህተት",
                description: "የይለፍ ቃሉን ማዘመን አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
            });
        }
    }

    if (isAuthLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (adminRole !== 'superadmin') {
        return (
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>ያልተፈቀደ</AlertTitle>
                    <AlertDescription>
                        ይህንን ገጽ ለማየት ፈቃድ የለዎትም።
                    </AlertDescription>
                </Alert>
            </CardContent>
        );
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ሚና</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="የሚለወጠውን ሚና ይምረጡ" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(ROLE_NAMES).map(([role, name]) => (
                                            <SelectItem key={role} value={role}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>አዲስ የይለፍ ቃል</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        የይለፍ ቃል ቀይር
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
