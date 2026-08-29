import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { RouteList } from "@/components/common/route-list";
import { Logo } from "@/components/main/logo";
import { SidebarUserCard } from "@/components/views/sidebar-user-card";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface SidebarProps {
  inDrawer?: boolean;
}

export function Sidebar({ inDrawer = false }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, setDrawerOpen } = useUIStore();
  const collapsed = inDrawer ? false : sidebarCollapsed;

  return (
    <aside
      className={cn(
        "flex flex-col overflow-y-auto p-4 text-admin-sidebar-foreground transition-all duration-300",
        inDrawer
          ? "h-full min-h-0 w-full bg-transparent"
          : "h-full bg-admin-sidebar lg:rounded-s-none lg:rounded-e-3xl",
        !inDrawer && (collapsed ? "w-16" : "w-52"),
      )}
    >
      <button
        type="button"
        onClick={inDrawer ? undefined : toggleSidebar}
        className={cn(
          "flex items-center rounded-lg p-1 text-start transition-colors",
          !inDrawer && "cursor-pointer hover:bg-admin-sidebar-hover",
          collapsed ? "justify-center" : "gap-2.5",
        )}
      >
        <Logo size="sm" showName={!collapsed} subtitle="پنل مدیریت" onDark />
      </button>

      <div className="mt-4 h-px bg-admin-sidebar-border" />

      <RouteList collapsed={collapsed} />

      <div className="mt-auto pt-4">
        <div className="mb-3 h-px bg-admin-sidebar-border" />
        <SidebarUserCard collapsed={collapsed} />
        <Link
          to="/logout"
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-admin-sidebar-muted transition-colors hover:bg-admin-sidebar-hover hover:text-admin-sidebar-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>خروج</span>}
        </Link>
      </div>
    </aside>
  );
}
