export type DemandTier = "LIGHT" | "MEDIUM" | "HEAVY" | "EXTREME";
export type DataQuality = "VERIFIED" | "IMPORTED" | "ESTIMATED";
export type RequirementTier =
  | "MINIMUM"
  | "RECOMMENDED"
  | "HIGH"
  | "ULTRA";

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

export interface RequirementSummary {
  cpu: string | null;
  gpu: string | null;
  cpuLinked: boolean;
  gpuLinked: boolean;
  needsReview: boolean;
  optionCount: number;
  ramGb: number | null;
  vramGb: number | null;
  os: string | null;
  storageGb: number | null;
}

export interface GameListItem {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  coverUrl: string | null;
  demandTier: DemandTier;
  isPopular: boolean;
  isPublished: boolean;
  releaseDate: string | null;
  steamAppId: number | null;
  popularity: number | null;
  quality: DataQuality;
  hasConnectionIssue: boolean;
  minimum: RequirementSummary | null;
  recommended: RequirementSummary | null;
}

export interface GameRequirementOption {
  id: string;
  kind: "CPU" | "GPU";
  matchedText: string;
  matchScore: number;
  needsReview: boolean;
  cpu: { id: string; name: string } | null;
  gpu: { id: string; name: string } | null;
}

export interface GameRequirement {
  tier: RequirementTier;
  rawCpuText: string | null;
  rawGpuText: string | null;
  os: string | null;
  ramGb: number | null;
  vramGb: number | null;
  storageGb: number | null;
  directX: string | null;
  needsSsd: boolean;
  notes: string | null;
  options: GameRequirementOption[];
}

export interface GameRequirementInput {
  tier: Extract<RequirementTier, "MINIMUM" | "RECOMMENDED">;
  cpuId: string | null;
  gpuId: string | null;
  cpuName: string | null;
  gpuName: string | null;
  rawCpuText: string | null;
  rawGpuText: string | null;
  os: string | null;
  ramGb: number | null;
  vramGb: number | null;
  storageGb: number | null;
  directX: string | null;
  needsSsd: boolean;
  notes: string | null;
}

export interface GameDetail {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  releaseDate: string | null;
  engine: string | null;
  developer: string | null;
  publisher: string | null;
  genres: string[];
  coverUrl: string | null;
  description: string | null;
  steamAppId: number | null;
  igdbId: number | null;
  demandTier: DemandTier;
  isPopular: boolean;
  popularity: number | null;
  isPublished: boolean;
  quality: DataQuality;
  sourceName: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  requirements: GameRequirement[];
}

export interface GameListQuery {
  page?: number;
  limit?: number;
  q?: string;
  demandTier?: DemandTier;
  isPopular?: boolean;
  isPublished?: boolean;
  quality?: DataQuality;
  reviewStatus?:
    | "NEEDS_REVIEW"
    | "UNMATCHED_CPU"
    | "UNMATCHED_GPU"
    | "UNMATCHED_ANY";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type UpdateGamePayload = Partial<
  Pick<
    GameDetail,
    | "name"
    | "slug"
    | "nameFa"
    | "releaseDate"
    | "engine"
    | "developer"
    | "publisher"
    | "genres"
    | "coverUrl"
    | "description"
    | "steamAppId"
    | "igdbId"
    | "demandTier"
    | "isPopular"
    | "popularity"
    | "isPublished"
    | "quality"
    | "sourceName"
    | "sourceUrl"
  >
> & {
  requirements?: Array<
    Omit<GameRequirementInput, "cpuName" | "gpuName">
  >;
};

export type CreateGamePayload = UpdateGamePayload & Pick<GameDetail, "name">;

export type RequirementMatchSource = "exact" | "search";

export interface HardwareMatchSuggestion {
  hardwareId: string;
  hardwareName: string;
  matchedText: string;
  matchScore: number;
  source: RequirementMatchSource;
  alias: string | null;
}

export interface RequirementFieldSuggestions {
  tier: Extract<RequirementTier, "MINIMUM" | "RECOMMENDED">;
  kind: "CPU" | "GPU";
  rawText: string | null;
  currentHardwareId: string | null;
  currentHardwareName: string | null;
  isLinked: boolean;
  suggestions: HardwareMatchSuggestion[];
}

export interface ApplyRequirementMatchItem {
  tier: Extract<RequirementTier, "MINIMUM" | "RECOMMENDED">;
  kind: "CPU" | "GPU";
  hardwareId: string;
}

export interface ApplyRequirementMatchesPayload {
  matches: ApplyRequirementMatchItem[];
}

export interface UnmatchedRequirementGameRef {
  id: string;
  slug: string;
  name: string;
  tier: Extract<RequirementTier, "MINIMUM" | "RECOMMENDED">;
}

export interface UnmatchedRequirementItem {
  kind: "CPU" | "GPU";
  rawText: string;
  gameCount: number;
  minimumCount: number;
  recommendedCount: number;
  isGeneric: boolean;
  games: UnmatchedRequirementGameRef[];
}

export interface UnmatchedRequirementsReportSummary {
  totalUnmatchedFields: number;
  uniqueCpuTexts: number;
  uniqueGpuTexts: number;
  actionableCpuTexts: number;
  actionableGpuTexts: number;
  affectedGames: number;
}

export interface UnmatchedRequirementsReport {
  generatedAt: string;
  summary: UnmatchedRequirementsReportSummary;
  items: UnmatchedRequirementItem[];
}

export const demandTierLabels: Record<DemandTier, string> = {
  LIGHT: "سبک",
  MEDIUM: "متوسط",
  HEAVY: "سنگین",
  EXTREME: "خیلی سنگین",
};

export const requirementTierLabels: Record<RequirementTier, string> = {
  MINIMUM: "حداقل",
  RECOMMENDED: "پیشنهادی",
  HIGH: "بالا",
  ULTRA: "اولترا",
};

export const qualityLabels: Record<DataQuality, string> = {
  VERIFIED: "تأییدشده",
  IMPORTED: "واردشده",
  ESTIMATED: "تخمینی",
};
