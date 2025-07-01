
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateAdminPassword } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

import { Loader2, Eye, EyeOff } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  password: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።"),
  confirmPassword: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።"),
}).refine(data => data.password === data.confirmPassword, {
  message: "የይለፍ ቃላት አይዛመዱም።",
  path: ["confirmPassword"],
});


const ROLE_NAMES: Record<string, string> = {
    superadmin: "ዋና አስተዳዳሪ",
    children: "የቀዳማይ -1 ክፍል አስተዳዳሪ",
    children2: "የቀዳማይ -2 ክፍል አስተዳዳሪ",
    juniors: "የካእላይ ክፍል አስተዳዳሪ",
    seniors: "የማእከላይ ክፍል አስተዳዳሪ",
};

export function PasswordSettingsForm() {
    const { role, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!role) return;

        try {
            await updateAdminPassword(role, values.password);
            toast({
                title: "የይለፍ ቃል ተዘምኗል",
                description: `የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል።`,
            });
            form.reset();
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
    
    if (!role) {
      router.push('/');
      return null;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                     <div>
                      <Label>ሚና</Label>
                      <Input value={ROLE_NAMES[role]} readOnly disabled className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-2">የዚህን ሚና የይለፍ ቃል እየቀየሩ ነው።</p>
                    </div>
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
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>አዲሱን የይለፍ ቃል ያረጋግጡ</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
