import type { HardwareFieldConfig } from "@/features/hardware/components/hardware-detail-fields";
import { demandTierLabels, qualityLabels } from "@/features/games/types";

const demandTierOptions = Object.entries(demandTierLabels).map(
  ([value, label]) => ({ value, label }),
);

const qualityOptions = Object.entries(qualityLabels).map(([value, label]) => ({
  value,
  label,
}));

export const gameFieldSections: Array<{
  title: string;
  fields: HardwareFieldConfig[];
}> = [
  {
    title: "شناسه",
    fields: [
      { key: "name", label: "نام", type: "text" },
      { key: "nameFa", label: "نام فارسی", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "coverUrl", label: "Cover URL", type: "text" },
    ],
  },
  {
    title: "اطلاعات",
    fields: [
      { key: "developer", label: "توسعه‌دهنده", type: "text" },
      { key: "publisher", label: "ناشر", type: "text" },
      { key: "engine", label: "موتور", type: "text" },
      { key: "releaseDate", label: "تاریخ انتشار", type: "date" },
      { key: "genres", label: "ژانرها", type: "array" },
      { key: "description", label: "توضیحات", type: "text" },
    ],
  },
  {
    title: "Steam / متادیتا",
    fields: [
      { key: "steamAppId", label: "Steam App ID", type: "number" },
      { key: "igdbId", label: "IGDB ID", type: "number" },
      {
        key: "demandTier",
        label: "Demand Tier",
        type: "select",
        options: demandTierOptions,
      },
      { key: "popularity", label: "Popularity", type: "number" },
      { key: "isPopular", label: "محبوب", type: "boolean" },
      { key: "isPublished", label: "منتشر شده", type: "boolean" },
      {
        key: "quality",
        label: "کیفیت داده",
        type: "select",
        options: qualityOptions,
      },
      { key: "sourceName", label: "منبع", type: "text" },
      { key: "sourceUrl", label: "لینک منبع", type: "text" },
      { key: "createdAt", label: "ایجاد", type: "readonly" },
      { key: "updatedAt", label: "آخرین بروزرسانی", type: "readonly" },
    ],
  },
];
