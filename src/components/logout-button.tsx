
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <SidebarMenuButton
      onClick={handleLogout}
      tooltip="ውጣ"
    >
      <LogOut />
      <span>ውጣ</span>
    </SidebarMenuButton>
  );
}
