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
  size?: keyof typeof sizeClasses;
};

export function Logo({
  className,
  showName = false,
  size = "md",
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={siteConfig.logo}
        alt={siteConfig.name}
        width={57}
        height={57}
        className={cn(sizeClasses[size], "shrink-0")}
      />
      {showName ? (
        <span className="text-base font-semibold text-foreground">
          {siteConfig.shortName}
        </span>
      ) : null}
    </div>
  );
}
