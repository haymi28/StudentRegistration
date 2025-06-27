
"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";

const ROLE_FRIENDLY_NAMES: Record<string, string> = {
    superadmin: "Super Admin",
    children: "Children's Group",
    juniors: "Juniors' Group",
    seniors: "Seniors' Group",
};

export default function DashboardPage() {
    const { role, isLoading } = useAuth();

    if (isLoading) {
        return <Loader2 className="h-8 w-8 animate-spin" />
    }
  
    const welcomeMessage = role === 'superadmin' 
        ? "You have access to all student groups."
        : `You are managing the ${ROLE_FRIENDLY_NAMES[role!]}.`;

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
        </div>
        <Card className="max-w-4xl">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Shield /> Welcome, {role ? ROLE_FRIENDLY_NAMES[role] : "Admin"}!
                </CardTitle>
                <CardDescription>{welcomeMessage}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Use the navigation on the left to manage students.</p>
                <p className="mt-4 text-sm text-muted-foreground">You can register new students, edit their information, and transfer them between groups from the "Students" page.</p>
            </CardContent>
        </Card>
    </div>
  );
}
