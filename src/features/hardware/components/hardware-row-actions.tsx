import { Link } from "react-router-dom";
import { Link2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HardwareRowActionsProps {
  detailHref: string;
  onDelete: () => void;
  onSuggestMatch?: () => void;
}

export function HardwareRowActions({
  detailHref,
  onDelete,
  onSuggestMatch,
}: HardwareRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onSuggestMatch ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSuggestMatch}
          aria-label="پیشنهاد اتصال"
        >
          <Link2 />
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link to={detailHref} />}
        aria-label="مشاهده جزئیات"
      >
        <Search />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label="حذف"
      >
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  );
}
