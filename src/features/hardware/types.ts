export type Vendor =
  | "INTEL"
  | "AMD"
  | "NVIDIA"
  | "APPLE"
  | "QUALCOMM"
  | "ARM"
  | "OTHER";

export type FormFactor =
  | "DESKTOP"
  | "LAPTOP"
  | "SERVER"
  | "INTEGRATED"
  | "CONSOLE";

export type DataQuality = "VERIFIED" | "IMPORTED" | "ESTIMATED";

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface CpuListItem {
  id: string;
  slug: string;
  name: string;
  vendor: Vendor;
  family: string | null;
  series: string | null;
  generation: number | null;
  formFactor: FormFactor;
  performanceCores: number;
  efficiencyCores: number;
  threads: number;
  gamingIndex: number | null;
  quality: DataQuality;
  releaseDate: string | null;
  createdAt: string;
}

export interface CpuDetail {
  id: string;
  slug: string;
  normalizedName: string;
  name: string;
  vendor: Vendor;
  family: string | null;
  series: string | null;
  generation: number | null;
  codename: string | null;
  architecture: string | null;
  socket: string | null;
  releaseDate: string | null;
  performanceCores: number;
  efficiencyCores: number;
  threads: number;
  baseClockMhz: number | null;
  boostClockMhz: number | null;
  l2CacheMb: number | null;
  l3CacheMb: number | null;
  tdpWatt: number | null;
  maxTempC: number | null;
  processNodeNm: number | null;
  formFactor: FormFactor;
  isUnlocked: boolean;
  isX3d: boolean;
  memoryTypes: string[];
  memoryChannels: number | null;
  maxMemoryGb: number | null;
  pcieVersion: number | null;
  pcieLanes: number | null;
  instructionSets: string[];
  singleThreadIndex: number | null;
  multiThreadIndex: number | null;
  gamingIndex: number | null;
  indexCalculatedAt: string | null;
  msrpUsd: number | null;
  quality: DataQuality;
  sourceName: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateCpuPayload = Partial<
  Pick<
    CpuDetail,
    | "name"
    | "slug"
    | "vendor"
    | "family"
    | "series"
    | "generation"
    | "codename"
    | "architecture"
    | "socket"
    | "releaseDate"
    | "performanceCores"
    | "efficiencyCores"
    | "threads"
    | "baseClockMhz"
    | "boostClockMhz"
    | "l2CacheMb"
    | "l3CacheMb"
    | "tdpWatt"
    | "maxTempC"
    | "processNodeNm"
    | "formFactor"
    | "isUnlocked"
    | "isX3d"
    | "memoryTypes"
    | "memoryChannels"
    | "maxMemoryGb"
    | "pcieVersion"
    | "pcieLanes"
    | "instructionSets"
    | "msrpUsd"
    | "quality"
    | "sourceName"
    | "sourceUrl"
  >
>;

export type CreateCpuPayload = UpdateCpuPayload &
  Pick<CpuDetail, "name" | "vendor" | "performanceCores" | "threads">;

export interface GpuListItem {
  id: string;
  slug: string;
  name: string;
  vendor: Vendor;
  family: string | null;
  series: string | null;
  generation: number | null;
  formFactor: FormFactor;
  vramGb: number | null;
  memoryType: string | null;
  tdpWatt: number | null;
  gamingIndex: number | null;
  quality: DataQuality;
  releaseDate: string | null;
  createdAt: string;
}

export interface GpuDetail {
  id: string;
  slug: string;
  normalizedName: string;
  name: string;
  vendor: Vendor;
  family: string | null;
  series: string | null;
  generation: number | null;
  architecture: string | null;
  codename: string | null;
  chip: string | null;
  releaseDate: string | null;
  shadingUnits: number | null;
  tmus: number | null;
  rops: number | null;
  tensorCores: number | null;
  rayTracingCores: number | null;
  baseClockMhz: number | null;
  boostClockMhz: number | null;
  gameClockMhz: number | null;
  memoryClockMhz: number | null;
  vramGb: number | null;
  memoryType: string | null;
  memoryBusBits: number | null;
  bandwidthGbps: number | null;
  busInterface: string | null;
  pcieVersion: number | null;
  pcieLanes: number | null;
  tdpWatt: number | null;
  recommendedPsuW: number | null;
  formFactor: FormFactor;
  isWorkstation: boolean;
  supportsRayTracing: boolean;
  dlssVersion: number | null;
  fsrVersion: number | null;
  supportsXess: boolean;
  supportsFrameGen: boolean;
  supportsMultiFrameGen: boolean;
  supportsAv1Encode: boolean;
  supportsAv1Decode: boolean;
  supportsCuda: boolean;
  directxVersion: string | null;
  vulkanVersion: string | null;
  openglVersion: string | null;
  maxDisplays: number | null;
  gamingIndex: number | null;
  computeIndex: number | null;
  indexCalculatedAt: string | null;
  msrpUsd: number | null;
  quality: DataQuality;
  sourceName: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateGpuPayload = Partial<
  Pick<
    GpuDetail,
    | "name"
    | "slug"
    | "vendor"
    | "family"
    | "series"
    | "generation"
    | "architecture"
    | "codename"
    | "chip"
    | "releaseDate"
    | "shadingUnits"
    | "baseClockMhz"
    | "boostClockMhz"
    | "vramGb"
    | "memoryType"
    | "memoryBusBits"
    | "bandwidthGbps"
    | "tdpWatt"
    | "recommendedPsuW"
    | "formFactor"
    | "isWorkstation"
    | "supportsRayTracing"
    | "msrpUsd"
    | "quality"
    | "sourceName"
    | "sourceUrl"
  >
>;

export type CreateGpuPayload = UpdateGpuPayload &
  Pick<GpuDetail, "name" | "vendor">;

export interface HardwareListQuery {
  page?: number;
  limit?: number;
  q?: string;
  vendor?: Vendor;
  formFactor?: FormFactor;
  quality?: DataQuality;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const vendorLabels: Record<Vendor, string> = {
  INTEL: "Intel",
  AMD: "AMD",
  NVIDIA: "NVIDIA",
  APPLE: "Apple",
  QUALCOMM: "Qualcomm",
  ARM: "ARM",
  OTHER: "سایر",
};

export const formFactorLabels: Record<FormFactor, string> = {
  DESKTOP: "دسکتاپ",
  LAPTOP: "لپ‌تاپ",
  SERVER: "سرور",
  INTEGRATED: "یکپارچه",
  CONSOLE: "کنسول",
};

export const qualityLabels: Record<DataQuality, string> = {
  VERIFIED: "تأییدشده",
  IMPORTED: "واردشده",
  ESTIMATED: "تخمینی",
};
