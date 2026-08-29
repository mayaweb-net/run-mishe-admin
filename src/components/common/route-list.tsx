import { getSidebarRoutes } from "@/config/routes";
import { RouteItem } from "./route-item";

interface RouteListProps {
  collapsed?: boolean;
}

export function RouteList({ collapsed = false }: RouteListProps) {
  const routes = getSidebarRoutes();

  return (
    <nav className="mt-5 flex flex-col gap-1.5">
      {routes.map((route) => (
        <RouteItem key={route.href ?? route.label} route={route} collapsed={collapsed} />
      ))}
    </nav>
  );
}
