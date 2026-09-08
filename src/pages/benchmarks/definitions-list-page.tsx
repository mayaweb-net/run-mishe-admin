import { useCallback, useEffect, useMemo, useState } from "react";
import { Gauge } from "lucide-react";
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
import { fetchAdminBenchmarks } from "@/features/benchmarks/api";
import { BenchmarkDefinitionFilters } from "@/features/benchmarks/components/benchmark-definition-filters";
import type {
  BenchmarkListItem,
  BenchmarkListQuery,
  PaginatedResult,
} from "@/features/benchmarks/types";
import { hardwareKindLabels } from "@/features/benchmarks/types";
import { PaginationBar } from "@/features/hardware/components/pagination-bar";
import { useSearchParams } from "react-router-dom";

const sortOptions = [
  { value: "name:asc", label: "نام (الف-ی)" },
  { value: "name:desc", label: "نام (ی-الف)" },
  { value: "weightInIndex:desc", label: "وزن (بیشترین)" },
  { value: "weightInIndex:asc", label: "وزن (کمترین)" },
  { value: "vendor:asc", label: "vendor" },
  { value: "createdAt:desc", label: "تاریخ ثبت (جدیدتر)" },
];

function parseQuery(searchParams: URLSearchParams): BenchmarkListQuery {
  return {
    page: Number(searchParams.get("page") ?? "1") || 1,
    limit: Number(searchParams.get("limit") ?? "10") || 10,
    q: searchParams.get("q") ?? undefined,
    target:
      (searchParams.get("target") as BenchmarkListQuery["target"]) ?? undefined,
    isActive:
      (searchParams.get("isActive") as BenchmarkListQuery["isActive"]) ??
      undefined,
    sortBy: searchParams.get("sortBy") ?? "name",
    sortOrder:
      (searchParams.get("sortOrder") as BenchmarkListQuery["sortOrder"]) ??
      "asc",
  };
}

function toSearchParams(query: BenchmarkListQuery) {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit && query.limit !== 10) params.set("limit", String(query.limit));
  if (query.q) params.set("q", query.q);
  if (query.target) params.set("target", query.target);
  if (query.isActive) params.set("isActive", query.isActive);
  if (query.sortBy && query.sortBy !== "name") params.set("sortBy", query.sortBy);
  if (query.sortOrder && query.sortOrder !== "asc") {
    params.set("sortOrder", query.sortOrder);
  }
  return params;
}

export function BenchmarkDefinitionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [data, setData] = useState<PaginatedResult<BenchmarkListItem> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateQuery = useCallback(
    (patch: Partial<BenchmarkListQuery>) => {
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
        const result = await fetchAdminBenchmarks(query);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          setError("بارگذاری تعاریف بنچمارک با خطا مواجه شد.");
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
      <BenchmarkDefinitionFilters
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
                <Gauge />
              </EmptyMedia>
              <EmptyTitle>تعریفی پیدا نشد</EmptyTitle>
              <EmptyDescription>
                فیلترها را تغییر دهید یا seed بنچمارک را اجرا کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>هدف</TableHead>
                  <TableHead>vendor</TableHead>
                  <TableHead>دسته</TableHead>
                  <TableHead>وزن index</TableHead>
                  <TableHead>واحد</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">{item.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {item.slug}
                      </div>
                    </TableCell>
                    <TableCell>{hardwareKindLabels[item.target]}</TableCell>
                    <TableCell>{item.vendor}</TableCell>
                    <TableCell>{item.category ?? "—"}</TableCell>
                    <TableCell>{item.weightInIndex}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "secondary" : "outline"}>
                        {item.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
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
