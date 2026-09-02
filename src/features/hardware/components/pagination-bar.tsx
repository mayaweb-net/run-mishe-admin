import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationBarProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        {total.toLocaleString("fa-IR")} مورد — صفحه{" "}
        {page.toLocaleString("fa-IR")} از{" "}
        {Math.max(totalPages, 1).toLocaleString("fa-IR")}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronRight />
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          بعدی
          <ChevronLeft />
        </Button>
      </div>
    </div>
  );
}
