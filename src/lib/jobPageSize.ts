const STORAGE_KEY = "job-page-size";

export function loadPageSize(options: readonly number[], fallback: number): number {
	try {
		const stored = Number(sessionStorage.getItem(STORAGE_KEY));
		return options.includes(stored) ? stored : fallback;
	} catch {
		return fallback;
	}
}

export function savePageSize(pageSize: number): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, String(pageSize));
	} catch {
		return;
	}
}
