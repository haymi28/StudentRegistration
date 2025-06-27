
"use client";

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BookMarked,
  Shield,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogoutButton } from '@/components/logout-button';
import { useAuth } from '@/lib/auth';

const ROLE_NAMES: Record<string, string> = {
    superadmin: "ዋና አስተዳዳሪ",
    children: "የህፃናት አስተዳዳሪ",
    children2: "የህፃናት 2 አስተዳዳሪ",
    juniors: "የወጣቶች አስተዳዳሪ",
    seniors: "የአዋቂዎች አስተዳዳሪ"
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !role) {
      router.replace('/');
    }
  }, [isLoading, role, router]);


  if (isLoading || !role) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
  }

  const getIsActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <SidebarMenuButton tooltip="የተማሪዎች መመዝገቢያ ቅጽ" onClick={() => router.push('/dashboard')}>
                <BookMarked className="text-sidebar-primary" />
                <span className="font-headline font-semibold text-lg text-sidebar-primary">የተማሪዎች መመዝገቢያ ቅጽ</span>
            </SidebarMenuButton>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="ዳሽቦርድ" onClick={() => router.push('/dashboard')} isActive={getIsActive('/dashboard')}>
                <LayoutDashboard />
                <span>ዳሽቦርድ</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="ተማሪዎች" onClick={() => router.push('/dashboard/students')} isActive={getIsActive('/dashboard/students')}>
                    <Users />
                    <span>ተማሪዎች</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-2 w-full p-2">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback><Shield /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm truncate">
                        <span className="font-semibold text-sidebar-foreground">{ROLE_NAMES[role]}</span>
                        <span className="text-sidebar-foreground/70">{role}@academia.com</span>
                    </div>
                </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LogoutButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="w-full flex-1">
                {/* Can be used for a global search bar in the future */}
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
