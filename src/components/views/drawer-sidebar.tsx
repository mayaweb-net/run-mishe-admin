import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Sidebar } from "@/components/views/sidebar";
import { useUIStore } from "@/stores/ui-store";

export function DrawerSidebar() {
  const { drawerOpen, setDrawerOpen } = useUIStore();

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      swipeDirection="right"
    >
      <DrawerContent className="inset-y-0 right-0! m-0! h-full w-56! max-w-56! overflow-hidden rounded-s-none! rounded-e-3xl border-0! bg-admin-sidebar p-0 shadow-none ring-0 outline-none after:hidden data-[swipe-direction=right]:right-0! data-[swipe-direction=right]:rounded-s-none! data-[swipe-direction=right]:rounded-e-3xl data-[swipe-direction=right]:border-0! [--bleed:0px] [--drawer-content-height:100dvh] [--drawer-content-width:14rem]! [--drawer-inset:0px]">
        <DrawerTitle className="sr-only">منوی اصلی</DrawerTitle>
        <Sidebar inDrawer />
      </DrawerContent>
    </Drawer>
  );
}
