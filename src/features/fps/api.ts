import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CalibrateFpsResult,
  CreateFpsSamplesPayload,
  CreateFpsSamplesResult,
  FpsSampleListItem,
  FpsSampleListQuery,
  PaginatedResult,
  UpdateFpsSamplePayload,
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

export function createAdminFpsSamples(payload: CreateFpsSamplesPayload) {
  return apiPost<CreateFpsSamplesResult>("/admin/fps-samples", payload);
}

export function updateAdminFpsSample(
  id: string,
  payload: UpdateFpsSamplePayload,
) {
  return apiPatch<FpsSampleListItem>(`/admin/fps-samples/${id}`, payload);
}

export function deleteAdminFpsSample(id: string) {
  return apiDelete<{ id: string }>(`/admin/fps-samples/${id}`);
}

export function calibrateAdminFpsSamples(params?: { gameId?: string }) {
  return apiPost<CalibrateFpsResult>("/admin/fps-samples/calibrate", {
    gameId: params?.gameId,
  });
}
