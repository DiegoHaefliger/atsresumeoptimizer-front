import { Navigate, useParams } from "react-router-dom";
import type { SelectionProcess } from "../api/types";
import { StateMessage } from "../components/StateMessage";
import { PROCESSES_PATH } from "../lib/processPath";
import { useApiResource } from "../lib/useApiResource";

export function ProcessRedirectPage() {
	const { processId } = useParams<{ processId: string }>();
	const { data: process, failed } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${processId}`);

	if (failed) {
		return (
			<div className="page">
				<StateMessage
					variant="error"
					layout="page"
					message="Esse processo não existe mais."
					action={{ label: "Ver vagas", to: "/jobs" }}
				/>
			</div>
		);
	}
	return process ? <Navigate to={`/jobs/${process.jobPostingId}/process`} replace /> : null;
}
