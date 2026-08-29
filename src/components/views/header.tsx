import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { useCurrentRoute } from "@/navigation/use-current-route";
import { useUIStore } from "@/stores/ui-store";

export function Header() {
  const currentRoute = useCurrentRoute();
  const setDrawerOpen = useUIStore((s) => s.setDrawerOpen);

  return (
    <header className="sticky top-0 z-10 mb-6 flex items-center justify-between bg-background pb-3 pt-1">
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full lg:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="باز کردن منو"
        >
          <img
            src={siteConfig.logo}
            alt=""
            className="size-7 rounded-md object-cover"
          />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">
          {currentRoute?.label ?? siteConfig.shortName}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full border"
          aria-label="اعلان‌ها"
        >
          <Bell />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full border"
          aria-label="تنظیمات"
        >
          <Settings />
        </Button>
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          className="rounded-full"
          aria-label="حساب کاربری"
        >
          <User />
        </Button>
      </div>
    </header>
  );
}
