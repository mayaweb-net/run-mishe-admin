import type { CSSProperties } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Sidebar } from "@/components/views/sidebar";
import { siteConfig } from "@/lib/site";
import { useUIStore } from "@/stores/ui-store";

export function DrawerSidebar() {
  const { drawerOpen, setDrawerOpen } = useUIStore();

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      swipeDirection="right"
    >
      <DrawerContent
        className="inset-y-0 right-0! m-0! h-full w-56! max-w-56! rounded-l-3xl border-0 p-0 shadow-[16px_0_0_0_var(--drawer-bleed-background)] outline-none data-[swipe-direction=right]:right-0! data-[swipe-direction=right]:rounded-l-3xl data-[swipe-direction=right]:border-0 [--drawer-content-width:14rem]! [--drawer-inset:0px]"
        style={
          {
            backgroundColor: siteConfig.sidebarBg,
            "--drawer-bleed-background": siteConfig.sidebarBg,
          } as CSSProperties
        }
      >
        <DrawerTitle className="sr-only">منوی اصلی</DrawerTitle>
        <Sidebar inDrawer />
      </DrawerContent>
    </Drawer>
  );
}
