const DEFAULT_API_BASE_URL = "http://localhost:4002/api";

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function getApiBaseUrl() {
  const base = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return base.endsWith("/") ? base : `${base}/`;
}

export function buildApiUrl(path: string, params?: Record<string, string | number | undefined>) {
  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(normalizedPath, getApiBaseUrl());

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await fetch(buildApiUrl(path, params));

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

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = undefined;
    }

    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      errorBody,
    );
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = undefined;
    }

    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      errorBody,
    );
  }

  return response.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), { method: "DELETE" });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = undefined;
    }

    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      errorBody,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
