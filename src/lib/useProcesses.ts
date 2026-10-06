import { useCallback } from "react";
import { apiDelete, apiPostJson } from "../api/client";
import type { SelectionProcess, SelectionStage } from "../api/types";
import { useApiResource } from "./useApiResource";

export const PROCESSES_PATH = "/api/v1/selection-processes";

export function useProcesses() {
	const { data, setData, failed, reload } = useApiResource<SelectionProcess[]>(PROCESSES_PATH);

	const moveStage = useCallback(
		async (processId: string, stage: SelectionStage, note: string) => {
			const moved = await apiPostJson<SelectionProcess>(`${PROCESSES_PATH}/${processId}/stage`, {
				stage,
				note: note.trim() || undefined,
			});
			setData((current) => (current ?? []).map((process) => (process.id === processId ? moved : process)));
		},
		[setData],
	);

	const remove = useCallback(
		async (processId: string) => {
			try {
				await apiDelete(`${PROCESSES_PATH}/${processId}`);
				setData((current) => (current ?? []).filter((process) => process.id !== processId));
			} catch {
				reload();
			}
		},
		[reload, setData],
	);

	return { processes: data, failed, reload, moveStage, remove };
}
