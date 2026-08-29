import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminRoute {
  id?: string;
  href?: string;
  label: string;
  icon: LucideIcon;
  showInSidebar: boolean;
  children?: AdminRoute[];
}

export const adminRoutes: AdminRoute[] = [
  {
    href: "/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
    showInSidebar: true,
  },
  {
    href: "/events",
    label: "رویدادها",
    icon: CalendarDays,
    showInSidebar: true,
  },
  {
    href: "/users",
    label: "کاربران",
    icon: Users,
    showInSidebar: true,
  },
  {
    href: "/settings",
    label: "تنظیمات",
    icon: Settings,
    showInSidebar: true,
  },
  {
    href: "/logout",
    label: "خروج",
    icon: LogOut,
    showInSidebar: false,
  },
];

export function getSidebarRoutes() {
  return adminRoutes.filter((route) => route.showInSidebar);
}

export function flattenLeafRoutes(routes: AdminRoute[]): AdminRoute[] {
  return routes.flatMap((route) =>
    route.children?.length
      ? flattenLeafRoutes(route.children)
      : route.href
        ? [route]
        : [],
  );
}

export function routeKey(route: AdminRoute) {
  return route.id ?? route.href ?? route.label;
}

export function isPathActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isGroupActive(pathname: string, route: AdminRoute): boolean {
  if (route.children?.length) {
    return route.children.some((child) => isGroupActive(pathname, child));
  }
  if (!route.href) return false;
  return isPathActive(pathname, route.href);
}
