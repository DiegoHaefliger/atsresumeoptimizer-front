const MARKER_PATTERN = /\{\{\s*[\w.]+\s*\}\}/g;

export function markersOf(text: string): string[] {
	return [...new Set((text.match(MARKER_PATTERN) ?? []).map((marker) => marker.replace(/\s+/g, "")))];
}

export function missingMarkers(original: string, current: string): string[] {
	const present = new Set(markersOf(current));
	return markersOf(original).filter((marker) => !present.has(marker));
}
