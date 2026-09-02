import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCoverThumbProps {
  coverUrl: string | null;
  name: string;
  className?: string;
}

export function GameCoverThumb({ coverUrl, name, className }: GameCoverThumbProps) {
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={name}
        loading="lazy"
        className={cn(
          "aspect-[460/215] w-full rounded-lg border bg-muted object-cover shadow-sm",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-[460/215] w-full items-center justify-center rounded-lg border bg-linear-to-br from-muted/80 to-muted/30 text-muted-foreground shadow-sm",
        className,
      )}
    >
      <Gamepad2 className="size-5" />
    </div>
  );
}
