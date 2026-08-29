import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockUser = {
  name: "مدیر سیستم",
  role: "ادمین",
  phone: "09123456789",
};

export function SidebarUserCard({ collapsed = false }: { collapsed?: boolean }) {
  const initials = mockUser.name.charAt(0);

  if (collapsed) {
    return (
      <div
        title={`${mockUser.name} — ${mockUser.role}`}
        className="mb-2 flex items-center justify-center"
      >
        <span className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold text-white">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold leading-tight text-white">
          {mockUser.name}
        </p>
        <Badge
          variant="secondary"
          className="shrink-0 border-0 bg-white/15 text-[10px] text-white"
        >
          {mockUser.role}
        </Badge>
      </div>
      <p className="mt-1 truncate text-[11px] text-white/55" dir="ltr">
        {mockUser.phone}
      </p>
    </div>
  );
}
