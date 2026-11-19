import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "../../api/client";
import type { LinkedInSnapshotSummaryResponse } from "../../api/linkedinTypes";

const SNAPSHOTS_PATH = "/api/v1/linkedin/snapshots";
const CHOOSABLE_SOURCES = ["EXTENSION", "PDF"] as const;

export type Reading = LinkedInSnapshotSummaryResponse;

export function lastReadings(history: LinkedInSnapshotSummaryResponse[]): Reading[] {
	const latest = CHOOSABLE_SOURCES.flatMap((source) => {
		const newest = history
			.filter((item) => item.source === source)
			.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())[0];
		return newest ? [newest] : [];
	});
	return latest.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
}

export function useReadings() {
	const [readings, setReadings] = useState<Reading[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const signature = useRef("");

	const reload = useCallback(async () => {
		try {
			const next = lastReadings(await apiGet<LinkedInSnapshotSummaryResponse[]>(SNAPSHOTS_PATH));
			const nextSignature = next.map((item) => `${item.id}@${item.capturedAt}`).join("|");
			setFailed(false);
			setReadings(next);
			if (signature.current !== nextSignature) {
				signature.current = nextSignature;
				setSelectedId(next[0]?.id ?? null);
			}
		} catch {
			setFailed(true);
			setReadings([]);
		}
	}, []);

	useEffect(() => {
		void reload();
	}, [reload]);

	const selected = readings.find((item) => item.id === selectedId) ?? readings[0] ?? null;
	return { readings, selected, failed, select: setSelectedId, reload };
}
