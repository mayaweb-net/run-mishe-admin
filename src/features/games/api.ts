import { apiDelete, apiGet, apiPatch, apiPost, ApiError, buildApiUrl } from "@/lib/api-client";
import type {
  ApplyRequirementMatchesPayload,
  CreateGamePayload,
  GameDetail,
  GameListItem,
  GameListQuery,
  PaginatedResult,
  RequirementFieldSuggestions,
  UnmatchedRequirementsReport,
  UpdateGamePayload,
} from "./types";

function toQueryParams(query: GameListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    q: query.q,
    demandTier: query.demandTier,
    isPopular:
      query.isPopular === undefined ? undefined : query.isPopular ? "true" : "false",
    isPublished:
      query.isPublished === undefined
        ? undefined
        : query.isPublished
          ? "true"
          : "false",
    quality: query.quality,
    reviewStatus: query.reviewStatus,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

export function fetchAdminGames(query: GameListQuery) {
  return apiGet<PaginatedResult<GameListItem>>(
    "/admin/games",
    toQueryParams(query),
  );
}

export function fetchAdminGame(id: string) {
  return apiGet<GameDetail>(`/admin/games/${id}`);
}

export function createAdminGame(payload: CreateGamePayload) {
  return apiPost<GameDetail>("/admin/games", payload);
}

export function updateAdminGame(id: string, payload: UpdateGamePayload) {
  return apiPatch<GameDetail>(`/admin/games/${id}`, payload);
}

export function deleteAdminGame(id: string) {
  return apiDelete<{ id: string }>(`/admin/games/${id}`);
}

export function fetchRequirementSuggestions(gameId: string) {
  return apiGet<RequirementFieldSuggestions[]>(
    `/admin/games/${gameId}/requirement-suggestions`,
  );
}

export function applyRequirementMatches(
  gameId: string,
  payload: ApplyRequirementMatchesPayload,
) {
  return apiPost<GameDetail>(
    `/admin/games/${gameId}/apply-requirement-matches`,
    payload,
  );
}

export function fetchUnmatchedRequirementsReport() {
  return apiGet<UnmatchedRequirementsReport>(
    "/admin/games/unmatched-requirements-report",
  );
}

export async function downloadUnmatchedRequirementsReport() {
  const response = await fetch(
    buildApiUrl("/admin/games/unmatched-requirements-report", { format: "csv" }),
  );

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      body,
    );
  }

  const blob = await response.blob();
  const date = new Date().toISOString().slice(0, 10);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `unmatched-requirements-${date}.csv`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
