import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import type {
  CuratedListResult,
  CuratedTopCpuItem,
  CuratedTopGameItem,
  CuratedTopGpuItem,
} from "./types";

export function fetchAdminCuratedGames() {
  return apiGet<CuratedListResult<CuratedTopGameItem>>("/admin/curated/games");
}

export function addAdminCuratedGame(gameId: string) {
  return apiPost<CuratedTopGameItem>("/admin/curated/games", { gameId });
}

export function removeAdminCuratedGame(gameId: string) {
  return apiDelete<{ ok: true }>(`/admin/curated/games/${gameId}`);
}

export function reorderAdminCuratedGames(orderedIds: string[]) {
  return apiPut<CuratedListResult<CuratedTopGameItem>>(
    "/admin/curated/games/order",
    { orderedIds },
  );
}

export function fetchAdminCuratedCpus() {
  return apiGet<CuratedListResult<CuratedTopCpuItem>>("/admin/curated/cpus");
}

export function addAdminCuratedCpu(cpuId: string) {
  return apiPost<CuratedTopCpuItem>("/admin/curated/cpus", { cpuId });
}

export function removeAdminCuratedCpu(cpuId: string) {
  return apiDelete<{ ok: true }>(`/admin/curated/cpus/${cpuId}`);
}

export function reorderAdminCuratedCpus(orderedIds: string[]) {
  return apiPut<CuratedListResult<CuratedTopCpuItem>>(
    "/admin/curated/cpus/order",
    { orderedIds },
  );
}

export function fetchAdminCuratedGpus() {
  return apiGet<CuratedListResult<CuratedTopGpuItem>>("/admin/curated/gpus");
}

export function addAdminCuratedGpu(gpuId: string) {
  return apiPost<CuratedTopGpuItem>("/admin/curated/gpus", { gpuId });
}

export function removeAdminCuratedGpu(gpuId: string) {
  return apiDelete<{ ok: true }>(`/admin/curated/gpus/${gpuId}`);
}

export function reorderAdminCuratedGpus(orderedIds: string[]) {
  return apiPut<CuratedListResult<CuratedTopGpuItem>>(
    "/admin/curated/gpus/order",
    { orderedIds },
  );
}
