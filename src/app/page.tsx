
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookMarked, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const ROLE_CREDENTIALS: Record<UserRole, { password: string }> = {
    superadmin: { password: "superpassword" },
    children: { password: "childrenpassword" },
    juniors: { password: "juniorspassword" },
    seniors: { password: "seniorspassword" },
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('children');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ROLE_CREDENTIALS[selectedRole].password === password) {
      login(selectedRole);
      router.push('/dashboard');
    } else {
      setError('Invalid password for the selected role.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-8">
            <BookMarked className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-primary">Academia</h1>
        </div>
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2 justify-center"><Users /> Admin Login</CardTitle>
            <CardDescription>Select your role and enter the password.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 text-left">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="children">Children's Admin</SelectItem>
                        <SelectItem value="juniors">Juniors Admin</SelectItem>
                        <SelectItem value="seniors">Seniors Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Sign in</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
