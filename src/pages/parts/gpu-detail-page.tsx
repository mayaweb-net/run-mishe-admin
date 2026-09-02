import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createAdminGpu,
  deleteAdminGpu,
  fetchAdminGpu,
  updateAdminGpu,
} from "@/features/hardware/api";
import { gpuFieldSections } from "@/features/hardware/gpu-fields";
import { DeleteHardwareDialog } from "@/features/hardware/components/delete-hardware-dialog";
import { HardwareDetailFields } from "@/features/hardware/components/hardware-detail-fields";
import type { CreateGpuPayload, GpuDetail } from "@/features/hardware/types";

const CREATE_ID = "new";

const editableKeys = new Set<string>(
  gpuFieldSections.flatMap((section) =>
    section.fields.filter((field) => field.type !== "readonly").map((field) => field.key),
  ),
);

function createDefaultDraft(): Record<string, unknown> {
  return {
    name: "",
    slug: "",
    vendor: "NVIDIA",
    formFactor: "DESKTOP",
    isWorkstation: false,
    supportsRayTracing: false,
    quality: "IMPORTED",
  };
}

function toDraft(gpu: GpuDetail): Record<string, unknown> {
  return { ...gpu };
}

function toPayload(draft: Record<string, unknown>): CreateGpuPayload {
  const payload = {} as CreateGpuPayload;
  for (const key of editableKeys) {
    payload[key as keyof CreateGpuPayload] = draft[key] as never;
  }
  return payload;
}

export function GpuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreateMode = id === CREATE_ID;
  const [item, setItem] = useState<GpuDetail | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(createDefaultDraft);
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(isCreateMode);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
      const payload = toPayload(draft);

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
      setError(isCreateMode ? "ایجاد GPU با خطا مواجه شد." : "ذخیره تغییرات با خطا مواجه شد.");
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/parts/gpu" />}>
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
