import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Gamepad2, Download, Link2, Plus } from "lucide-react";
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
import { deleteAdminGame, downloadUnmatchedRequirementsReport, fetchAdminGames } from "@/features/games/api";
import { GameFilters } from "@/features/games/components/game-filters";
import { GameRequirementMatchDialog } from "@/features/games/components/game-requirement-match-dialog";
import { RequirementCell } from "@/features/games/components/requirement-cell";
import { GameCoverThumb } from "@/features/games/components/game-cover-thumb";
import { DeleteHardwareDialog } from "@/features/hardware/components/delete-hardware-dialog";
import { HardwareRowActions } from "@/features/hardware/components/hardware-row-actions";
import { PaginationBar } from "@/features/hardware/components/pagination-bar";
import type { GameListItem, GameListQuery } from "@/features/games/types";
import { demandTierLabels, qualityLabels } from "@/features/games/types";

const gameSortOptions = [
  { value: "name:asc", label: "نام (الف-ی)" },
  { value: "name:desc", label: "نام (ی-الف)" },
  { value: "popularity:desc", label: "محبوبیت (بیشترین)" },
  { value: "releaseDate:desc", label: "تاریخ انتشار (جدیدتر)" },
  { value: "createdAt:desc", label: "تاریخ ثبت (جدیدتر)" },
];

function parseQuery(searchParams: URLSearchParams): GameListQuery {
  return {
    page: Number(searchParams.get("page") ?? "1") || 1,
    limit: Number(searchParams.get("limit") ?? "10") || 10,
    q: searchParams.get("q") ?? undefined,
    demandTier: (searchParams.get("demandTier") as GameListQuery["demandTier"]) ?? undefined,
    isPopular:
      searchParams.get("isPopular") === "true"
        ? true
        : searchParams.get("isPopular") === "false"
          ? false
          : undefined,
    isPublished:
      searchParams.get("isPublished") === "true"
        ? true
        : searchParams.get("isPublished") === "false"
          ? false
          : undefined,
    quality: (searchParams.get("quality") as GameListQuery["quality"]) ?? undefined,
    reviewStatus:
      (searchParams.get("reviewStatus") as GameListQuery["reviewStatus"]) ??
      undefined,
    sortBy: searchParams.get("sortBy") ?? "name",
    sortOrder:
      (searchParams.get("sortOrder") as GameListQuery["sortOrder"]) ?? "asc",
  };
}

function toSearchParams(query: GameListQuery) {
  const params = new URLSearchParams();

  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.limit && query.limit !== 10) params.set("limit", String(query.limit));
  if (query.q) params.set("q", query.q);
  if (query.demandTier) params.set("demandTier", query.demandTier);
  if (query.isPopular !== undefined) {
    params.set("isPopular", String(query.isPopular));
  }
  if (query.isPublished !== undefined) {
    params.set("isPublished", String(query.isPublished));
  }
  if (query.quality) params.set("quality", query.quality);
  if (query.reviewStatus) params.set("reviewStatus", query.reviewStatus);
  if (query.sortBy && query.sortBy !== "name") params.set("sortBy", query.sortBy);
  if (query.sortOrder && query.sortOrder !== "asc") {
    params.set("sortOrder", query.sortOrder);
  }

  return params;
}

export function GameListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [data, setData] = useState<{
    items: GameListItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GameListItem | null>(null);
  const [matchTarget, setMatchTarget] = useState<GameListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const updateQuery = useCallback(
    (patch: Partial<GameListQuery>) => {
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
        const result = await fetchAdminGames(query);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          setError("بارگذاری لیست بازی‌ها با خطا مواجه شد.");
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
      await deleteAdminGame(deleteTarget.id);
      setDeleteTarget(null);
      setReloadKey((value) => value + 1);
    } catch {
      setError("حذف بازی با خطا مواجه شد.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownloadReport() {
    setDownloadingReport(true);
    setError(null);

    try {
      await downloadUnmatchedRequirementsReport();
    } catch {
      setError("دانلود گزارش ناقص‌ها با خطا مواجه شد.");
    } finally {
      setDownloadingReport(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={downloadingReport}
          onClick={() => void handleDownloadReport()}
        >
          <Download />
          {downloadingReport ? "در حال دانلود..." : "گزارش قطعات ناقص"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            updateQuery({ reviewStatus: "UNMATCHED_ANY", page: 1 })
          }
        >
          <Link2 />
          بررسی اتصال‌ها
        </Button>
        <Button size="sm" nativeButton={false} render={<Link to="/games/new" />}>
          <Plus />
          افزودن بازی
        </Button>
      </div>

      <GameFilters
        query={query}
        onChange={updateQuery}
        sortOptions={gameSortOptions}
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
                <Gamepad2 />
              </EmptyMedia>
              <EmptyTitle>بازی‌ای پیدا نشد</EmptyTitle>
              <EmptyDescription>
                فیلترها را تغییر دهید یا بازی جدید اضافه کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-72">بازی</TableHead>
                  <TableHead>حداقل سیستم</TableHead>
                  <TableHead>پیشنهادی</TableHead>
                  <TableHead>Demand</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="text-end">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="min-w-72 whitespace-normal py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-40 shrink-0 sm:w-44">
                          <GameCoverThumb coverUrl={game.coverUrl} name={game.name} />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="font-medium leading-snug">{game.name}</div>
                          {game.nameFa ? (
                            <div className="text-xs text-muted-foreground">{game.nameFa}</div>
                          ) : null}
                          <div className="truncate text-xs text-muted-foreground">
                            {game.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-44">
                      <RequirementCell summary={game.minimum} />
                    </TableCell>
                    <TableCell className="min-w-44">
                      <RequirementCell summary={game.recommended} />
                    </TableCell>
                    <TableCell>{demandTierLabels[game.demandTier]}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {game.isPopular ? (
                          <Badge variant="secondary">محبوب</Badge>
                        ) : null}
                        <Badge variant={game.isPublished ? "default" : "outline"}>
                          {game.isPublished ? "منتشر شده" : "پیش‌نویس"}
                        </Badge>
                        <Badge variant="secondary">{qualityLabels[game.quality]}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <HardwareRowActions
                        detailHref={`/games/${game.id}`}
                        onSuggestMatch={() => setMatchTarget(game)}
                        onDelete={() => setDeleteTarget(game)}
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
        title={deleteTarget ? `حذف ${deleteTarget.name}؟` : "حذف بازی"}
        description="این بازی و requirementهایش برای همیشه حذف می‌شوند."
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />

      <GameRequirementMatchDialog
        gameId={matchTarget?.id ?? null}
        gameName={matchTarget?.name ?? ""}
        open={matchTarget != null}
        onOpenChange={(open) => {
          if (!open) setMatchTarget(null);
        }}
        onApplied={() => setReloadKey((value) => value + 1)}
      />
    </div>
  );
}
