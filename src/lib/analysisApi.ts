import { apiPostJson } from "../api/client";
import type { AnalysisCreatedResponse } from "../api/types";
import type { SavedResumeSelection } from "../components/SavedResumePicker";

export type AnalysisTarget = { jobId: string } | { targetRole?: string };

export async function startAnalysis(selection: SavedResumeSelection, target: AnalysisTarget): Promise<string> {
	const created = await apiPostJson<AnalysisCreatedResponse>(`/api/v1/resumes/${selection.resumeId}/analyses`, {
		resumeVersionId: selection.versionId,
		...target,
	});
	if (!created.id) {
		throw new Error("Análise criada sem id.");
	}
	return created.id;
}
