import { ApiError } from "./errors";

const API_BASE_URL = import.meta.env.VITE_TRANSIT_API_URL?.replace(/\/$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_TRANSIT_API_URL wajib diisi di environment variables");
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response) {
  try {
    const body = await response.json() as { detail?: string };
    return body.detail || `Request gagal (${response.status})`;
  } catch {
    return `Request gagal (${response.status})`;
  }
}
