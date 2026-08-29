import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  isGroupActive,
  isPathActive,
  routeKey,
  type AdminRoute,
} from "@/config/routes";
import {
  adminSidebarNavItem,
  adminSidebarNavItemActive,
  adminSidebarNavItemGroupActive,
} from "@/lib/admin-sidebar-styles";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface RouteItemProps {
  route: AdminRoute;
  collapsed?: boolean;
  depth?: number;
}

const navBase =
  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors";

export function RouteItem({
  route,
  collapsed = false,
  depth = 0,
}: RouteItemProps) {
  const { pathname } = useLocation();
  const setDrawerOpen = useUIStore((s) => s.setDrawerOpen);
  const children = route.children?.filter((child) => child.showInSidebar) ?? [];
  const hasChildren = children.length > 0;
  const groupActive = isGroupActive(pathname, route);
  const leafActive = route.href ? isPathActive(pathname, route.href) : false;
  const [open, setOpen] = useState(groupActive);

  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  if (hasChildren) {
    const defaultHref =
      route.href ?? children.find((child) => child.href)?.href ?? "/";

    if (collapsed) {
      return (
        <Link
          to={defaultHref}
          title={route.label}
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "flex items-center justify-center rounded-lg border px-2 py-1.5 text-sm font-medium transition-colors",
            groupActive ? adminSidebarNavItemActive : adminSidebarNavItem,
          )}
        >
          <route.icon className="size-4 shrink-0" />
        </Link>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex w-full",
            navBase,
            groupActive ? adminSidebarNavItemGroupActive : adminSidebarNavItem,
          )}
        >
          <route.icon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-start">
            {route.label}
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 opacity-70 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open ? (
          <div className="ms-3 flex flex-col gap-1 border-s border-admin-sidebar-border ps-2">
            {children.map((child) => (
              <RouteItem
                key={routeKey(child)}
                route={child}
                collapsed={false}
                depth={depth + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (!route.href) return null;

  return (
    <Link
      to={route.href}
      title={collapsed ? route.label : undefined}
      onClick={() => setDrawerOpen(false)}
      className={cn(
        navBase,
        collapsed && "justify-center px-2",
        depth > 0 && !collapsed && "py-1.5 text-[13px]",
        leafActive ? adminSidebarNavItemActive : adminSidebarNavItem,
      )}
    >
      <route.icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{route.label}</span>}
    </Link>
  );
}
