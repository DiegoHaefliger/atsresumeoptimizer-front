import type { ResumeSummary } from "../api/types";
import type { SavedResumeSelection } from "../components/SavedResumePicker";
import { splitByOrigin } from "./resumeLabels";

export function initialSelection(resumes: ResumeSummary[], preferredResumeId?: string): SavedResumeSelection | null {
	const resume =
		resumes.find((candidate) => candidate.id === preferredResumeId) ?? splitByOrigin(resumes).base[0] ?? resumes[0];
	const versionId = resume?.versions?.[0]?.id;
	return resume?.id && versionId ? { resumeId: resume.id, versionId } : null;
}
