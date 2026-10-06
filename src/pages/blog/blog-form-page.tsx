import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import {
  fetchArticle,
  fetchArticleCategories,
  saveArticle,
  uploadAdminFile,
} from "@/features/blog/api";
import type { ArticleCategory } from "@/features/blog/types";
import {
  articleDefaultValues,
  articleSchema,
  type ArticleFormValues,
} from "@/features/blog/validations";
import { ApiError } from "@/lib/api-client";

const NONE_VALUE = "__none__";

function slugifyTitle(title: string) {
  return title
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

export function BlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const draftIdRef = useRef(crypto.randomUUID());
  const articleId = id ?? draftIdRef.current;
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: articleDefaultValues,
  });

  const coverPath = watch("coverPath");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const cats = await fetchArticleCategories();
        if (!cancelled) setCategories(cats);

        if (!isEdit || !id) {
          if (!cancelled) setLoading(false);
          return;
        }

        const article = await fetchArticle(id);
        if (cancelled) return;
        reset({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt ?? "",
          coverPath: article.coverPath ?? "",
          status: article.status,
          categoryId: article.categoryId ?? article.category?.id ?? "",
          authorName: article.authorName ?? "",
          metaTitle: article.metaTitle ?? "",
          metaDescription: article.metaDescription ?? "",
          canonicalUrl: article.canonicalUrl ?? "",
          noIndex: article.noIndex,
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

  async function handleCoverChange(file: File | null) {
    if (!file) return;
    setCoverUploading(true);
    setError(null);
    try {
      const uploaded = await uploadAdminFile(file, articleId, "cover");
      setValue("coverPath", uploaded.path, { shouldDirty: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCoverUploading(false);
    }
  }

  async function onSubmit(values: ArticleFormValues) {
    setSaving(true);
    setError(null);
    try {
      const article = await saveArticle(
        values,
        id,
        isEdit ? undefined : draftIdRef.current,
      );
      navigate(`/blog/${article.id}/edit`, { replace: true });
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
        در حال بارگذاری مقاله...
      </div>
    );
  }

  if (isEdit && error && !watch("title")) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" variant="outline" onClick={() => navigate("/blog")}>
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  const pageTitle = isEdit ? "ویرایش مقاله" : "مقاله جدید";

  return (
    <form
      onSubmit={handleSubmit((values) => void onSubmit(values))}
      className="mx-auto flex w-full max-w-5xl flex-col gap-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
          <Link
            to="/blog"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            بازگشت به لیست مقالات
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/blog")}
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

      <div className="grid gap-4 rounded-2xl border bg-background p-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-title">عنوان</Label>
          <Input
            id="article-title"
            placeholder="عنوان مقاله"
            {...register("title", {
              onChange: (event) => {
                if (!slugTouched && !isEdit) {
                  setValue("slug", slugifyTitle(event.target.value), {
                    shouldDirty: true,
                  });
                }
              },
            })}
          />
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="article-slug">اسلاگ</Label>
          <Input
            id="article-slug"
            dir="ltr"
            placeholder="optional-auto-from-title"
            {...register("slug", {
              onChange: () => setSlugTouched(true),
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="article-status">وضعیت</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (value != null) field.onChange(value);
                }}
              >
                <SelectTrigger id="article-status" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">پیش‌نویس</SelectItem>
                  <SelectItem value="PUBLISHED">منتشر شده</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-category">دسته‌بندی</Label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || NONE_VALUE}
                onValueChange={(value) => {
                  if (value == null) return;
                  field.onChange(value === NONE_VALUE ? "" : value);
                }}
              >
                <SelectTrigger id="article-category" className="h-11 w-full">
                  <SelectValue placeholder="بدون دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>بدون دسته‌بندی</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-author">نام نویسنده (اختیاری)</Label>
          <Input id="article-author" {...register("authorName")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-excerpt">خلاصه (اختیاری)</Label>
          <Textarea
            id="article-excerpt"
            placeholder="خلاصه کوتاه برای لیست و سئو"
            rows={3}
            {...register("excerpt")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-cover">کاور (اختیاری)</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="article-cover"
              type="file"
              accept="image/*"
              disabled={coverUploading}
              onChange={(event) =>
                void handleCoverChange(event.target.files?.[0] ?? null)
              }
            />
            {coverUploading ? <Spinner className="size-4" /> : null}
          </div>
          {coverPath ? (
            <p className="text-xs text-muted-foreground" dir="ltr">
              {coverPath}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border bg-background p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-sm font-semibold">سئو</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            اگر خالی بماند از عنوان، خلاصه یا متن مقاله استفاده می‌شود.
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-meta-title">عنوان متا</Label>
          <Input
            id="article-meta-title"
            placeholder="عنوان اختصاصی برای گوگل"
            maxLength={120}
            {...register("metaTitle")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-meta-description">توضیح متا</Label>
          <Textarea
            id="article-meta-description"
            placeholder="توضیح کوتاه برای نتایج جستجو"
            rows={3}
            maxLength={320}
            {...register("metaDescription")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-canonical">Canonical URL</Label>
          <Input
            id="article-canonical"
            dir="ltr"
            placeholder="https://example.com/blog/slug"
            {...register("canonicalUrl")}
          />
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
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
          noindex — این مقاله در موتورهای جستجو ایندکس نشود
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-background">
        <div className="border-b px-4 py-3 text-sm font-medium">محتوا</div>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <SimpleEditor
              value={field.value}
              onChange={field.onChange}
              articleId={articleId}
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/blog")}
          disabled={saving}
        >
          انصراف
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Spinner className="size-4" /> : null}
          ذخیره
        </Button>
      </div>
    </form>
  );
}
