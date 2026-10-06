import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiUpload,
} from "@/lib/api-client";
import type { ArticleFormValues, ArticleCategoryFormValues } from "./validations";
import type {
  Article,
  ArticleCategory,
  ArticlesListResponse,
  CreateArticleCategoryInput,
  CreateArticleInput,
  UpdateArticleCategoryInput,
  UpdateArticleInput,
} from "./types";

export function toArticleInput(
  values: ArticleFormValues,
  options?: { createId?: string },
): CreateArticleInput {
  return {
    ...(options?.createId ? { id: options.createId } : {}),
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    content: values.content,
    excerpt: values.excerpt.trim() || null,
    coverPath: values.coverPath.trim() || null,
    status: values.status,
    categoryId: values.categoryId || null,
    authorName: values.authorName.trim() || null,
    metaTitle: values.metaTitle.trim() || null,
    metaDescription: values.metaDescription.trim() || null,
    canonicalUrl: values.canonicalUrl.trim() || null,
    noIndex: values.noIndex,
  };
}

export function toArticleCategoryInput(
  values: ArticleCategoryFormValues,
): CreateArticleCategoryInput {
  const sortOrder = Number(values.sortOrder);
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    description: values.description.trim() || null,
    metaTitle: values.metaTitle.trim() || null,
    metaDescription: values.metaDescription.trim() || null,
    noIndex: values.noIndex,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export async function fetchArticles(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  return apiGet<ArticlesListResponse>("admin/articles", {
    page: params.page,
    limit: params.limit,
    search: params.search?.trim() || undefined,
  });
}

export async function fetchArticle(id: string) {
  const data = await apiGet<{ article: Article }>(`admin/articles/${id}`);
  return data.article;
}

export async function createArticle(input: CreateArticleInput) {
  const data = await apiPost<{ article: Article }>("admin/articles", input);
  return data.article;
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  const data = await apiPatch<{ article: Article }>(
    `admin/articles/${id}`,
    input,
  );
  return data.article;
}

export async function saveArticle(
  values: ArticleFormValues,
  id?: string,
  createId?: string,
) {
  const payload = toArticleInput(values, { createId });
  if (id) return updateArticle(id, payload);
  return createArticle(payload);
}

export async function deleteArticle(id: string) {
  return apiDelete<{ success: true }>(`admin/articles/${id}`);
}

export async function fetchArticleCategories() {
  const data = await apiGet<{ items: ArticleCategory[] }>(
    "admin/article-categories",
  );
  return data.items;
}

export async function fetchArticleCategory(id: string) {
  const data = await apiGet<{ category: ArticleCategory }>(
    `admin/article-categories/${id}`,
  );
  return data.category;
}

export async function createArticleCategory(input: CreateArticleCategoryInput) {
  const data = await apiPost<{ category: ArticleCategory }>(
    "admin/article-categories",
    input,
  );
  return data.category;
}

export async function updateArticleCategory(
  id: string,
  input: UpdateArticleCategoryInput,
) {
  const data = await apiPatch<{ category: ArticleCategory }>(
    `admin/article-categories/${id}`,
    input,
  );
  return data.category;
}

export async function saveArticleCategory(
  values: ArticleCategoryFormValues,
  id?: string,
) {
  const payload = toArticleCategoryInput(values);
  if (id) return updateArticleCategory(id, payload);
  return createArticleCategory(payload);
}

export async function deleteArticleCategory(id: string) {
  return apiDelete<{ success: true }>(`admin/article-categories/${id}`);
}

export async function uploadAdminFile(
  file: File,
  articleId: string,
  scope: "cover" | "content" = "cover",
) {
  return apiUpload("admin/uploads", file, {
    folder: "articles",
    ownerId: articleId,
    scope,
  });
}

export function getFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4002/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  if (path.startsWith("/api/")) return `${origin}${path}`;
  return `${origin}/api/files/${path.replace(/^\/+/, "")}`;
}
