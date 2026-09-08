export type HardwareKind = "CPU" | "GPU";

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

export interface BenchmarkListItem {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  target: HardwareKind;
  category: string | null;
  version: string | null;
  unit: string;
  higherIsBetter: boolean;
  weightInIndex: number;
  isActive: boolean;
  description: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BenchmarkScoreHardware {
  id: string;
  slug: string;
  name: string;
}

export interface BenchmarkScoreBenchmark {
  id: string;
  slug: string;
  name: string;
  vendor: string;
}

export interface BenchmarkScoreListItem {
  id: string;
  score: number;
  sampleCount: number | null;
  source: string;
  sourceUrl: string | null;
  capturedAt: string;
  createdAt: string;
  hardware: BenchmarkScoreHardware;
  benchmark: BenchmarkScoreBenchmark;
}

export interface BenchmarkListQuery {
  page?: number;
  limit?: number;
  q?: string;
  target?: HardwareKind;
  isActive?: "true" | "false";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BenchmarkScoreListQuery {
  page?: number;
  limit?: number;
  q?: string;
  source?: string;
  benchmarkSlug?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type ScreenResolution =
  | "R720P"
  | "R1080P"
  | "R1440P"
  | "R2160P"
  | "UW1440P"
  | "UW2160P";

export type QualityPreset = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";

export interface DefaultScalingListItem {
  id: string;
  resolution: ScreenResolution;
  preset: QualityPreset;
  upscaler: string;
  rayTracing: boolean;
  multiplier: number;
  note: string | null;
}

export interface DefaultScalingListQuery {
  page?: number;
  limit?: number;
  resolution?: ScreenResolution;
  preset?: QualityPreset;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const hardwareKindLabels: Record<HardwareKind, string> = {
  CPU: "CPU",
  GPU: "GPU",
};

export const resolutionLabels: Record<ScreenResolution, string> = {
  R720P: "720p",
  R1080P: "1080p",
  R1440P: "1440p",
  R2160P: "4K",
  UW1440P: "UW 1440p",
  UW2160P: "UW 4K",
};

export const presetLabels: Record<QualityPreset, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  ULTRA: "Ultra",
};
