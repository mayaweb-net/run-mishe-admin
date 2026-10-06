export type ScreenResolution =
  | "R720P"
  | "R1080P"
  | "R1440P"
  | "R2160P"
  | "UW1440P"
  | "UW2160P";

export type QualityPreset = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";

export type Upscaler =
  | "NONE"
  | "DLSS_QUALITY"
  | "DLSS_BALANCED"
  | "DLSS_PERFORMANCE"
  | "FSR_QUALITY"
  | "FSR_BALANCED"
  | "FSR_PERFORMANCE"
  | "XESS_QUALITY"
  | "XESS_BALANCED";

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

export interface FpsSampleRef {
  id: string;
  slug: string;
  name: string;
}

export interface FpsSampleListItem {
  id: string;
  resolution: ScreenResolution;
  preset: QualityPreset;
  upscaler: Upscaler;
  rayTracing: boolean;
  frameGen: boolean;
  ramGb: number | null;
  avgFps: number;
  onePercentLow: number | null;
  minFps: number | null;
  maxFps: number | null;
  source: string;
  sourceUrl: string | null;
  confidence: number;
  capturedAt: string;
  createdAt: string;
  game: FpsSampleRef;
  gpu: FpsSampleRef;
  cpu: FpsSampleRef;
}

export interface FpsSampleListQuery {
  page?: number;
  limit?: number;
  q?: string;
  gameId?: string;
  gpuId?: string;
  source?: string;
  resolution?: ScreenResolution;
  preset?: QualityPreset;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateFpsSampleEntry {
  resolution: ScreenResolution;
  preset: QualityPreset;
  avgFps: number;
  upscaler?: Upscaler;
  rayTracing?: boolean;
  frameGen?: boolean;
  onePercentLow?: number;
  ramGb?: number;
}

export interface CreateFpsSamplesPayload {
  gameId: string;
  cpuId: string;
  gpuId: string;
  source?: string;
  sourceUrl?: string;
  confidence?: number;
  entries: CreateFpsSampleEntry[];
}

export interface UpdateFpsSamplePayload {
  gameId?: string;
  cpuId?: string;
  gpuId?: string;
  resolution?: ScreenResolution;
  preset?: QualityPreset;
  upscaler?: Upscaler;
  rayTracing?: boolean;
  frameGen?: boolean;
  ramGb?: number | null;
  avgFps?: number;
  onePercentLow?: number | null;
  source?: string;
  sourceUrl?: string | null;
  confidence?: number;
}

export interface CreateFpsSamplesResult {
  items: FpsSampleListItem[];
  created: number;
  updated: number;
  source: string;
}

export interface CalibrateFpsResult {
  calibrationVersion: number;
  totalGames: number;
  calibrated: number;
  skipped: number;
  rejected: number;
  outcomes: Array<{
    slug: string;
    name: string;
    status: string;
    sampleCount: number;
    holdoutMape: number | null;
    reason?: string;
  }>;
}

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
