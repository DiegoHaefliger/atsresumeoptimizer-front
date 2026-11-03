import type { WorkModel } from "../api/types";

export type PostDateFilter = "past-24h" | "past-week" | "past-month" | "any";
export type PostLanguage = "any" | "pt" | "en" | "es";
export type PostSort = "date_posted" | "relevance";

export type PostSearch = {
	terms: string[];
	excluded: string[];
	blockedAuthors: string[];
	hiringOnly: boolean;
	language: PostLanguage;
	locations: string[];
	workModels: WorkModel[];
	datePosted: PostDateFilter;
	sortBy: PostSort;
};

export const EMPTY_POST_SEARCH: PostSearch = {
	terms: [],
	excluded: [],
	blockedAuthors: [],
	hiringOnly: true,
	language: "pt",
	locations: [],
	workModels: [],
	datePosted: "past-week",
	sortBy: "date_posted",
};

export const POST_DATE_LABELS: Record<PostDateFilter, string> = {
	"past-24h": "Últimas 24 horas",
	"past-week": "Última semana",
	"past-month": "Último mês",
	any: "Qualquer data",
};

export const POST_SORT_LABELS: Record<PostSort, string> = {
	date_posted: "Mais recentes",
	relevance: "Mais relevantes",
};

const LINKEDIN_POST_SEARCH = "https://www.linkedin.com/search/results/content/";
export const POST_LANGUAGE_LABELS: Record<PostLanguage, string> = {
	any: "Qualquer idioma",
	pt: "Português (PT/BR)",
	en: "Inglês",
	es: "Espanhol",
};

const HIRING_TERMS: Record<PostLanguage, string[]> = {
	any: ["contratando", "vaga", "hiring"],
	pt: ["contratando", "vaga", "oportunidade"],
	en: ["hiring", "job opening", "opportunity"],
	es: ["contratando", "vacante", "buscamos"],
};

// LinkedIn não tem filtro de idioma em postagens: palavras comuns de cada idioma aproximam o resultado
const LANGUAGE_MARKERS: Record<PostLanguage, string[]> = {
	any: [],
	pt: ["nossa", "equipe", "estamos"],
	en: ["our team", "we are", "join us"],
	es: ["nuestro", "equipo", "buscamos"],
};
const WORK_MODEL_TERMS: Record<WorkModel, string[]> = {
	REMOTE: ["remoto", "remote"],
	HYBRID: ["híbrido", "hybrid"],
	ON_SITE: ["presencial"],
};
// O LinkedIn zera a busca de postagens acima de 5 operadores (AND/OR/NOT), medido em testes reais
export const LINKEDIN_OPERATOR_LIMIT = 5;

function quote(term: string): string {
	return `"${term.replaceAll('"', "").trim()}"`;
}

// Frase exata quase nunca casa com cargos ("Desenvolvedor Java Sênior"): sem aspas o LinkedIn exige só as palavras
function loosely(term: string): string {
	return /\s/.test(term) ? `(${term})` : quote(term);
}

function anyOf(terms: string[], loose = false): string {
	const rendered = terms.map(loose ? loosely : quote);
	return rendered.length > 1 ? `(${rendered.join(" OR ")})` : (rendered[0] ?? "");
}

function clean(values: string[]): string[] {
	return values.map((value) => value.replaceAll('"', "").trim()).filter((value) => value.length > 0);
}

type QueryGroup = { items: string[]; negated?: boolean; loose?: boolean };

function queryGroups(search: PostSearch): QueryGroup[] {
	const languageTerms = search.hiringOnly ? HIRING_TERMS[search.language] : LANGUAGE_MARKERS[search.language];
	return [
		{ items: clean(search.terms), loose: true },
		{ items: languageTerms },
		{ items: [...clean(search.blockedAuthors), ...clean(search.excluded)], negated: true, loose: true },
		{ items: search.workModels.flatMap((model) => WORK_MODEL_TERMS[model]) },
		{ items: clean(search.locations), loose: true },
	].filter((group) => group.items.length > 0);
}

export function operatorCost(search: PostSearch): number {
	const groups = queryGroups(search);
	const positive = groups.filter((group) => !group.negated).length;
	const negated = groups.some((group) => group.negated) ? 1 : 0;
	const alternatives = groups.reduce((total, group) => total + group.items.length - 1, 0);
	return Math.max(positive - 1, 0) + negated + alternatives;
}

export function buildKeywords(search: PostSearch): string {
	const groups = queryGroups(search);
	const included = groups.filter((group) => !group.negated).map((group) => anyOf(group.items, group.loose));
	if (included.length === 0) {
		return "";
	}
	const negated = groups.find((group) => group.negated);
	return negated ? `${included.join(" AND ")} NOT ${anyOf(negated.items, negated.loose)}` : included.join(" AND ");
}

export type LimitedChange = { search: PostSearch; clamped: boolean };

const LIST_FIELDS = ["terms", "excluded", "blockedAuthors", "locations"] as const;

export function applyChange(current: PostSearch, next: PostSearch): LimitedChange {
	if (operatorCost(next) <= LINKEDIN_OPERATOR_LIMIT) {
		return { search: next, clamped: false };
	}
	const fitted = { ...next };
	for (const field of LIST_FIELDS) {
		while (fitted[field].length > current[field].length && operatorCost(fitted) > LINKEDIN_OPERATOR_LIMIT) {
			fitted[field] = fitted[field].slice(0, -1);
		}
	}
	return operatorCost(fitted) <= LINKEDIN_OPERATOR_LIMIT
		? { search: fitted, clamped: true }
		: { search: current, clamped: true };
}

export function canAddTo(search: PostSearch, field: (typeof LIST_FIELDS)[number]): boolean {
	return operatorCost({ ...search, [field]: [...search[field], "x"] }) <= LINKEDIN_OPERATOR_LIMIT;
}

function dropLowestPriority(search: PostSearch): PostSearch | null {
	if (search.workModels.length > 0) {
		return { ...search, workModels: search.workModels.slice(0, -1) };
	}
	if (search.excluded.length > 0) {
		return { ...search, excluded: search.excluded.slice(0, -1) };
	}
	if (search.blockedAuthors.length > 0) {
		return { ...search, blockedAuthors: search.blockedAuthors.slice(0, -1) };
	}
	if (search.terms.length > 1) {
		return { ...search, terms: search.terms.slice(0, -1) };
	}
	if (search.locations.length > 0) {
		return { ...search, locations: search.locations.slice(0, -1) };
	}
	if (search.hiringOnly) {
		return { ...search, hiringOnly: false };
	}
	return search.language !== "any" ? { ...search, language: "any" } : null;
}

export function fitToLimit(search: PostSearch): PostSearch {
	let fitted = search;
	while (operatorCost(fitted) > LINKEDIN_OPERATOR_LIMIT) {
		const next = dropLowestPriority(fitted);
		if (!next) {
			break;
		}
		fitted = next;
	}
	return fitted;
}

export function buildPostSearchUrl(search: PostSearch): string | null {
	const keywords = buildKeywords(search);
	if (!keywords) {
		return null;
	}
	const params = new URLSearchParams({ keywords, origin: "FACETED_SEARCH" });
	if (search.datePosted !== "any") {
		params.set("datePosted", JSON.stringify(search.datePosted));
	}
	params.set("sortBy", JSON.stringify(search.sortBy));
	return `${LINKEDIN_POST_SEARCH}?${params.toString()}`;
}
