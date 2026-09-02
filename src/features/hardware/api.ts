import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CpuDetail,
  CpuListItem,
  CreateCpuPayload,
  CreateGpuPayload,
  GpuDetail,
  GpuListItem,
  HardwareListQuery,
  PaginatedResult,
  UpdateCpuPayload,
  UpdateGpuPayload,
} from "./types";

function toQueryParams(query: HardwareListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    q: query.q,
    vendor: query.vendor,
    formFactor: query.formFactor,
    quality: query.quality,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

export function fetchAdminCpus(query: HardwareListQuery) {
  return apiGet<PaginatedResult<CpuListItem>>(
    "/admin/hardware/cpus",
    toQueryParams(query),
  );
}

export function fetchAdminGpus(query: HardwareListQuery) {
  return apiGet<PaginatedResult<GpuListItem>>(
    "/admin/hardware/gpus",
    toQueryParams(query),
  );
}

export function fetchAdminCpu(id: string) {
  return apiGet<CpuDetail>(`/admin/hardware/cpus/${id}`);
}

export function createAdminCpu(payload: CreateCpuPayload) {
  return apiPost<CpuDetail>("/admin/hardware/cpus", payload);
}

export function fetchAdminGpu(id: string) {
  return apiGet<GpuDetail>(`/admin/hardware/gpus/${id}`);
}

export function createAdminGpu(payload: CreateGpuPayload) {
  return apiPost<GpuDetail>("/admin/hardware/gpus", payload);
}

export function updateAdminCpu(id: string, payload: UpdateCpuPayload) {
  return apiPatch<CpuDetail>(`/admin/hardware/cpus/${id}`, payload);
}

export function updateAdminGpu(id: string, payload: UpdateGpuPayload) {
  return apiPatch<GpuDetail>(`/admin/hardware/gpus/${id}`, payload);
}

export function deleteAdminCpu(id: string) {
  return apiDelete<{ id: string }>(`/admin/hardware/cpus/${id}`);
}

export function deleteAdminGpu(id: string) {
  return apiDelete<{ id: string }>(`/admin/hardware/gpus/${id}`);
}
