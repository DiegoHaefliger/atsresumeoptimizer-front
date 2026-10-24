import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPostJson } from "../api/client";
import type { JobSuggestion, PromotedJob, SuggestionCount } from "../api/types";

const SUGGESTIONS_PATH = "/api/v1/job-suggestions";

export function useNewSuggestionCount() {
	const [count, setCount] = useState(0);

	const reload = useCallback(() => {
		apiGet<SuggestionCount>(`${SUGGESTIONS_PATH}/count`)
			.then((loaded) => setCount(loaded.count ?? 0))
			.catch(() => setCount(0));
	}, []);

	useEffect(reload, [reload]);

	return { count, reload };
}

type Loaded = { path: string; items: JobSuggestion[] };

export type SuggestionView = "new" | "below" | "discarded";

const VIEW_PATHS: Record<SuggestionView, string> = {
	new: SUGGESTIONS_PATH,
	below: `${SUGGESTIONS_PATH}/below-adherence`,
	discarded: `${SUGGESTIONS_PATH}/discarded`,
};

export function useJobSuggestions(view: SuggestionView) {
	const [loaded, setLoaded] = useState<Loaded | null>(null);
	const [failed, setFailed] = useState(false);
	const path = VIEW_PATHS[view];
	const suggestions = loaded?.path === path ? loaded.items : null;

	const reload = useCallback(() => {
		apiGet<JobSuggestion[]>(path)
			.then((items) => {
				setFailed(false);
				setLoaded({ path, items });
			})
			.catch(() => setFailed(true));
	}, [path]);

	useEffect(reload, [reload]);

	const remove = useCallback((id: string) => {
		setLoaded((current) => (current ? { ...current, items: current.items.filter((item) => item.id !== id) } : current));
	}, []);

	const promote = useCallback(
		async (id: string) => {
			const promoted = await apiPostJson<PromotedJob>(`${SUGGESTIONS_PATH}/${id}/promote`, {});
			remove(id);
			return promoted.jobId;
		},
		[remove],
	);

	const decide = useCallback(
		async (id: string, action: "discard" | "restore") => {
			await apiPostJson<JobSuggestion>(`${SUGGESTIONS_PATH}/${id}/${action}`, {});
			remove(id);
		},
		[remove],
	);

	return { suggestions, failed, reload, promote, decide };
}
