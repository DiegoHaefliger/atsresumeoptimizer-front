import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPostJson } from "../api/client";
import type { JobSuggestion, JobSuggestionPage, PromotedJob, SuggestionCount } from "../api/types";
import { suggestionSearchParams, type SuggestionPageRequest } from "./suggestionFilters";

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

type Loaded = { view: SuggestionView; key: string; page: JobSuggestionPage };

export type SuggestionView = "new" | "below" | "discarded";

const VIEW_PATHS: Record<SuggestionView, string> = {
	new: SUGGESTIONS_PATH,
	below: `${SUGGESTIONS_PATH}/below-adherence`,
	discarded: `${SUGGESTIONS_PATH}/discarded`,
};

export function useJobSuggestions(view: SuggestionView, request: SuggestionPageRequest) {
	const [loaded, setLoaded] = useState<Loaded | null>(null);
	const [failed, setFailed] = useState(false);
	const key = `${VIEW_PATHS[view]}?${suggestionSearchParams(request)}`;
	const page = loaded?.view === view ? loaded.page : null;
	const loading = loaded?.key !== key;

	const reload = useCallback(() => {
		let current = true;
		apiGet<JobSuggestionPage>(key)
			.then((loadedPage) => {
				if (current) {
					setFailed(false);
					setLoaded({ view, key, page: loadedPage });
				}
			})
			.catch(() => current && setFailed(true));
		return () => {
			current = false;
		};
	}, [view, key]);

	useEffect(reload, [reload]);

	const promote = useCallback(async (id: string) => {
		const promoted = await apiPostJson<PromotedJob>(`${SUGGESTIONS_PATH}/${id}/promote`, {});
		return promoted.jobId;
	}, []);

	const decide = useCallback(async (id: string, action: "discard" | "restore") => {
		await apiPostJson<JobSuggestion>(`${SUGGESTIONS_PATH}/${id}/${action}`, {});
	}, []);

	return { page, loading, failed, reload, promote, decide };
}
