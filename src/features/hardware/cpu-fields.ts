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

export const cpuFieldSections: Array<{
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
      { key: "codename", label: "Codename", type: "text" },
      { key: "architecture", label: "معماری", type: "text" },
      { key: "socket", label: "سوکت", type: "text" },
      { key: "releaseDate", label: "تاریخ عرضه", type: "date" },
    ],
  },
  {
    title: "مشخصات",
    fields: [
      { key: "performanceCores", label: "هسته P", type: "number" },
      { key: "efficiencyCores", label: "هسته E", type: "number" },
      { key: "threads", label: "ترد", type: "number" },
      { key: "baseClockMhz", label: "Base Clock (MHz)", type: "number" },
      { key: "boostClockMhz", label: "Boost Clock (MHz)", type: "number" },
      { key: "l2CacheMb", label: "L2 Cache (MB)", type: "number" },
      { key: "l3CacheMb", label: "L3 Cache (MB)", type: "number" },
      { key: "tdpWatt", label: "TDP (W)", type: "number" },
      { key: "maxTempC", label: "Max Temp (°C)", type: "number" },
      { key: "processNodeNm", label: "Process Node (nm)", type: "number" },
    ],
  },
  {
    title: "فرم و حافظه",
    fields: [
      {
        key: "formFactor",
        label: "فرم‌فاکتور",
        type: "select",
        options: formFactorOptions,
      },
      { key: "isUnlocked", label: "Unlocked", type: "boolean" },
      { key: "isX3d", label: "X3D", type: "boolean" },
      { key: "memoryTypes", label: "انواع RAM", type: "array" },
      { key: "memoryChannels", label: "کانال RAM", type: "number" },
      { key: "maxMemoryGb", label: "حداکثر RAM (GB)", type: "number" },
      { key: "pcieVersion", label: "PCIe Version", type: "number" },
      { key: "pcieLanes", label: "PCIe Lanes", type: "number" },
      { key: "instructionSets", label: "Instruction Sets", type: "array" },
    ],
  },
  {
    title: "شاخص‌ها (فقط خواندنی)",
    fields: [
      { key: "gamingIndex", label: "Gaming Index", type: "readonly" },
      { key: "singleThreadIndex", label: "Single Thread Index", type: "readonly" },
      { key: "multiThreadIndex", label: "Multi Thread Index", type: "readonly" },
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
