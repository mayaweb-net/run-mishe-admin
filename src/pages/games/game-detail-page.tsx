import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Link2, Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createAdminGame,
  deleteAdminGame,
  fetchAdminGame,
  updateAdminGame,
} from "@/features/games/api";
import { gameFieldSections } from "@/features/games/game-fields";
import { GameRequirementsEditor } from "@/features/games/components/game-requirements-editor";
import { GameRequirementMatchDialog } from "@/features/games/components/game-requirement-match-dialog";
import { DeleteHardwareDialog } from "@/features/hardware/components/delete-hardware-dialog";
import { HardwareDetailFields } from "@/features/hardware/components/hardware-detail-fields";
import {
  createDefaultRequirements,
  requirementsFromDetail,
  toRequirementsPayload,
} from "@/features/games/requirements";
import type {
  CreateGamePayload,
  GameDetail,
  GameRequirementInput,
} from "@/features/games/types";

const CREATE_ID = "new";

const editableKeys = new Set<string>(
  gameFieldSections.flatMap((section) =>
    section.fields.filter((field) => field.type !== "readonly").map((field) => field.key),
  ),
);

function createDefaultDraft(): Record<string, unknown> {
  return {
    name: "",
    slug: "",
    nameFa: "",
    genres: [],
    demandTier: "MEDIUM",
    isPopular: false,
    isPublished: true,
    quality: "IMPORTED",
  };
}

function toDraft(game: GameDetail): Record<string, unknown> {
  return { ...game };
}

function toPayload(
  draft: Record<string, unknown>,
  requirements: GameRequirementInput[],
): CreateGamePayload {
  const payload = {} as CreateGamePayload;
  for (const key of editableKeys) {
    payload[key as keyof CreateGamePayload] = draft[key] as never;
  }
  payload.requirements = toRequirementsPayload(requirements);
  return payload;
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreateMode = id === CREATE_ID;
  const [item, setItem] = useState<GameDetail | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(createDefaultDraft);
  const [requirementsDraft, setRequirementsDraft] = useState<GameRequirementInput[]>(
    createDefaultRequirements,
  );
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(isCreateMode);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);

  useEffect(() => {
    if (!id || isCreateMode) {
      setDraft(createDefaultDraft());
      setRequirementsDraft(createDefaultRequirements());
      setEditing(true);
      setLoading(false);
      setItem(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAdminGame(id!);
        if (!cancelled) {
          setItem(result);
          setDraft(toDraft(result));
          setRequirementsDraft(requirementsFromDetail(result.requirements));
          setEditing(false);
        }
      } catch {
        if (!cancelled) {
          setError("بارگذاری بازی با خطا مواجه شد.");
          setItem(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, isCreateMode]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const payload = toPayload(draft, requirementsDraft);

      if (isCreateMode) {
        const created = await createAdminGame(payload);
        navigate(`/games/${created.id}`, { replace: true });
        return;
      }

      if (!id) return;

      const updated = await updateAdminGame(id, payload);
      setItem(updated);
      setDraft(toDraft(updated));
      setRequirementsDraft(requirementsFromDetail(updated.requirements));
      setEditing(false);
    } catch {
      setError(
        isCreateMode ? "ایجاد بازی با خطا مواجه شد." : "ذخیره تغییرات با خطا مواجه شد.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !item) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteAdminGame(id);
      navigate("/games");
    } catch {
      setError("حذف بازی با خطا مواجه شد.");
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isCreateMode && !item) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{error ?? "بازی پیدا نشد"}</EmptyTitle>
          <EmptyDescription>
            <Link to="/games" className="underline">
              بازگشت به لیست بازی‌ها
            </Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const title = isCreateMode ? "بازی جدید" : item!.name;
  const subtitle = isCreateMode
    ? "اطلاعات بازی را وارد کنید"
    : item!.slug;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/games" />}>
            <ArrowRight />
            بازگشت
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => {
                  if (isCreateMode) {
                    navigate("/games");
                    return;
                  }
                  if (item) {
                    setDraft(toDraft(item));
                    setRequirementsDraft(requirementsFromDetail(item.requirements));
                  }
                  setEditing(false);
                }}
              >
                <X />
                انصراف
              </Button>
              <Button size="sm" disabled={saving} onClick={() => void handleSave()}>
                <Save />
                {saving ? "در حال ذخیره..." : isCreateMode ? "ایجاد" : "ذخیره"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setMatchOpen(true)}>
                <Link2 />
                پیشنهاد اتصال
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil />
                ویرایش
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                حذف
              </Button>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!isCreateMode && item?.coverUrl ? (
        <img
          src={item.coverUrl}
          alt={item.name}
          className="h-40 w-72 rounded-xl border object-cover"
        />
      ) : null}

      <div className="space-y-6 rounded-2xl border bg-card p-4">
        {gameFieldSections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-sm font-semibold">{section.title}</h2>
            <HardwareDetailFields
              fields={section.fields}
              values={draft}
              editing={editing}
              onChange={(key, value) =>
                setDraft((current) => ({ ...current, [key]: value }))
              }
            />
          </section>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">سیستم موردنیاز</h2>
        <GameRequirementsEditor
          requirements={requirementsDraft}
          editing={editing}
          onChange={(tier, patch) =>
            setRequirementsDraft((current) =>
              current.map((requirement) =>
                requirement.tier === tier
                  ? { ...requirement, ...patch }
                  : requirement,
              ),
            )
          }
        />
      </div>

      {!isCreateMode && item ? (
        <>
          <GameRequirementMatchDialog
            gameId={item.id}
            gameName={item.name}
            open={matchOpen}
            onOpenChange={setMatchOpen}
            onApplied={async () => {
              const refreshed = await fetchAdminGame(item.id);
              setItem(refreshed);
              setDraft(toDraft(refreshed));
              setRequirementsDraft(requirementsFromDetail(refreshed.requirements));
            }}
          />
          <DeleteHardwareDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={`حذف ${item.name}؟`}
            description="این بازی و requirementهایش برای همیشه حذف می‌شوند."
            loading={deleting}
            onConfirm={() => void handleDelete()}
          />
        </>
      ) : null}
    </div>
  );
}
