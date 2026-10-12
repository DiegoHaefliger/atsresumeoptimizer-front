import type { ResumeSummary } from "../api/types";
import { versionLabel } from "./resumeLabels";

export type ResumeVersionOption = {
	versionId: string;
	label: string;
};

export function resumeVersionOptions(resumes: ResumeSummary[]): ResumeVersionOption[] {
	return resumes.flatMap((resume) =>
		(resume.versions ?? [])
			.filter((version) => version.id)
			.map((version) => ({ versionId: version.id ?? "", label: `${resume.title ?? "Currículo"} · ${versionLabel(version)}` })),
	);
}

export function resumeLabelOf(options: ResumeVersionOption[], versionId: string | null): string | null {
	if (!versionId) {
		return null;
	}
	return options.find((option) => option.versionId === versionId)?.label ?? "Currículo excluído";
}
