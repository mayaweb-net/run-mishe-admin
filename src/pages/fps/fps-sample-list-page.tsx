import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminFpsSamples } from "@/features/fps/api";
import { FpsSampleFilters } from "@/features/fps/components/fps-sample-filters";
import type {
  FpsSampleListItem,
  FpsSampleListQuery,
  PaginatedResult,
  QualityPreset,
  ScreenResolution,
} from "@/features/fps/types";
import { presetLabels, resolutionLabels } from "@/features/fps/types";
import { PaginationBar } from "@/features/hardware/components/pagination-bar";

const sortOptions = [
  { value: "capturedAt:desc", label: "تاریخ (جدیدتر)" },
  { value: "avgFps:desc", label: "FPS (بیشترین)" },
  { value: "avgFps:asc", label: "FPS (کمترین)" },
  { value: "confidence:desc", label: "اطمینان (بیشترین)" },
  { value: "gameName:asc", label: "بازی (الف-ی)" },
  { value: "gpuName:asc", label: "GPU (الف-ی)" },
  { value: "source:asc", label: "منبع" },
];

function parseQuery(searchParams: URLSearchParams): FpsSampleListQuery {
  return {
    page: Number(searchParams.get("page") ?? "1") || 1,
    limit: Number(searchParams.get("limit") ?? "20") || 20,
    q: searchParams.get("q") ?? undefined,
    gameId: searchParams.get("gameId") ?? undefined,
    gpuId: searchParams.get("gpuId") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    resolution:
      (searchParams.get("resolution") as ScreenResolution | null) ?? undefined,
    preset: (searchParams.get("preset") as QualityPreset | null) ?? undefined,
    sortBy: searchParams.get("sortBy") ?? "capturedAt",
    sortOrder:
      (searchParams.get("sortOrder") as FpsSampleListQuery["sortOrder"]) ??
      "desc",
  };
}

function toSearchParams(query: FpsSampleListQuery) {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit && query.limit !== 20) params.set("limit", String(query.limit));
  if (query.q) params.set("q", query.q);
  if (query.gameId) params.set("gameId", query.gameId);
  if (query.gpuId) params.set("gpuId", query.gpuId);
  if (query.source) params.set("source", query.source);
  if (query.resolution) params.set("resolution", query.resolution);
  if (query.preset) params.set("preset", query.preset);
  if (query.sortBy && query.sortBy !== "capturedAt") {
    params.set("sortBy", query.sortBy);
  }
  if (query.sortOrder && query.sortOrder !== "desc") {
    params.set("sortOrder", query.sortOrder);
  }
  return params;
}

function formatFps(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function FpsSampleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [data, setData] =
    useState<PaginatedResult<FpsSampleListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateQuery = useCallback(
    (patch: Partial<FpsSampleListQuery>) => {
      setSearchParams(toSearchParams({ ...query, ...patch }), { replace: true });
    },
    [query, setSearchParams],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAdminFpsSamples(query);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          setError("بارگذاری نمونه‌های FPS با خطا مواجه شد.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      {query.gameId ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">فیلتر بازی</Badge>
          <button
            type="button"
            className="underline-offset-2 hover:underline"
            onClick={() => updateQuery({ gameId: undefined, page: 1 })}
          >
            حذف فیلتر
          </button>
        </div>
      ) : null}

      <FpsSampleFilters
        query={query}
        onChange={updateQuery}
        sortOptions={sortOptions}
      />

      <div className="rounded-2xl border bg-card">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyTitle>{error}</EmptyTitle>
              <EmptyDescription>
                اتصال API سرور و دیتابیس را بررسی کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !data?.items.length ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Activity />
              </EmptyMedia>
              <EmptyTitle>نمونه FPS پیدا نشد</EmptyTitle>
              <EmptyDescription>
                فیلترها را عوض کنید یا crawler را دوباره اجرا کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>بازی</TableHead>
                  <TableHead>GPU</TableHead>
                  <TableHead>تنظیمات</TableHead>
                  <TableHead>avg FPS</TableHead>
                  <TableHead>1% low</TableHead>
                  <TableHead>اطمینان</TableHead>
                  <TableHead>منبع</TableHead>
                  <TableHead>تاریخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((sample) => (
                  <TableRow key={sample.id}>
                    <TableCell className="min-w-44 whitespace-normal">
                      <Link
                        to={`/games/${sample.game.id}`}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {sample.game.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {sample.cpu.name}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-40 whitespace-normal">
                      {sample.gpu.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>
                          {resolutionLabels[sample.resolution]} /{" "}
                          {presetLabels[sample.preset]}
                        </div>
                        {sample.upscaler !== "NONE" ||
                        sample.rayTracing ||
                        sample.frameGen ? (
                          <div className="text-xs text-muted-foreground">
                            {[
                              sample.upscaler !== "NONE"
                                ? sample.upscaler
                                : null,
                              sample.rayTracing ? "RT" : null,
                              sample.frameGen ? "FG" : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {formatFps(sample.avgFps)}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {sample.onePercentLow != null
                        ? formatFps(sample.onePercentLow)
                        : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {sample.confidence.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {sample.sourceUrl ? (
                        <a
                          href={sample.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline-offset-2 hover:underline"
                        >
                          {sample.source}
                        </a>
                      ) : (
                        sample.source
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(sample.capturedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4">
              <PaginationBar
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                total={data.meta.total}
                onPageChange={(page) => updateQuery({ page })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
