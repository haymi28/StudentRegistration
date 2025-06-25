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
import { BookMarked } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would perform authentication here
    router.push('/dashboard');
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-8">
            <BookMarked className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-primary">Academia Attendance</h1>
        </div>
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 text-left">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@example.com" required defaultValue="admin@example.com" />
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required defaultValue="password" />
              </div>
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
