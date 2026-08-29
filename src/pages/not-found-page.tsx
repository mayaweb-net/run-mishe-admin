import { Link } from "react-router-dom";
import { ChevronLeft, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/main/logo";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-12deg, transparent, transparent 28px, color-mix(in oklab, var(--color-secondary-3) 35%, transparent) 28px, color-mix(in oklab, var(--color-secondary-3) 35%, transparent) 29px)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <Logo showName size="lg" className="mb-8" />

        <p className="mb-6 select-none text-[7rem] font-black leading-none tracking-tighter sm:text-[9rem]">
          <span className="text-primary-8">4</span>
          <span className="bg-linear-to-b from-secondary-6 to-secondary-8 bg-clip-text text-transparent">
            0
          </span>
          <span className="text-primary-8">4</span>
        </p>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          این صفحه در پنل پیدا نشد
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
          مسیر واردشده وجود نداره یا جابه‌جا شده. می‌تونی برگردی به داشبورد یا
          دوباره وارد بشی.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link to="/dashboard" />} nativeButton={false} size="lg">
            <LayoutDashboard />
            رفتن به داشبورد
          </Button>
          <Button
            render={<Link to="/login" />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            صفحه ورود
            <ChevronLeft />
          </Button>
        </div>

        <p className="mt-10 text-xs text-muted-foreground/80">
          کد خطا:{" "}
          <span dir="ltr" className="font-mono">
            404 NOT FOUND
          </span>
        </p>
      </div>
    </div>
  );
}
