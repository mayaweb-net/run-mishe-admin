import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
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
import { PaginationBar } from "@/features/hardware/components/pagination-bar";
import { deleteArticle, fetchArticles } from "@/features/blog/api";
import type { Article } from "@/features/blog/types";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

const PAGE_SIZE = 10;

function statusLabel(status: Article["status"]) {
  return status === "PUBLISHED" ? "منتشر شده" : "پیش‌نویس";
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

export function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const search = searchParams.get("q") ?? "";
  const [items, setItems] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArticles({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setItems(data.items);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next === search) return;
      const params = new URLSearchParams(searchParams);
      if (next) params.set("q", next);
      else params.delete("q");
      params.delete("page");
      setSearchParams(params);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [searchInput, search, searchParams, setSearchParams]);

  async function handleDelete(article: Article) {
    const confirmed = window.confirm(`مقاله «${article.title}» حذف شود؟`);
    if (!confirmed) return;
    setDeletingId(article.id);
    try {
      await deleteArticle(article.id);
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
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="جستجو عنوان یا اسلاگ..."
          className="sm:max-w-72"
        />
        <Link
          to="/blog/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus />
          مقاله جدید
        </Link>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper />
            </EmptyMedia>
            <EmptyTitle>مقاله‌ای نیست</EmptyTitle>
            <EmptyDescription>
              اولین مقاله بلاگ را ایجاد کنید.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>دسته</TableHead>
                  <TableHead>به‌روزرسانی</TableHead>
                  <TableHead className="w-28">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{article.title}</span>
                        <span className="text-xs text-muted-foreground" dir="ltr">
                          {article.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          article.status === "PUBLISHED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {statusLabel(article.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.category?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(article.updatedAt).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/blog/${article.id}/edit`}
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
                          disabled={deletingId === article.id}
                          onClick={() => void handleDelete(article)}
                        >
                          {deletingId === article.id ? (
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
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={(nextPage) => {
              const params = new URLSearchParams(searchParams);
              if (nextPage > 1) params.set("page", String(nextPage));
              else params.delete("page");
              setSearchParams(params);
            }}
          />
        </>
      )}
    </div>
  );
}
