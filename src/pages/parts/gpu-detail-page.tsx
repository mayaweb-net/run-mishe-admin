import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Pencil, Save, Trash2, X } from "lucide-react";
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
  createAdminGpu,
  deleteAdminGpu,
  fetchAdminGpu,
  updateAdminGpu,
  uploadGpuFile,
} from "@/features/hardware/api";
import { gpuFieldSections } from "@/features/hardware/gpu-fields";
import { DeleteHardwareDialog } from "@/features/hardware/components/delete-hardware-dialog";
import { HardwareDetailFields } from "@/features/hardware/components/hardware-detail-fields";
import type { CreateGpuPayload, GpuDetail } from "@/features/hardware/types";

const CREATE_ID = "new";

const editableKeys = new Set<string>([
  ...gpuFieldSections.flatMap((section) =>
    section.fields
      .filter((field) => field.type !== "readonly")
      .map((field) => field.key),
  ),
  "content",
  "coverUrl",
]);

function createDefaultDraft(): Record<string, unknown> {
  return {
    name: "",
    slug: "",
    vendor: "NVIDIA",
    formFactor: "DESKTOP",
    isWorkstation: false,
    supportsRayTracing: false,
    quality: "IMPORTED",
    coverUrl: "",
    description: "",
    content: "",
  };
}

function toDraft(gpu: GpuDetail): Record<string, unknown> {
  return {
    ...gpu,
    coverUrl: gpu.coverUrl ?? "",
    description: gpu.description ?? "",
    content: gpu.content ?? "",
  };
}

function toPayload(
  draft: Record<string, unknown>,
  createId?: string,
): CreateGpuPayload {
  const payload = {} as CreateGpuPayload;
  for (const key of editableKeys) {
    payload[key as keyof CreateGpuPayload] = draft[key] as never;
  }
  if (createId) {
    payload.id = createId;
  }
  return payload;
}

export function GpuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreateMode = id === CREATE_ID;
  const draftIdRef = useRef(crypto.randomUUID());
  const gpuUploadId = isCreateMode
    ? draftIdRef.current
    : (id ?? draftIdRef.current);

  const [item, setItem] = useState<GpuDetail | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(createDefaultDraft);
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(isCreateMode);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    if (!id || isCreateMode) {
      setDraft(createDefaultDraft());
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
        const result = await fetchAdminGpu(id!);
        if (!cancelled) {
          setItem(result);
          setDraft(toDraft(result));
          setEditing(false);
        }
      } catch {
        if (!cancelled) {
          setError("بارگذاری GPU با خطا مواجه شد.");
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
        isCreateMode ? draftIdRef.current : undefined,
      );

      if (isCreateMode) {
        const created = await createAdminGpu(payload);
        navigate(`/parts/gpu/${created.id}`, { replace: true });
        return;
      }

      if (!id) return;

      const updated = await updateAdminGpu(id, payload);
      setItem(updated);
      setDraft(toDraft(updated));
      setEditing(false);
    } catch {
      setError(
        isCreateMode ? "ایجاد GPU با خطا مواجه شد." : "ذخیره تغییرات با خطا مواجه شد.",
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
      await deleteAdminGpu(id);
      navigate("/parts/gpu");
    } catch {
      setError("حذف GPU با خطا مواجه شد.");
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function handleCoverUpload(file: File | null) {
    if (!file || !editing) return;
    setCoverUploading(true);
    setError(null);
    try {
      const uploaded = await uploadGpuFile(file, gpuUploadId, "cover");
      setDraft((current) => ({ ...current, coverUrl: uploaded.path }));
    } catch {
      setError("آپلود کاور با خطا مواجه شد.");
    } finally {
      setCoverUploading(false);
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
          <EmptyTitle>{error ?? "GPU پیدا نشد"}</EmptyTitle>
          <EmptyDescription>
            <Link to="/parts/gpu" className="underline">
              بازگشت به لیست GPU
            </Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const title = isCreateMode ? "GPU جدید" : item!.name;
  const subtitle = isCreateMode
    ? "فیلدهای الزامی را پر کنید و ذخیره بزنید"
    : item!.slug;
  const coverUrl = getFileUrl(String(draft.coverUrl || "")) ?? undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/parts/gpu" />}
          >
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
                    navigate("/parts/gpu");
                    return;
                  }
                  if (item) {
                    setDraft(toDraft(item));
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
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil />
                ویرایش
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
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
        {gpuFieldSections.map((section) => (
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

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">کاور</h2>
          <Label htmlFor="gpu-cover">تصویر کاور</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="gpu-cover"
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
        </section>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b px-4 py-3 text-sm font-semibold">
          توضیحات کامل
        </div>
        <div className="border-b px-4 py-2 text-xs leading-relaxed text-muted-foreground">
          می‌توانید از متغیرهایی مثل{" "}
          <code dir="ltr">{`{{vramGb}}`}</code>،{" "}
          <code dir="ltr">{`{{memoryType}}`}</code>،{" "}
          <code dir="ltr">{`{{tdpWatt}}`}</code>،{" "}
          <code dir="ltr">{`{{boostClockMhz}}`}</code>،{" "}
          <code dir="ltr">{`{{gamingIndex}}`}</code> در متن استفاده کنید تا
          هنگام نمایش، با داده واقعی جایگزین شوند.
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
                  folder: "gpus",
                  ownerId: gpuUploadId,
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

      {!isCreateMode && item ? (
        <DeleteHardwareDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`حذف ${item.name}؟`}
          description="این GPU برای همیشه حذف می‌شود. aliasها و ارتباطات وابسته هم پاک می‌شوند."
          loading={deleting}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
