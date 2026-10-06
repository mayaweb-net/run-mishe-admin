import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchArticleCategory,
  saveArticleCategory,
} from "@/features/blog/api";
import {
  articleCategoryDefaultValues,
  articleCategorySchema,
  type ArticleCategoryFormValues,
} from "@/features/blog/validations";
import { ApiError } from "@/lib/api-client";

function slugifyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const body = error.body as { message?: string | string[] } | undefined;
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message)) return body.message.join("، ");
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "خطای ناشناخته";
}

export function BlogCategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ArticleCategoryFormValues>({
    resolver: zodResolver(articleCategorySchema),
    defaultValues: articleCategoryDefaultValues,
  });

  useEffect(() => {
    if (!isEdit || !id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const category = await fetchArticleCategory(id!);
        if (cancelled) return;
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          metaTitle: category.metaTitle ?? "",
          metaDescription: category.metaDescription ?? "",
          noIndex: category.noIndex,
          sortOrder: String(category.sortOrder ?? 0),
        });
        setSlugTouched(true);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, reset]);

  async function onSubmit(values: ArticleCategoryFormValues) {
    setSaving(true);
    setError(null);
    try {
      const category = await saveArticleCategory(values, id);
      navigate(`/blog/categories/${category.id}/edit`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Spinner className="size-5" />
        در حال بارگذاری دسته‌بندی...
      </div>
    );
  }

  if (isEdit && error) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/blog/categories")}
        >
          بازگشت
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => void onSubmit(values))}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {isEdit ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
          </h1>
          <Link
            to="/blog/categories"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            بازگشت به لیست
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/blog/categories")}
            disabled={saving}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner className="size-4" /> : null}
            ذخیره
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 rounded-2xl border p-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">نام</Label>
          <Input
            id="category-name"
            {...register("name", {
              onChange: (event) => {
                if (!slugTouched && !isEdit) {
                  setValue("slug", slugifyName(event.target.value), {
                    shouldDirty: true,
                  });
                }
              },
            })}
          />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-slug">اسلاگ</Label>
          <Input
            id="category-slug"
            dir="ltr"
            {...register("slug", {
              onChange: () => setSlugTouched(true),
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description">توضیحات</Label>
          <Textarea id="category-description" rows={3} {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-sort">ترتیب</Label>
          <Input id="category-sort" dir="ltr" {...register("sortOrder")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-meta-title">عنوان متا</Label>
          <Input id="category-meta-title" {...register("metaTitle")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-meta-description">توضیح متا</Label>
          <Textarea
            id="category-meta-description"
            rows={3}
            {...register("metaDescription")}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Controller
            name="noIndex"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) =>
                  field.onChange(checked === true)
                }
              />
            )}
          />
          noindex
        </label>
      </div>
    </form>
  );
}
