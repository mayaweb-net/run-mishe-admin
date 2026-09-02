import type { HardwareFieldConfig } from "@/features/hardware/components/hardware-detail-fields";
import {
  formFactorLabels,
  qualityLabels,
  vendorLabels,
} from "@/features/hardware/types";

const vendorOptions = Object.entries(vendorLabels).map(([value, label]) => ({
  value,
  label,
}));

const formFactorOptions = Object.entries(formFactorLabels).map(
  ([value, label]) => ({ value, label }),
);

const qualityOptions = Object.entries(qualityLabels).map(([value, label]) => ({
  value,
  label,
}));

export const gpuFieldSections: Array<{
  title: string;
  fields: HardwareFieldConfig[];
}> = [
  {
    title: "شناسه",
    fields: [
      { key: "name", label: "نام نمایشی", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "normalizedName", label: "نام نرمال‌شده", type: "readonly" },
      {
        key: "vendor",
        label: "سازنده",
        type: "select",
        options: vendorOptions,
      },
    ],
  },
  {
    title: "طبقه‌بندی",
    fields: [
      { key: "family", label: "خانواده", type: "text" },
      { key: "series", label: "سری", type: "text" },
      { key: "generation", label: "نسل", type: "number" },
      { key: "architecture", label: "معماری", type: "text" },
      { key: "codename", label: "Codename", type: "text" },
      { key: "chip", label: "Chip", type: "text" },
      { key: "releaseDate", label: "تاریخ عرضه", type: "date" },
    ],
  },
  {
    title: "مشخصات",
    fields: [
      { key: "shadingUnits", label: "Shading Units", type: "number" },
      { key: "baseClockMhz", label: "Base Clock (MHz)", type: "number" },
      { key: "boostClockMhz", label: "Boost Clock (MHz)", type: "number" },
      { key: "gameClockMhz", label: "Game Clock (MHz)", type: "readonly" },
      { key: "memoryClockMhz", label: "Memory Clock (MHz)", type: "readonly" },
      { key: "vramGb", label: "VRAM (GB)", type: "number" },
      { key: "memoryType", label: "Memory Type", type: "text" },
      { key: "memoryBusBits", label: "Memory Bus (bit)", type: "number" },
      { key: "bandwidthGbps", label: "Bandwidth (GB/s)", type: "number" },
      { key: "tdpWatt", label: "TDP (W)", type: "number" },
      { key: "recommendedPsuW", label: "Recommended PSU (W)", type: "number" },
    ],
  },
  {
    title: "فرم و قابلیت‌ها",
    fields: [
      {
        key: "formFactor",
        label: "فرم‌فاکتور",
        type: "select",
        options: formFactorOptions,
      },
      { key: "isWorkstation", label: "Workstation", type: "boolean" },
      { key: "supportsRayTracing", label: "Ray Tracing", type: "boolean" },
      { key: "busInterface", label: "Bus Interface", type: "readonly" },
      { key: "pcieVersion", label: "PCIe Version", type: "readonly" },
      { key: "pcieLanes", label: "PCIe Lanes", type: "readonly" },
    ],
  },
  {
    title: "شاخص‌ها (فقط خواندنی)",
    fields: [
      { key: "gamingIndex", label: "Gaming Index", type: "readonly" },
      { key: "computeIndex", label: "Compute Index", type: "readonly" },
      { key: "indexCalculatedAt", label: "Index Calculated At", type: "readonly" },
    ],
  },
  {
    title: "متادیتا",
    fields: [
      {
        key: "quality",
        label: "کیفیت داده",
        type: "select",
        options: qualityOptions,
      },
      { key: "msrpUsd", label: "MSRP (USD)", type: "number" },
      { key: "sourceName", label: "منبع", type: "text" },
      { key: "sourceUrl", label: "لینک منبع", type: "text" },
      { key: "createdAt", label: "ایجاد", type: "readonly" },
      { key: "updatedAt", label: "آخرین بروزرسانی", type: "readonly" },
    ],
  },
];
