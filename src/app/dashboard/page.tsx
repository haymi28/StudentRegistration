
"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";

const ROLE_FRIENDLY_NAMES: Record<string, string> = {
    superadmin: "ዋና አስተዳዳሪ",
    children: "ቀዳማይ -1 ክፍል",
    children2: "ቀዳማይ -2 ክፍል",
    juniors: "ካእላይ ክፍል",
    seniors: "ማእከላይ ክፍል",
    youth: "የወጣት ክፍል"
};

export default function DashboardPage() {
    const { role, isLoading } = useAuth();

    if (isLoading) {
        return <Loader2 className="h-8 w-8 animate-spin" />
    }
  
    const welcomeMessage = role === 'superadmin' 
        ? "ለሁሉም የተማሪ ቡድኖች መዳረሻ አለዎት።"
        : `እርስዎ ${ROLE_FRIENDLY_NAMES[role!]}ን እያስተዳደሩ ነው።`;

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">ዳሽቦርድ</h1>
        </div>
        <Card className="max-w-4xl">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Shield /> እንኳን ደህና መጡ, {role ? ROLE_FRIENDLY_NAMES[role] : "አስተዳዳሪ"}!
                </CardTitle>
                <CardDescription>{welcomeMessage}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>ተማሪዎችን ለማስተዳደር በግራ በኩል ያለውን ዳሰሳ ይጠቀሙ።</p>
                <p className="mt-4 text-sm text-muted-foreground">ከ"ተማሪዎች" ገጽ አዳዲስ ተማሪዎችን መመዝገብ፣ መረጃቸውን ማርትዕ እና በቡድኖች መካከል ማስተላለፍ ይችላሉ።</p>
            </CardContent>
        </Card>
    </div>
  );
}
