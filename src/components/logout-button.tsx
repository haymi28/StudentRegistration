"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Here you would typically clear session, cookies, etc.
    router.push("/");
  };

  return (
    <SidebarMenuButton
      onClick={handleLogout}
      tooltip="Logout"
    >
      <LogOut />
      <span>Logout</span>
    </SidebarMenuButton>
  );
}
