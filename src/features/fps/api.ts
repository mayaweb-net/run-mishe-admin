import { apiGet } from "@/lib/api-client";
import type {
  FpsSampleListItem,
  FpsSampleListQuery,
  PaginatedResult,
} from "./types";

function toParams(query: FpsSampleListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    q: query.q,
    gameId: query.gameId,
    gpuId: query.gpuId,
    source: query.source,
    resolution: query.resolution,
    preset: query.preset,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

export function fetchAdminFpsSamples(query: FpsSampleListQuery) {
  return apiGet<PaginatedResult<FpsSampleListItem>>(
    "/admin/fps-samples",
    toParams(query),
  );
}
