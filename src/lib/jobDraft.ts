import type { ContractType, WorkModel } from "../api/types";

export type JobDraft = {
	title: string;
	seniority: string;
	contractType: ContractType | "";
	text: string;
	company: string;
	sourceUrl: string;
	workModel: WorkModel | "";
	interviewUrl: string;
	salary: string;
	benefits: string;
	companyInfo: string;
};

export const EMPTY_JOB: JobDraft = {
	title: "",
	seniority: "",
	contractType: "",
	text: "",
	company: "",
	sourceUrl: "",
	workModel: "",
	interviewUrl: "",
	salary: "",
	benefits: "",
	companyInfo: "",
};

const BENEFIT_LINE_SEPARATOR = /\n+/;
const BENEFIT_INLINE_SEPARATOR = /[,;]+/;
const LIST_MARKER = /^(?:[-•]\s+|\d+[.)]\s+)/;
const SEPARATOR_LINE = "---";

export function benefitsFromText(text: string): string[] {
	const separator = text.includes("\n") ? BENEFIT_LINE_SEPARATOR : BENEFIT_INLINE_SEPARATOR;
	return text
		.split(separator)
		.map((benefit) => benefit.trim().replace(LIST_MARKER, "").trim())
		.filter((benefit) => benefit !== "" && benefit !== SEPARATOR_LINE);
}

export function benefitsToText(benefits: string[] | undefined): string {
	return (benefits ?? []).map((benefit) => `- ${benefit}`).join("\n");
}

export function jobRequest(draft: JobDraft) {
	const salary = draft.salary.trim() === "" ? Number.NaN : Number(draft.salary);
	return {
		text: draft.text.trim(),
		title: draft.title.trim() || undefined,
		seniority: draft.seniority || undefined,
		contractType: draft.contractType || undefined,
		company: draft.company.trim() || undefined,
		sourceUrl: draft.sourceUrl.trim() || undefined,
		workModel: draft.workModel || undefined,
		interviewUrl: draft.interviewUrl.trim() || undefined,
		salary: Number.isFinite(salary) ? salary : undefined,
		benefits: benefitsFromText(draft.benefits),
		companyInfo: draft.companyInfo.trim() || undefined,
	};
}
