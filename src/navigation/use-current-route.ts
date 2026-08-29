import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  flattenLeafRoutes,
  getSidebarRoutes,
  isPathActive,
} from "@/config/routes";

export function useCurrentRoute() {
  const { pathname } = useLocation();

  return useMemo(() => {
    const routes = getSidebarRoutes();
    const leaves = flattenLeafRoutes(routes);
    const sorted = [...leaves].sort(
      (a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0),
    );

    return sorted.find(
      (route) => route.href && isPathActive(pathname, route.href),
    );
  }, [pathname]);
}

export function useIsRouteActive(href: string) {
  const { pathname } = useLocation();

  return useMemo(() => isPathActive(pathname, href), [pathname, href]);
}
