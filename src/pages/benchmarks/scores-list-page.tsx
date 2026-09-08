import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3 } from "lucide-react";
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
import {
  fetchAdminCpuBenchmarkScores,
  fetchAdminGpuBenchmarkScores,
} from "@/features/benchmarks/api";
import { BenchmarkScoreFilters } from "@/features/benchmarks/components/benchmark-score-filters";
import type {
  BenchmarkScoreListItem,
  BenchmarkScoreListQuery,
  PaginatedResult,
} from "@/features/benchmarks/types";
import { PaginationBar } from "@/features/hardware/components/pagination-bar";

const sortOptions = [
  { value: "score:desc", label: "امتیاز (بیشترین)" },
  { value: "score:asc", label: "امتیاز (کمترین)" },
  { value: "capturedAt:desc", label: "تاریخ ثبت (جدیدتر)" },
  { value: "hardwareName:asc", label: "نام قطعه (الف-ی)" },
  { value: "benchmarkName:asc", label: "نام بنچمارک" },
  { value: "source:asc", label: "منبع" },
];

const cpuBenchmarkOptions = [
  { value: "passmark-cpu-mark", label: "PassMark CPU Mark" },
  { value: "passmark-single-thread", label: "PassMark Single Thread" },
];

const gpuBenchmarkOptions = [
  { value: "gpuark-gpi", label: "GPU Ark GPI" },
  { value: "passmark-g3d-mark", label: "PassMark G3D" },
  { value: "3dmark-time-spy", label: "3DMark Time Spy" },
];

const cpuSourceOptions = [{ value: "passmark", label: "passmark" }];
const gpuSourceOptions = [
  { value: "gpuark", label: "gpuark" },
  { value: "passmark", label: "passmark" },
];

function parseQuery(searchParams: URLSearchParams): BenchmarkScoreListQuery {
  return {
    page: Number(searchParams.get("page") ?? "1") || 1,
    limit: Number(searchParams.get("limit") ?? "10") || 10,
    q: searchParams.get("q") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    benchmarkSlug: searchParams.get("benchmarkSlug") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? "score",
    sortOrder:
      (searchParams.get("sortOrder") as BenchmarkScoreListQuery["sortOrder"]) ??
      "desc",
  };
}

function toSearchParams(query: BenchmarkScoreListQuery) {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit && query.limit !== 10) params.set("limit", String(query.limit));
  if (query.q) params.set("q", query.q);
  if (query.source) params.set("source", query.source);
  if (query.benchmarkSlug) params.set("benchmarkSlug", query.benchmarkSlug);
  if (query.sortBy && query.sortBy !== "score") params.set("sortBy", query.sortBy);
  if (query.sortOrder && query.sortOrder !== "desc") {
    params.set("sortOrder", query.sortOrder);
  }
  return params;
}

function formatScore(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface ScoreListPageProps {
  kind: "cpu" | "gpu";
}

export function BenchmarkScoreListPage({ kind }: ScoreListPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [data, setData] =
    useState<PaginatedResult<BenchmarkScoreListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateQuery = useCallback(
    (patch: Partial<BenchmarkScoreListQuery>) => {
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
        const result =
          kind === "cpu"
            ? await fetchAdminCpuBenchmarkScores(query)
            : await fetchAdminGpuBenchmarkScores(query);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          setError(
            kind === "cpu"
              ? "بارگذاری اسکور CPU با خطا مواجه شد."
              : "بارگذاری اسکور GPU با خطا مواجه شد.",
          );
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
  }, [query, kind]);

  const titleEmpty = kind === "cpu" ? "اسکور CPU پیدا نشد" : "اسکور GPU پیدا نشد";

  return (
    <div className="flex flex-col gap-4">
      <BenchmarkScoreFilters
        query={query}
        onChange={updateQuery}
        sortOptions={sortOptions}
        sourceOptions={kind === "cpu" ? cpuSourceOptions : gpuSourceOptions}
        benchmarkOptions={
          kind === "cpu" ? cpuBenchmarkOptions : gpuBenchmarkOptions
        }
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
                <BarChart3 />
              </EmptyMedia>
              <EmptyTitle>{titleEmpty}</EmptyTitle>
              <EmptyDescription>
                فیلترها را تغییر دهید یا import بنچمارک را اجرا کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>قطعه</TableHead>
                  <TableHead>بنچمارک</TableHead>
                  <TableHead>امتیاز</TableHead>
                  <TableHead>منبع</TableHead>
                  <TableHead>نمونه</TableHead>
                  <TableHead>تاریخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">{item.hardware.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {item.hardware.slug}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">{item.benchmark.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {item.benchmark.slug}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatScore(item.score)}
                    </TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>
                      {item.sampleCount?.toLocaleString("fa-IR") ?? "—"}
                    </TableCell>
                    <TableCell>{formatDate(item.capturedAt)}</TableCell>
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

export function CpuBenchmarkScoresPage() {
  return <BenchmarkScoreListPage kind="cpu" />;
}

export function GpuBenchmarkScoresPage() {
  return <BenchmarkScoreListPage kind="gpu" />;
}
