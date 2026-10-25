import type { BadgeTone } from "../components/Badge";
import type { ContractType, MatchStatus, PostedWithin, PreferenceCriterion, SearchSite, WorkModel } from "../api/types";

export const SEARCH_SITE_LABELS: Record<SearchSite, string> = {
	LINKEDIN: "LinkedIn",
	GUPY: "Gupy",
	PROGRAMATHOR: "Programathor",
	INFOJOBS: "InfoJobs",
	VAGAS: "Vagas.com",
	REMOTAR: "Remotar",
};

export const WORK_MODEL_LABELS: Record<WorkModel, string> = {
	REMOTE: "Remoto",
	HYBRID: "Híbrido",
	ON_SITE: "Presencial",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
	CLT: "CLT",
	PJ: "PJ",
	INTERNSHIP: "Estágio",
	TEMPORARY: "Temporário",
};

const CRITERION_LABELS: Record<PreferenceCriterion, string> = {
	WORK_MODEL: "Modelo de trabalho",
	SALARY: "Remuneração",
	CONTRACT_TYPE: "Tipo de contrato",
	BENEFITS: "Benefícios",
	COMPANY: "Empresa",
	SENIORITY: "Senioridade",
	LOCATION: "Localização",
	KEYWORDS: "Cargos e palavras-chave",
};

const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
	MATCH: "Atende",
	PARTIAL: "Atende em parte",
	UNKNOWN: "Sem informação",
	MISMATCH: "Não atende",
};

const MATCH_STATUS_TONES: Record<MatchStatus, BadgeTone> = {
	MATCH: "success",
	PARTIAL: "warning",
	UNKNOWN: "neutral",
	MISMATCH: "error",
};

export function workModelLabel(workModel: WorkModel): string {
	return WORK_MODEL_LABELS[workModel] ?? workModel;
}

export function criterionLabel(criterion: PreferenceCriterion): string {
	return CRITERION_LABELS[criterion] ?? criterion;
}

export function matchStatusLabel(status: MatchStatus): string {
	return MATCH_STATUS_LABELS[status] ?? status;
}

export function matchStatusTone(status: MatchStatus): BadgeTone {
	return MATCH_STATUS_TONES[status] ?? "neutral";
}

export const SENIORITY_OPTIONS = ["Júnior", "Pleno", "Sênior", "Especialista", "Tech Lead"] as const;

export const BENEFIT_OPTIONS = [
	"Plano de saúde",
	"Plano odontológico",
	"Seguro de vida",
	"Previdência privada",
	"Auxílio farmácia",
	"Auxílio psicológico",
	"Gympass",
	"Vale refeição",
	"Vale alimentação",
	"Cartão flexível",
	"Clube de descontos",
	"PLR",
	"Bônus",
	"Stock options",
	"13º salário",
	"Salário em dólar",
	"Auxílio home office",
	"Auxílio coworking",
	"Equipamento fornecido",
	"Horário flexível",
	"Short Friday",
	"Semana de 4 dias",
	"Day off no aniversário",
	"Férias remuneradas extras",
	"Licença parental estendida",
	"Auxílio creche",
	"Auxílio pet",
	"Auxílio funeral",
	"Auxílio educação",
	"Curso de idiomas",
	"Plano de carreira",
	"Mentoria",
	"Vale transporte",
	"Fretado",
	"Auxílio combustível",
	"Estacionamento",
] as const;

export function matchingOption(options: readonly string[], value: string): string | undefined {
	return options.find((option) => option.localeCompare(value, "pt-BR", { sensitivity: "base" }) === 0);
}

export const POSTED_WITHIN_LABELS: Record<PostedWithin, string> = {
	ANY: "Qualquer data",
	PAST_HOUR: "Última hora",
	PAST_2_HOURS: "Últimas 2 horas",
	PAST_6_HOURS: "Últimas 6 horas",
	PAST_12_HOURS: "Últimas 12 horas",
	PAST_24_HOURS: "Últimas 24 horas",
	PAST_WEEK: "Últimos 7 dias",
	PAST_MONTH: "Últimos 30 dias",
};
