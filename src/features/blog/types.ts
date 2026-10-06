export type ArticleStatus = "DRAFT" | "PUBLISHED";

export type ArticleCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  noIndex: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { articles: number };
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverPath: string | null;
  status: ArticleStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  publishedAt: string | null;
  authorName: string | null;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type ArticlesListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ArticlesListResponse = {
  items: Article[];
  meta: ArticlesListMeta;
};

export type CreateArticleInput = {
  id?: string;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  coverPath?: string | null;
  status?: ArticleStatus;
  categoryId?: string | null;
  authorName?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export type CreateArticleCategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  noIndex?: boolean;
  sortOrder?: number;
};

export type UpdateArticleCategoryInput = Partial<CreateArticleCategoryInput>;
