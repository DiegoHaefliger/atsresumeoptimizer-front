import { useApiResource } from "./useApiResource";
import type { JobCostResponse } from "../api/types";

export function useJobCost(jobId: string) {
	const { data, failed, reload } = useApiResource<JobCostResponse>(`/api/v1/jobs/${jobId}/cost`);
	return { cost: data, failed, reload };
}
