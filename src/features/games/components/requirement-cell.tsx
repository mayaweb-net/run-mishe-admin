import { Badge } from "@/components/ui/badge";
import type { RequirementSummary } from "@/features/games/types";

export function RequirementCell({
  summary,
}: {
  summary: RequirementSummary | null;
}) {
  if (!summary) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="space-y-0.5 text-xs leading-5">
      <div>
        <span className="text-muted-foreground">CPU:</span> {summary.cpu ?? "—"}{" "}
        {summary.cpu ? (
          <Badge
            variant="outline"
            className={
              summary.cpuLinked
                ? "border-emerald-500/40 text-emerald-600"
                : "border-amber-500/40 text-amber-600"
            }
          >
            {summary.cpuLinked ? "متصل" : "ناقص"}
          </Badge>
        ) : null}
      </div>
      <div>
        <span className="text-muted-foreground">GPU:</span> {summary.gpu ?? "—"}{" "}
        {summary.gpu ? (
          <Badge
            variant="outline"
            className={
              summary.gpuLinked
                ? "border-emerald-500/40 text-emerald-600"
                : "border-amber-500/40 text-amber-600"
            }
          >
            {summary.gpuLinked ? "متصل" : "ناقص"}
          </Badge>
        ) : null}
      </div>
      <div>
        <span className="text-muted-foreground">RAM:</span>{" "}
        {summary.ramGb != null ? `${summary.ramGb} GB` : "—"}
      </div>
      {summary.needsReview ? (
        <Badge variant="destructive">نیازمند بررسی</Badge>
      ) : null}
    </div>
  );
}
