export type SuggestionSort = "SCORE_DESC" | "SCORE_ASC" | "POSTED_DESC" | "POSTED_ASC" | "FOUND_DESC";

export const DEFAULT_SUGGESTION_SORT: SuggestionSort = "SCORE_DESC";

export const SUGGESTION_SORT_OPTIONS: readonly { value: SuggestionSort; label: string }[] = [
	{ value: "SCORE_DESC", label: "Maior aderência" },
	{ value: "SCORE_ASC", label: "Menor aderência" },
	{ value: "POSTED_DESC", label: "Publicação mais recente" },
	{ value: "POSTED_ASC", label: "Publicação mais antiga" },
	{ value: "FOUND_DESC", label: "Encontrada mais recente" },
];
