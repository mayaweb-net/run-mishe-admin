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

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "PUT",
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

export type ApiUploadResult = {
  path: string;
  url: string;
};

export function apiUpload(
  path: string,
  file: File,
  fields: Record<string, string>,
  options?: {
    signal?: AbortSignal;
    onProgress?: (percent: number) => void;
  },
): Promise<ApiUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }

    xhr.open("POST", buildApiUrl(path));

    if (options?.signal) {
      if (options.signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      options.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }

    xhr.upload.onprogress = (event) => {
      if (!event.total || !options?.onProgress) return;
      options.onProgress(Math.round((event.loaded * 100) / event.total));
    };

    xhr.onload = () => {
      let body: unknown;
      try {
        body = JSON.parse(xhr.responseText) as unknown;
      } catch {
        body = undefined;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as ApiUploadResult);
        return;
      }

      reject(
        new ApiError(
          `Request failed with status ${xhr.status}`,
          xhr.status,
          body,
        ),
      );
    };

    xhr.onerror = () => {
      reject(new ApiError("Network error during upload", 0));
    };

    xhr.send(formData);
  });
}
