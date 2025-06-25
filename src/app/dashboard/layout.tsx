import * as React from 'react';
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
  ClipboardList,
  BookMarked,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogoutButton } from '@/components/logout-button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <ButtonLink href="/dashboard">
              <BookMarked className="text-sidebar-primary" />
              <span className="font-headline font-semibold text-lg text-sidebar-primary">Academia</span>
            </ButtonLink>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <ButtonLink href="/dashboard">
                <LayoutDashboard />
                <span>Check-In</span>
              </ButtonLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <ButtonLink href="/dashboard/students">
                <Users />
                <span>Students</span>
              </ButtonLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <ButtonLink href="/dashboard/attendance">
                <ClipboardList />
                <span>Attendance</span>
              </ButtonLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-2 w-full p-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="@admin" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm truncate">
                        <span className="font-semibold text-sidebar-foreground">Admin User</span>
                        <span className="text-sidebar-foreground/70">admin@academia.com</span>
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

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} passHref legacyBehavior>
            <SidebarMenuButton asChild tooltip={children.toString()}>
                {children}
            </SidebarMenuButton>
        </Link>
    )
}
