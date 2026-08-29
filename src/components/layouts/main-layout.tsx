import { DrawerSidebar } from "@/components/views/drawer-sidebar";
import { Header } from "@/components/views/header";
import { Sidebar } from "@/components/views/sidebar";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <>
      <div className="m-3 flex h-[calc(100dvh-1.5rem)] gap-4 lg:m-4 lg:h-[calc(100dvh-2rem)] lg:gap-5">
        <div
          className={cn(
            "hidden h-full shrink-0 transition-all duration-300 lg:block",
            sidebarCollapsed ? "w-16" : "w-52",
          )}
        >
          <Sidebar />
        </div>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Header />
          <section className="min-h-0 flex-1 px-1 sm:px-2">{children}</section>
        </main>
      </div>

      <DrawerSidebar />
    </>
  );
}
