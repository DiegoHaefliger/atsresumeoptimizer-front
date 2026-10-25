import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPostJson } from "../api/client";
import type { JobSuggestion, PromotedJob, SuggestionCount } from "../api/types";

const SUGGESTIONS_PATH = "/api/v1/job-suggestions";

export type SuggestionCounts = { newSuggestions: number; belowAdherence: number; discarded: number };

const NO_SUGGESTIONS: SuggestionCounts = { newSuggestions: 0, belowAdherence: 0, discarded: 0 };

export function useSuggestionCounts() {
	const [counts, setCounts] = useState<SuggestionCounts>(NO_SUGGESTIONS);

	const reload = useCallback(() => {
		apiGet<SuggestionCount>(`${SUGGESTIONS_PATH}/count`)
			.then((loaded) =>
				setCounts({
					newSuggestions: loaded.newSuggestions ?? 0,
					belowAdherence: loaded.belowAdherence ?? 0,
					discarded: loaded.discarded ?? 0,
				}),
			)
			.catch(() => setCounts(NO_SUGGESTIONS));
	}, []);

	useEffect(reload, [reload]);

	return { counts, reload };
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
