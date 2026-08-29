import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { RouteList } from "@/components/common/route-list";
import { Logo } from "@/components/main/logo";
import { SidebarUserCard } from "@/components/views/sidebar-user-card";
import { siteConfig } from "@/lib/site";
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
        "flex h-full flex-col overflow-y-auto p-4 text-white transition-all duration-300",
        inDrawer ? "rounded-l-3xl" : "lg:rounded-3xl",
        inDrawer ? "w-full" : collapsed ? "w-16" : "w-52",
      )}
      style={{ backgroundColor: siteConfig.sidebarBg }}
    >
      <button
        type="button"
        onClick={inDrawer ? undefined : toggleSidebar}
        className={cn(
          "flex items-center rounded-lg p-1 text-start transition-colors",
          !inDrawer && "cursor-pointer hover:bg-white/8",
          collapsed ? "justify-center" : "gap-2.5",
        )}
      >
        <Logo
          size="sm"
          showName={!collapsed}
          subtitle="پنل مدیریت"
          onDark
        />
      </button>
      <div className="mt-4 h-px bg-white/10" />

      <RouteList collapsed={collapsed} />

      <div className="mt-auto pt-4">
        <div className="mb-3 h-px bg-white/10" />
        <SidebarUserCard collapsed={collapsed} />
        <Link
          to="/logout"
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-white/65 transition-colors hover:bg-white/8 hover:text-white",
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
