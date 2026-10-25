import type { ResumeSummary } from "../api/types";
import type { SavedResumeSelection } from "../components/SavedResumePicker";

export function initialSelection(baseResumes: ResumeSummary[], preferredResumeId?: string): SavedResumeSelection | null {
	const resume = baseResumes.find((candidate) => candidate.id === preferredResumeId) ?? baseResumes[0];
	const versionId = resume?.versions?.[0]?.id;
	return resume?.id && versionId ? { resumeId: resume.id, versionId } : null;
}
