export type CuratedKind = "game" | "cpu" | "gpu";

export interface CuratedGameEntity {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
}

export interface CuratedHardwareEntity {
  id: string;
  slug: string;
  name: string;
  vendor: string;
}

export interface CuratedTopGameItem {
  id: string;
  gameId: string;
  sortOrder: number;
  createdAt: string;
  game: CuratedGameEntity;
}

export interface CuratedTopCpuItem {
  id: string;
  cpuId: string;
  sortOrder: number;
  createdAt: string;
  cpu: CuratedHardwareEntity;
}

export interface CuratedTopGpuItem {
  id: string;
  gpuId: string;
  sortOrder: number;
  createdAt: string;
  gpu: CuratedHardwareEntity;
}

export interface CuratedListResult<T> {
  items: T[];
}
