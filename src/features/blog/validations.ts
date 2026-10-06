import { z } from "zod";

export const articleCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "نام دسته‌بندی الزامی است" })
    .max(80, { error: "نام دسته‌بندی حداکثر ۸۰ کاراکتر است" }),
  slug: z.string().max(120, { error: "اسلاگ حداکثر ۱۲۰ کاراکتر است" }),
  description: z
    .string()
    .max(500, { error: "توضیحات حداکثر ۵۰۰ کاراکتر است" }),
  metaTitle: z
    .string()
    .max(120, { error: "عنوان متا حداکثر ۱۲۰ کاراکتر است" }),
  metaDescription: z
    .string()
    .max(320, { error: "توضیح متا حداکثر ۳۲۰ کاراکتر است" }),
  noIndex: z.boolean(),
  sortOrder: z.string(),
});

export type ArticleCategoryFormValues = z.infer<typeof articleCategorySchema>;

export const articleCategoryDefaultValues: ArticleCategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  noIndex: false,
  sortOrder: "0",
};

export const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "عنوان الزامی است" })
    .max(200, { error: "عنوان حداکثر ۲۰۰ کاراکتر است" }),
  slug: z.string().max(120, { error: "اسلاگ حداکثر ۱۲۰ کاراکتر است" }),
  content: z.string(),
  excerpt: z.string().max(500, { error: "خلاصه حداکثر ۵۰۰ کاراکتر است" }),
  coverPath: z.string().max(500, { error: "مسیر کاور حداکثر ۵۰۰ کاراکتر است" }),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryId: z.string(),
  authorName: z.string().max(120),
  metaTitle: z
    .string()
    .max(120, { error: "عنوان متا حداکثر ۱۲۰ کاراکتر است" }),
  metaDescription: z
    .string()
    .max(320, { error: "توضیح متا حداکثر ۳۲۰ کاراکتر است" }),
  canonicalUrl: z
    .string()
    .max(500, { error: "آدرس کنونیکال حداکثر ۵۰۰ کاراکتر است" }),
  noIndex: z.boolean(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;

export const articleDefaultValues: ArticleFormValues = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverPath: "",
  status: "DRAFT",
  categoryId: "",
  authorName: "",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  noIndex: false,
};
