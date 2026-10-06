import type { SelectionProcess, SelectionStage } from "../api/types";

export type ProcessDraft = {
	jobPostingId: string;
	processUrl: string;
	stage: SelectionStage;
	appliedOn: string;
	nextStepOn: string;
	contactName: string;
	contactEmail: string;
	salary: string;
	notes: string;
};

export const EMPTY_PROCESS: ProcessDraft = {
	jobPostingId: "",
	processUrl: "",
	stage: "INTERESTED",
	appliedOn: "",
	nextStepOn: "",
	contactName: "",
	contactEmail: "",
	salary: "",
	notes: "",
};

export function draftFromProcess(process: SelectionProcess): ProcessDraft {
	return {
		jobPostingId: process.jobPostingId,
		processUrl: process.processUrl ?? "",
		stage: process.stage,
		appliedOn: process.appliedOn ?? "",
		nextStepOn: process.nextStepOn ?? "",
		contactName: process.contactName ?? "",
		contactEmail: process.contactEmail ?? "",
		salary: process.salary != null ? String(process.salary) : "",
		notes: process.notes ?? "",
	};
}

export function processRequest(draft: ProcessDraft) {
	const salary = draft.salary.trim() === "" ? Number.NaN : Number(draft.salary);
	return {
		jobPostingId: draft.jobPostingId,
		processUrl: draft.processUrl.trim() || undefined,
		stage: draft.stage,
		appliedOn: draft.appliedOn || undefined,
		nextStepOn: draft.nextStepOn || undefined,
		contactName: draft.contactName.trim() || undefined,
		contactEmail: draft.contactEmail.trim() || undefined,
		salary: Number.isFinite(salary) ? salary : undefined,
		notes: draft.notes.trim() || undefined,
	};
}
