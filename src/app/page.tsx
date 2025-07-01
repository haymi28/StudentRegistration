
"use client";

import * as React from "react";
import Image from "next/image";
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
import { Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const ROLE_CREDENTIALS: Record<UserRole, { password: string }> = {
    superadmin: { password: "superpassword" },
    children: { password: "childrenpassword" },
    children2: { password: "children2password" },
    juniors: { password: "juniorspassword" },
    seniors: { password: "seniorspassword" },
    youth: { password: "youthpassword" },
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
      setError('ለምርጥ ክፍል የተሳሳተ የይለፍ ቃል።');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex flex-col items-center">
            <Image
              src="/dgc_logo.png"
              alt="የደብረ ገሊላ ቅዱስ ዐማኑኤል ካቴድራል እግዚአብሔር ምስሌነ ሰ/ት/ቤት Logo"
              width={150}
              height={150}
              className="mb-4"
              data-ai-hint="church logo"
              priority
            />
            <h2 className="text-2xl font-headline font-bold text-primary mb-2 text-center">የደብረ ገሊላ ቅዱስ ዐማኑኤል ካቴድራል እግዚአብሔር ምስሌነ ሰ/ት/ቤት</h2>
            <div className="flex items-center justify-center gap-4">
                <h1 className="text-2xl font-headline font-bold text-primary">የተማሪዎች መመዝገቢያ ቅጽ</h1>
            </div>
        </div>
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2 justify-center"><Users /> የአስተዳዳሪ መግቢያ</CardTitle>
            <CardDescription>የአስተዳዳሪነት ክፍልዎን ይምረጡ እና የይለፍ ቃልዎን ያስገቡ።</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 text-left">
                <Label htmlFor="role">ክፍል</Label>
                <Select name="role" value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)} autoComplete="off">
                    <SelectTrigger id="role">
                        <SelectValue placeholder="ክፍል ይምረጡ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="children">ቀዳማይ -1 ክፍል አስተዳዳሪ</SelectItem>
                        <SelectItem value="children2">ቀዳማይ -2 ክፍል አስተዳዳሪ</SelectItem>
                        <SelectItem value="juniors">ካእላይ ክፍል አስተዳዳሪ</SelectItem>
                        <SelectItem value="seniors">ማእከላይ ክፍል አስተዳዳሪ</SelectItem>
                        <SelectItem value="youth">የወጣት ክፍል አስተዳዳሪ</SelectItem>
                        <SelectItem value="superadmin">ዋና አስተዳዳሪ</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="password">የይለፍ ቃል</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">ይግቡ</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
