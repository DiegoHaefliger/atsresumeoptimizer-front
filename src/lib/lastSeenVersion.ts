const LAST_SEEN_VERSION_KEY = "ats-last-seen-version";

export function lastSeenVersion(): string | null {
	try {
		return localStorage.getItem(LAST_SEEN_VERSION_KEY);
	} catch {
		return null;
	}
}

export function markVersionSeen(version: string) {
	try {
		localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
	} catch {
		return;
	}
}
