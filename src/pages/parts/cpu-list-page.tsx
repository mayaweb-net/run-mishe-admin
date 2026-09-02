import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Cpu, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { deleteAdminCpu, fetchAdminCpus } from "@/features/hardware/api";
import { DeleteHardwareDialog } from "@/features/hardware/components/delete-hardware-dialog";
import { HardwareFilters } from "@/features/hardware/components/hardware-filters";
import { HardwareRowActions } from "@/features/hardware/components/hardware-row-actions";
import { PaginationBar } from "@/features/hardware/components/pagination-bar";
import type { CpuListItem, HardwareListQuery } from "@/features/hardware/types";
import {
  formFactorLabels,
  qualityLabels,
  vendorLabels,
} from "@/features/hardware/types";

const cpuSortOptions = [
  { value: "name:asc", label: "نام (الف-ی)" },
  { value: "name:desc", label: "نام (ی-الف)" },
  { value: "gamingIndex:desc", label: "gaming index (بیشترین)" },
  { value: "gamingIndex:asc", label: "gaming index (کمترین)" },
  { value: "releaseDate:desc", label: "تاریخ عرضه (جدیدتر)" },
  { value: "createdAt:desc", label: "تاریخ ثبت (جدیدتر)" },
];

function parseQuery(searchParams: URLSearchParams): HardwareListQuery {
  return {
    page: Number(searchParams.get("page") ?? "1") || 1,
    limit: Number(searchParams.get("limit") ?? "10") || 10,
    q: searchParams.get("q") ?? undefined,
    vendor: (searchParams.get("vendor") as HardwareListQuery["vendor"]) ?? undefined,
    formFactor:
      (searchParams.get("formFactor") as HardwareListQuery["formFactor"]) ??
      undefined,
    quality:
      (searchParams.get("quality") as HardwareListQuery["quality"]) ?? undefined,
    sortBy: searchParams.get("sortBy") ?? "name",
    sortOrder:
      (searchParams.get("sortOrder") as HardwareListQuery["sortOrder"]) ?? "asc",
  };
}

function toSearchParams(query: HardwareListQuery) {
  const params = new URLSearchParams();

  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit && query.limit !== 10) params.set("limit", String(query.limit));
  if (query.q) params.set("q", query.q);
  if (query.vendor) params.set("vendor", query.vendor);
  if (query.formFactor) params.set("formFactor", query.formFactor);
  if (query.quality) params.set("quality", query.quality);
  if (query.sortBy && query.sortBy !== "name") params.set("sortBy", query.sortBy);
  if (query.sortOrder && query.sortOrder !== "asc") {
    params.set("sortOrder", query.sortOrder);
  }

  return params;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR").format(new Date(value));
}

function formatIndex(value: number | null) {
  if (value == null) return "—";
  return value.toFixed(1);
}

export function CpuListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [data, setData] = useState<{ items: CpuListItem[]; meta: { page: number; limit: number; total: number; totalPages: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CpuListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const updateQuery = useCallback(
    (patch: Partial<HardwareListQuery>) => {
      const next = { ...query, ...patch };
      setSearchParams(toSearchParams(next), { replace: true });
    },
    [query, setSearchParams],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAdminCpus(query);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          setError("بارگذاری لیست CPU با خطا مواجه شد.");
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
  }, [query, reloadKey]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteAdminCpu(deleteTarget.id);
      setDeleteTarget(null);
      setReloadKey((value) => value + 1);
    } catch {
      setError("حذف CPU با خطا مواجه شد.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" nativeButton={false} render={<Link to="/parts/cpu/new" />}>
          <Plus />
          افزودن CPU
        </Button>
      </div>

      <HardwareFilters
        query={query}
        onChange={updateQuery}
        sortOptions={cpuSortOptions}
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
                <Cpu />
              </EmptyMedia>
              <EmptyTitle>CPU‌ای پیدا نشد</EmptyTitle>
              <EmptyDescription>
                فیلترها را تغییر دهید یا عبارت جستجو را پاک کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>سازنده</TableHead>
                  <TableHead>خانواده</TableHead>
                  <TableHead>هسته / ترد</TableHead>
                  <TableHead>فرم‌فاکتور</TableHead>
                  <TableHead>Gaming Index</TableHead>
                  <TableHead>کیفیت</TableHead>
                  <TableHead>عرضه</TableHead>
                  <TableHead className="text-end">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((cpu) => (
                  <TableRow key={cpu.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">{cpu.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {cpu.slug}
                      </div>
                    </TableCell>
                    <TableCell>{vendorLabels[cpu.vendor]}</TableCell>
                    <TableCell>
                      {cpu.family ?? "—"}
                      {cpu.generation ? ` (${cpu.generation})` : ""}
                    </TableCell>
                    <TableCell>
                      {cpu.performanceCores}
                      {cpu.efficiencyCores
                        ? `+${cpu.efficiencyCores}`
                        : ""}{" "}
                      / {cpu.threads}
                    </TableCell>
                    <TableCell>{formFactorLabels[cpu.formFactor]}</TableCell>
                    <TableCell>{formatIndex(cpu.gamingIndex)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {qualityLabels[cpu.quality]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(cpu.releaseDate)}</TableCell>
                    <TableCell>
                      <HardwareRowActions
                        detailHref={`/parts/cpu/${cpu.id}`}
                        onDelete={() => setDeleteTarget(cpu)}
                      />
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

      <DeleteHardwareDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={deleteTarget ? `حذف ${deleteTarget.name}؟` : "حذف CPU"}
        description="این CPU برای همیشه حذف می‌شود. aliasها و ارتباطات وابسته هم پاک می‌شوند."
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
