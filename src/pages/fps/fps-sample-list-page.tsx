import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Activity, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calibrateAdminFpsSamples,
  deleteAdminFpsSample,
  fetchAdminFpsSamples,
} from "@/features/fps/api";
import { FpsSampleFilters } from "@/features/fps/components/fps-sample-filters";
import { FpsSampleFormDialog } from "@/features/fps/components/fps-sample-form-dialog";
import type {
  FpsSampleListItem,
  FpsSampleListQuery,
  PaginatedResult,
  QualityPreset,
  ScreenResolution,
} from "@/features/fps/types";
import { presetLabels, resolutionLabels } from "@/features/fps/types";
import { DeleteHardwareDialog } from "@/features/hardware/components/delete-hardware-dialog";
import { PaginationBar } from "@/features/hardware/components/pagination-bar";

const CALIBRATE_TOOLTIP =
  "از روی نمونه‌های FpsSample برای هر بازی منحنی تخمین (GameProfile) و ضرایب تنظیمات (GameScaling) را می‌سازد. بعد از افزودن/ویرایش دستی یا import، این دکمه را بزن تا تخمین FPS از داده‌های واقعی استفاده کند؛ بازی‌های بدون نمونه کافی روی مسیر بنچمارک می‌مانند.";

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
  const [reloadToken, setReloadToken] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<FpsSampleListItem | null>(null);
  const [deleting, setDeleting] = useState<FpsSampleListItem | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrateMessage, setCalibrateMessage] = useState<string | null>(null);

  const updateQuery = useCallback(
    (patch: Partial<FpsSampleListQuery>) => {
      setSearchParams(toSearchParams({ ...query, ...patch }), { replace: true });
    },
    [query, setSearchParams],
  );

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

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
  }, [query, reloadToken]);

  async function handleDelete() {
    if (!deleting) return;
    await deleteAdminFpsSample(deleting.id);
    setDeleting(null);
    reload();
  }

  async function handleCalibrate() {
    setCalibrating(true);
    setCalibrateMessage(null);
    try {
      const result = await calibrateAdminFpsSamples(
        query.gameId ? { gameId: query.gameId } : undefined,
      );
      setCalibrateMessage(
        `کالیبراسیون انجام شد: ${result.calibrated.toLocaleString("fa-IR")} بازی کالیبره · ${result.skipped.toLocaleString("fa-IR")} ردشده/بدون نمونه · ${result.rejected.toLocaleString("fa-IR")} رد کیفیت`,
      );
      reload();
    } catch {
      setCalibrateMessage("کالیبراسیون با خطا مواجه شد.");
    } finally {
      setCalibrating(false);
    }
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                variant="outline"
                disabled={calibrating}
                onClick={() => void handleCalibrate()}
              />
            }
          >
            <RefreshCw className={calibrating ? "animate-spin" : undefined} />
            {calibrating ? "در حال کالیبره..." : "اعمال روی تخمین"}
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-sm text-start leading-relaxed"
          >
            {CALIBRATE_TOOLTIP}
            {query.gameId
              ? " فقط بازی فیلترشده در URL کالیبره می‌شود."
              : " همه بازی‌های دارای نمونه پردازش می‌شوند."}
          </TooltipContent>
        </Tooltip>

        <Button
          size="sm"
          onClick={() => {
            setFormMode("create");
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          افزودن نمونه
        </Button>
      </div>

      {calibrateMessage ? (
        <p className="text-sm text-muted-foreground">{calibrateMessage}</p>
      ) : null}

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
                فیلترها را عوض کنید یا نمونه دستی اضافه کنید.
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
                  <TableHead className="text-end">عملیات</TableHead>
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
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="ویرایش"
                          onClick={() => {
                            setFormMode("edit");
                            setEditing(sample);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="حذف"
                          onClick={() => setDeleting(sample)}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
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

      <FpsSampleFormDialog
        open={formOpen}
        mode={formMode}
        sample={editing}
        initialGameId={query.gameId}
        onOpenChange={setFormOpen}
        onSaved={reload}
      />

      <DeleteHardwareDialog
        open={deleting != null}
        title="حذف نمونه FPS"
        description={
          deleting
            ? `نمونه «${deleting.game.name} / ${deleting.gpu.name} / ${resolutionLabels[deleting.resolution]} ${presetLabels[deleting.preset]}» حذف شود؟`
            : "این نمونه حذف شود؟"
        }
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
    </TooltipProvider>
  );
}
