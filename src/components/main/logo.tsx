import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
} as const;

type LogoProps = {
  className?: string;
  showName?: boolean;
  subtitle?: string;
  size?: keyof typeof sizeClasses;
  /** لوگوی تیره روی پس‌زمینه تیره — با باکس سفید نمایش داده می‌شود */
  onDark?: boolean;
};

export function Logo({
  className,
  showName = false,
  subtitle,
  size = "md",
  onDark = false,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          onDark && "rounded-lg bg-white p-1",
          sizeClasses[size],
        )}
      >
        <img
          src={siteConfig.logo}
          alt={siteConfig.name}
          width={57}
          height={57}
          className={cn(
            onDark ? "size-full object-contain" : sizeClasses[size],
            !onDark && "shrink-0",
          )}
        />
      </div>
      {showName ? (
        <div className="min-w-0">
          <span
            className={cn(
              "block truncate text-base font-semibold leading-tight",
              onDark ? "text-admin-sidebar-foreground" : "text-foreground",
            )}
          >
            {siteConfig.shortName}
          </span>
          {subtitle ? (
            <span
              className={cn(
                "block truncate text-[10px]",
                onDark ? "text-admin-sidebar-subtle" : "text-muted-foreground",
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
