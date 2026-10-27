import type { CareerProfileRequest, CareerProfileResponse, ProfileTone } from "../api/linkedinTypes";

export type CareerForm = {
	areaOfExpertise: string;
	currentJobTitle: string;
	currentSeniority: string;
	targetJobTitle: string;
	targetSeniority: string;
	targetTimeframe: string;
	targetIndustries: string[];
	targetCompanies: string[];
	location: string;
	languages: string[];
	strengths: string[];
	differentiators: string;
	tone: ProfileTone;
	profileLanguage: string;
	notes: string;
};

export const EMPTY_CAREER_FORM: CareerForm = {
	areaOfExpertise: "",
	currentJobTitle: "",
	currentSeniority: "",
	targetJobTitle: "",
	targetSeniority: "",
	targetTimeframe: "",
	targetIndustries: [],
	targetCompanies: [],
	location: "",
	languages: [],
	strengths: [],
	differentiators: "",
	tone: "TECHNICAL",
	profileLanguage: "pt-BR",
	notes: "",
};

export const TONE_LABELS: Record<ProfileTone, string> = {
	TECHNICAL: "Técnico",
	EXECUTIVE: "Executivo",
	CONSULTATIVE: "Consultivo",
	CREATIVE: "Criativo",
};

export const PROFILE_LANGUAGE_LABELS: Record<string, string> = {
	"pt-BR": "Português",
	en: "Inglês",
	es: "Espanhol",
};

export const TIMEFRAME_OPTIONS = ["Em até 6 meses", "De 6 a 12 meses", "De 1 a 2 anos", "Mais de 2 anos"] as const;

export function toCareerForm(profile: CareerProfileResponse): CareerForm {
	return {
		areaOfExpertise: profile.areaOfExpertise ?? "",
		currentJobTitle: profile.currentJobTitle ?? "",
		currentSeniority: profile.currentSeniority ?? "",
		targetJobTitle: profile.targetJobTitle ?? "",
		targetSeniority: profile.targetSeniority ?? "",
		targetTimeframe: profile.targetTimeframe ?? "",
		targetIndustries: profile.targetIndustries ?? [],
		targetCompanies: profile.targetCompanies ?? [],
		location: profile.location ?? "",
		languages: profile.languages ?? [],
		strengths: profile.strengths ?? [],
		differentiators: profile.differentiators ?? "",
		tone: profile.tone ?? "TECHNICAL",
		profileLanguage: profile.profileLanguage ?? "pt-BR",
		notes: profile.notes ?? "",
	};
}

function optional(value: string): string | undefined {
	const trimmed = value.trim();
	return trimmed === "" ? undefined : trimmed;
}

export function toCareerRequest(form: CareerForm): CareerProfileRequest {
	return {
		areaOfExpertise: form.areaOfExpertise.trim(),
		currentJobTitle: optional(form.currentJobTitle),
		currentSeniority: optional(form.currentSeniority),
		targetJobTitle: form.targetJobTitle.trim(),
		targetSeniority: optional(form.targetSeniority),
		targetTimeframe: optional(form.targetTimeframe),
		targetIndustries: form.targetIndustries,
		targetCompanies: form.targetCompanies,
		location: optional(form.location),
		languages: form.languages,
		strengths: form.strengths,
		differentiators: optional(form.differentiators),
		tone: form.tone,
		profileLanguage: form.profileLanguage,
		notes: optional(form.notes),
	};
}

export function isSameCareerForm(a: CareerForm, b: CareerForm): boolean {
	return JSON.stringify(toCareerRequest(a)) === JSON.stringify(toCareerRequest(b));
}

export function missingCareerFields(form: CareerForm): string[] {
	const missing: string[] = [];
	if (form.areaOfExpertise.trim() === "") {
		missing.push("área de atuação");
	}
	if (form.targetJobTitle.trim() === "") {
		missing.push("próximo cargo desejado");
	}
	return missing;
}
