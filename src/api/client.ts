const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export function apiUrl(path: string): string {
	return `${API_BASE_URL}${path}`;
}

export class ApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

export function errorMessage(error: unknown, fallback: string): string {
	return error instanceof ApiError ? error.message : fallback;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
	const response = await fetch(apiUrl(path), init);
	if (response.ok) {
		return response;
	}
	const body = await response.json().catch(() => null);
	throw new ApiError(body?.detail ?? `Erro ${response.status}`, response.status);
}

async function sendJson<T>(method: "POST" | "PUT", path: string, body: unknown): Promise<T> {
	const response = await request(path, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return response.status === 204 ? (undefined as T) : response.json();
}

export async function apiPostForBlob(path: string, body: unknown): Promise<Blob> {
	const response = await request(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return response.blob();
}

export async function apiGet<T>(path: string): Promise<T> {
	return (await request(path)).json();
}

export async function apiGetOptional<T>(path: string): Promise<T | null> {
	const response = await request(path);
	return response.status === 204 ? null : response.json();
}

export function apiPostJson<T>(path: string, body: unknown): Promise<T> {
	return sendJson("POST", path, body);
}

export function apiPutJson<T>(path: string, body: unknown): Promise<T> {
	return sendJson("PUT", path, body);
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
	return (await request(path, { method: "POST", body: form })).json();
}

export async function apiPut(path: string): Promise<void> {
	await request(path, { method: "PUT" });
}

export async function apiDelete(path: string): Promise<void> {
	await request(path, { method: "DELETE" });
}

export async function apiDownload(path: string): Promise<{ blob: Blob; fileName: string }> {
	const response = await request(path);
	const disposition = response.headers.get("Content-Disposition") ?? "";
	const match = /filename="?([^"]+)"?/.exec(disposition);
	const fileName = match ? match[1] : "arquivo";
	return { blob: await response.blob(), fileName };
}
