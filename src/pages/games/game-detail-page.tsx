import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Link2, Pencil, Save, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { getFileUrl } from "@/features/blog/api";
import {
  createAdminGame,
  deleteAdminGame,
  fetchAdminGame,
  updateAdminGame,
  uploadGameFile,
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

const editableKeys = new Set<string>([
  ...gameFieldSections.flatMap((section) =>
    section.fields
      .filter((field) => field.type !== "readonly")
      .map((field) => field.key),
  ),
  "content",
  "galleryPaths",
  "coverUrl",
]);

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
    description: "",
    content: "",
    coverUrl: "",
    galleryPaths: [] as string[],
  };
}

function toDraft(game: GameDetail): Record<string, unknown> {
  return {
    ...game,
    content: game.content ?? "",
    description: game.description ?? "",
    coverUrl: game.coverUrl ?? "",
    galleryPaths: game.galleryPaths ?? [],
  };
}

function toPayload(
  draft: Record<string, unknown>,
  requirements: GameRequirementInput[],
  createId?: string,
): CreateGamePayload {
  const payload = {} as CreateGamePayload;
  for (const key of editableKeys) {
    payload[key as keyof CreateGamePayload] = draft[key] as never;
  }
  payload.requirements = toRequirementsPayload(requirements);
  if (createId) {
    payload.id = createId;
  }
  return payload;
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreateMode = id === CREATE_ID;
  const draftIdRef = useRef(crypto.randomUUID());
  const gameUploadId = isCreateMode ? draftIdRef.current : (id ?? draftIdRef.current);

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
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

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
      const payload = toPayload(
        draft,
        requirementsDraft,
        isCreateMode ? draftIdRef.current : undefined,
      );

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

  async function handleCoverUpload(file: File | null) {
    if (!file || !editing) return;
    setCoverUploading(true);
    setError(null);
    try {
      const uploaded = await uploadGameFile(file, gameUploadId, "cover");
      setDraft((current) => ({ ...current, coverUrl: uploaded.path }));
    } catch {
      setError("آپلود کاور با خطا مواجه شد.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!files?.length || !editing) return;
    setGalleryUploading(true);
    setError(null);
    try {
      const uploadedPaths: string[] = [];
      for (const file of Array.from(files)) {
        const uploaded = await uploadGameFile(file, gameUploadId, "gallery");
        uploadedPaths.push(uploaded.path);
      }
      setDraft((current) => ({
        ...current,
        galleryPaths: [
          ...((current.galleryPaths as string[]) ?? []),
          ...uploadedPaths,
        ],
      }));
    } catch {
      setError("آپلود گالری با خطا مواجه شد.");
    } finally {
      setGalleryUploading(false);
    }
  }

  function removeGalleryPath(path: string) {
    setDraft((current) => ({
      ...current,
      galleryPaths: ((current.galleryPaths as string[]) ?? []).filter(
        (item) => item !== path,
      ),
    }));
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
  const subtitle = isCreateMode ? "اطلاعات بازی را وارد کنید" : item!.slug;
  const coverUrl = getFileUrl(String(draft.coverUrl || "")) ?? undefined;
  const galleryPaths = (draft.galleryPaths as string[]) ?? [];

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

      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
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

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">کاور و گالری</h2>
          <div className="space-y-2">
            <Label htmlFor="game-cover">کاور</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="game-cover"
                type="file"
                accept="image/*"
                disabled={!editing || coverUploading}
                onChange={(event) =>
                  void handleCoverUpload(event.target.files?.[0] ?? null)
                }
              />
              {coverUploading ? <Spinner className="size-4" /> : null}
            </div>
            {draft.coverUrl ? (
              <p className="text-xs text-muted-foreground" dir="ltr">
                {String(draft.coverUrl)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="game-gallery">گالری تصاویر</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="game-gallery"
                type="file"
                accept="image/*"
                multiple
                disabled={!editing || galleryUploading}
                onChange={(event) => void handleGalleryUpload(event.target.files)}
              />
              {galleryUploading ? (
                <Spinner className="size-4" />
              ) : (
                <Upload className="size-4 text-muted-foreground" />
              )}
            </div>
            {galleryPaths.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-3">
                {galleryPaths.map((path) => {
                  const url = getFileUrl(path);
                  return (
                    <li key={path} className="space-y-2 rounded-xl border p-2">
                      {url ? (
                        <img
                          src={url}
                          alt=""
                          className="aspect-video w-full rounded-lg object-cover"
                        />
                      ) : null}
                      {editing ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGalleryPath(path)}
                        >
                          حذف
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                هنوز تصویری در گالری نیست.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b px-4 py-3 text-sm font-semibold">
          توضیحات کامل
        </div>
        <div className="p-3">
          {editing ? (
            <div className="overflow-hidden rounded-xl bg-white">
              <SimpleEditor
                value={String(draft.content ?? "")}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, content: value }))
                }
                uploadTarget={{
                  folder: "games",
                  ownerId: gameUploadId,
                  scope: "content",
                }}
              />
            </div>
          ) : (
            <div
              className="article-html-content rounded-xl bg-white p-4"
              dangerouslySetInnerHTML={{
                __html: String(
                  draft.content ||
                    "<p class='text-muted-foreground'>محتوایی ثبت نشده</p>",
                ),
              }}
            />
          )}
        </div>
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
