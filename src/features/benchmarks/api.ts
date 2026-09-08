import { apiGet } from "@/lib/api-client";
import type {
  BenchmarkListItem,
  BenchmarkListQuery,
  BenchmarkScoreListItem,
  BenchmarkScoreListQuery,
  PaginatedResult,
} from "./types";

function toDefinitionParams(query: BenchmarkListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    q: query.q,
    target: query.target,
    isActive: query.isActive,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

function toScoreParams(query: BenchmarkScoreListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    q: query.q,
    source: query.source,
    benchmarkSlug: query.benchmarkSlug,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

export function fetchAdminBenchmarks(query: BenchmarkListQuery) {
  return apiGet<PaginatedResult<BenchmarkListItem>>(
    "/admin/benchmarks",
    toDefinitionParams(query),
  );
}

export function fetchAdminCpuBenchmarkScores(query: BenchmarkScoreListQuery) {
  return apiGet<PaginatedResult<BenchmarkScoreListItem>>(
    "/admin/benchmarks/cpu-scores",
    toScoreParams(query),
  );
}

export function fetchAdminGpuBenchmarkScores(query: BenchmarkScoreListQuery) {
  return apiGet<PaginatedResult<BenchmarkScoreListItem>>(
    "/admin/benchmarks/gpu-scores",
    toScoreParams(query),
  );
}
