import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { GamePicker } from "@/features/fps/components/game-picker";
import { HardwarePicker } from "@/features/games/components/hardware-picker";
import {
  addAdminCuratedCpu,
  addAdminCuratedGame,
  addAdminCuratedGpu,
  fetchAdminCuratedCpus,
  fetchAdminCuratedGames,
  fetchAdminCuratedGpus,
  removeAdminCuratedCpu,
  removeAdminCuratedGame,
  removeAdminCuratedGpu,
  reorderAdminCuratedCpus,
  reorderAdminCuratedGames,
  reorderAdminCuratedGpus,
} from "@/features/curated/api";
import type { CuratedKind } from "@/features/curated/types";
import { ApiError } from "@/lib/api-client";

interface ListRow {
  entityId: string;
  name: string;
  secondary?: string | null;
}

interface PickerOption {
  id: string;
  name: string;
}

interface CuratedListEditorProps {
  kind: CuratedKind;
  emptyTitle: string;
  emptyDescription: string;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 409) {
    return "این مورد قبلاً در لیست هست.";
  }
  return fallback;
}

async function fetchRows(kind: CuratedKind): Promise<ListRow[]> {
  if (kind === "game") {
    const result = await fetchAdminCuratedGames();
    return result.items.map((item) => ({
      entityId: item.gameId,
      name: item.game.name,
      secondary: item.game.nameFa,
    }));
  }

  if (kind === "cpu") {
    const result = await fetchAdminCuratedCpus();
    return result.items.map((item) => ({
      entityId: item.cpuId,
      name: item.cpu.name,
      secondary: item.cpu.vendor,
    }));
  }

  const result = await fetchAdminCuratedGpus();
  return result.items.map((item) => ({
    entityId: item.gpuId,
    name: item.gpu.name,
    secondary: item.gpu.vendor,
  }));
}

export function CuratedListEditor({
  kind,
  emptyTitle,
  emptyDescription,
}: CuratedListEditorProps) {
  const [rows, setRows] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerOption | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const nextRows = await fetchRows(kind);
        if (!cancelled) setRows(nextRows);
      } catch {
        if (!cancelled) {
          setError("بارگذاری لیست با خطا مواجه شد.");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [kind, reloadKey]);

  async function refreshRows() {
    const nextRows = await fetchRows(kind);
    setRows(nextRows);
  }

  async function handleAdd() {
    if (!picker || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === "game") {
        await addAdminCuratedGame(picker.id);
      } else if (kind === "cpu") {
        await addAdminCuratedCpu(picker.id);
      } else {
        await addAdminCuratedGpu(picker.id);
      }
      setPicker(null);
      await refreshRows();
    } catch (err) {
      setError(errorMessage(err, "افزودن به لیست با خطا مواجه شد."));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(entityId: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === "game") {
        await removeAdminCuratedGame(entityId);
      } else if (kind === "cpu") {
        await removeAdminCuratedCpu(entityId);
      } else {
        await removeAdminCuratedGpu(entityId);
      }
      await refreshRows();
    } catch {
      setError("حذف از لیست با خطا مواجه شد.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= rows.length || busy) return;

    const nextRows = [...rows];
    const [moved] = nextRows.splice(index, 1);
    nextRows.splice(nextIndex, 0, moved);
    const orderedIds = nextRows.map((row) => row.entityId);

    setBusy(true);
    setError(null);
    setRows(nextRows);
    try {
      setRows(await applyReorder(kind, orderedIds));
    } catch {
      setError("تغییر ترتیب با خطا مواجه شد.");
      setReloadKey((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          {kind === "game" ? (
            <GamePicker value={picker} onChange={setPicker} disabled={busy} />
          ) : (
            <HardwarePicker
              kind={kind}
              label={kind === "cpu" ? "CPU" : "GPU"}
              value={picker}
              onChange={setPicker}
              disabled={busy}
            />
          )}
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!picker || busy}
          onClick={() => void handleAdd()}
        >
          <Plus />
          افزودن به لیست
        </Button>
      </div>

      <div className="rounded-2xl border bg-card">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error && rows.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyTitle>{error}</EmptyTitle>
              <EmptyDescription>
                اتصال API سرور و دیتابیس را بررسی کنید.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : rows.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y">
            {rows.map((row, index) => (
              <li
                key={row.entityId}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="w-8 shrink-0 text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.name}</p>
                  {row.secondary ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {row.secondary}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy || index === 0}
                    onClick={() => void handleMove(index, -1)}
                    aria-label="جابه‌جایی به بالا"
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy || index === rows.length - 1}
                    onClick={() => void handleMove(index, 1)}
                    aria-label="جابه‌جایی به پایین"
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy}
                    onClick={() => void handleRemove(row.entityId)}
                    aria-label="حذف از لیست"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && rows.length > 0 ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

async function applyReorder(kind: CuratedKind, orderedIds: string[]) {
  if (kind === "game") {
    const result = await reorderAdminCuratedGames(orderedIds);
    return result.items.map((item) => ({
      entityId: item.gameId,
      name: item.game.name,
      secondary: item.game.nameFa,
    }));
  }

  if (kind === "cpu") {
    const result = await reorderAdminCuratedCpus(orderedIds);
    return result.items.map((item) => ({
      entityId: item.cpuId,
      name: item.cpu.name,
      secondary: item.cpu.vendor,
    }));
  }

  const result = await reorderAdminCuratedGpus(orderedIds);
  return result.items.map((item) => ({
    entityId: item.gpuId,
    name: item.gpu.name,
    secondary: item.gpu.vendor,
  }));
}
