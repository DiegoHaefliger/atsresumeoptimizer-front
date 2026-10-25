import { useCallback, useState } from "react";

const STORAGE_KEY = "job-search:dismissed-run";

function readDismissed(): string | null {
	try {
		return window.localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

export function useDismissedRun(runId: string | undefined) {
	const [dismissed, setDismissed] = useState<string | null>(readDismissed);

	const dismiss = useCallback(() => {
		if (!runId) {
			return;
		}
		setDismissed(runId);
		try {
			window.localStorage.setItem(STORAGE_KEY, runId);
		} catch {
			return;
		}
	}, [runId]);

	return { isDismissed: runId !== undefined && dismissed === runId, dismiss };
}
