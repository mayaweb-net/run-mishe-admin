import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Ratio } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminDefaultScaling } from "@/features/benchmarks/api";
import type {
  DefaultScalingListItem,
  DefaultScalingListQuery,
  PaginatedResult,
  QualityPreset,
  ScreenResolution,
} from "@/features/benchmarks/types";
import {
  presetLabels,
  resolutionLabels,
} from "@/features/benchmarks/types";
import { PaginationBar } from "@/features/hardware/components/pagination-bar";

const resolutions = Object.keys(resolutionLabels) as ScreenResolution[];
const presets = Object.keys(presetLabels) as QualityPreset[];

const sortOptions = [
  { value: "resolution:asc", label: "رزولوشن" },
  { value: "preset:asc", label: "پریست" },
  { value: "multiplier:desc", label: "ضریب (بیشترین)" },
  { value: "multiplier:asc", label: "ضریب (کمترین)" },
];

function parseQuery(searchParams: URLSearchParams): DefaultScalingListQuery {
  return {
    page: Number(searchParams.get("page") ?? "1") || 1,
    limit: Number(searchParams.get("limit") ?? "50") || 50,
    resolution:
      (searchParams.get("resolution") as ScreenResolution | null) ?? undefined,
    preset: (searchParams.get("preset") as QualityPreset | null) ?? undefined,
    sortBy: searchParams.get("sortBy") ?? "resolution",
    sortOrder:
      (searchParams.get("sortOrder") as DefaultScalingListQuery["sortOrder"]) ??
      "asc",
  };
}

function toSearchParams(query: DefaultScalingListQuery) {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit && query.limit !== 50) params.set("limit", String(query.limit));
  if (query.resolution) params.set("resolution", query.resolution);
  if (query.preset) params.set("preset", query.preset);
  if (query.sortBy && query.sortBy !== "resolution") {
    params.set("sortBy", query.sortBy);
  }
  if (query.sortOrder && query.sortOrder !== "asc") {
    params.set("sortOrder", query.sortOrder);
  }
  return params;
}

export function DefaultScalingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [data, setData] =
    useState<PaginatedResult<DefaultScalingListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateQuery = useCallback(
    (patch: Partial<DefaultScalingListQuery>) => {
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
        const result = await fetchAdminDefaultScaling(query);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          setError("بارگذاری DefaultScaling با خطا مواجه شد.");
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
      <p className="text-sm text-muted-foreground">
        ضرایب سراسری نسبت به ۱۰۸۰p / HIGH. فقط خواندنی — از seed پر می‌شود.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <Select
          value={query.resolution ?? "all"}
          onValueChange={(value) =>
            updateQuery({
              resolution:
                !value || value === "all"
                  ? undefined
                  : (value as ScreenResolution),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="رزولوشن" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه رزولوشن‌ها</SelectItem>
            {resolutions.map((resolution) => (
              <SelectItem key={resolution} value={resolution}>
                {resolutionLabels[resolution]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.preset ?? "all"}
          onValueChange={(value) =>
            updateQuery({
              preset:
                !value || value === "all"
                  ? undefined
                  : (value as QualityPreset),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="پریست" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه پریست‌ها</SelectItem>
            {presets.map((preset) => (
              <SelectItem key={preset} value={preset}>
                {presetLabels[preset]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${query.sortBy ?? "resolution"}:${query.sortOrder ?? "asc"}`}
          onValueChange={(value) => {
            if (!value) return;
            const [sortBy, sortOrder] = value.split(":") as [
              string,
              "asc" | "desc",
            ];
            updateQuery({ sortBy, sortOrder, page: 1 });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="مرتب‌سازی" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
                اتصال API سرور و اجرای seed را بررسی کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !data?.items.length ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Ratio />
              </EmptyMedia>
              <EmptyTitle>ردیفی پیدا نشد</EmptyTitle>
              <EmptyDescription>
                `pnpm exec prisma db seed` را اجرا کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رزولوشن</TableHead>
                  <TableHead>پریست</TableHead>
                  <TableHead>ضریب</TableHead>
                  <TableHead>Upscaler</TableHead>
                  <TableHead>RT</TableHead>
                  <TableHead>یادداشت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {resolutionLabels[item.resolution] ?? item.resolution}
                    </TableCell>
                    <TableCell>
                      {presetLabels[item.preset] ?? item.preset}
                    </TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {item.multiplier.toFixed(3)}
                    </TableCell>
                    <TableCell>{item.upscaler}</TableCell>
                    <TableCell>{item.rayTracing ? "بله" : "خیر"}</TableCell>
                    <TableCell className="max-w-sm truncate text-muted-foreground">
                      {item.note ?? "—"}
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
