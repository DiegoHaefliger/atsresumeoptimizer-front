const DISMISSED_UPDATE_KEY = "ats-dismissed-update";

export function dismissedUpdate(): string | null {
	try {
		return localStorage.getItem(DISMISSED_UPDATE_KEY);
	} catch {
		return null;
	}
}

export function dismissUpdate(version: string) {
	try {
		localStorage.setItem(DISMISSED_UPDATE_KEY, version);
	} catch {
		return;
	}
}
