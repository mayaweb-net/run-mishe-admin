import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteArticleCategory,
  fetchArticleCategories,
} from "@/features/blog/api";
import type { ArticleCategory } from "@/features/blog/types";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

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

export function BlogCategoriesPage() {
  const [items, setItems] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchArticleCategories());
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(category: ArticleCategory) {
    const count = category._count?.articles ?? 0;
    const confirmed = window.confirm(
      count > 0
        ? `دسته‌بندی «${category.name}» حذف شود؟ مقالات مرتبط بدون دسته می‌مانند.`
        : `دسته‌بندی «${category.name}» حذف شود؟`,
    );
    if (!confirmed) return;
    setDeletingId(category.id);
    try {
      await deleteArticleCategory(category.id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderOpen className="size-5" />
          <span className="text-sm">مدیریت دسته‌بندی مقالات</span>
        </div>
        <Link
          to="/blog/categories/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus />
          دسته‌بندی جدید
        </Link>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          هنوز دسته‌بندی‌ای ثبت نشده است.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>اسلاگ</TableHead>
                <TableHead>ترتیب</TableHead>
                <TableHead>مقالات</TableHead>
                <TableHead className="w-28">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell dir="ltr" className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell>{category._count?.articles ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/blog/categories/${category.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        )}
                      >
                        <Pencil />
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={deletingId === category.id}
                        onClick={() => void handleDelete(category)}
                      >
                        {deletingId === category.id ? (
                          <Spinner className="size-4" />
                        ) : (
                          <Trash2 />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
