import { useCallback, useMemo } from "react";
import { apiDelete } from "../api/client";
import type { RecentJobView } from "../api/types";
import { useApiResource } from "./useApiResource";

export type Job = RecentJobView & { id: string };

const RECENT_JOBS_PATH = "/api/v1/analyses/recent-jobs";

export function useJobs() {
	const { data, setData, failed, reload } = useApiResource<RecentJobView[]>(RECENT_JOBS_PATH);
	const jobs = useMemo(() => data?.filter((job): job is Job => Boolean(job.id)) ?? null, [data]);

	const remove = useCallback(
		async (jobId: string) => {
			try {
				await apiDelete(`${RECENT_JOBS_PATH}/${jobId}`);
				setData((current) => (current ?? []).filter((job) => job.id !== jobId));
			} catch {
				reload();
			}
		},
		[reload, setData],
	);

	return { jobs, failed, reload, remove };
}
