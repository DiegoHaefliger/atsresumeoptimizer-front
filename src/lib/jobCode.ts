const CODE_PREFIX = "V";
const CODE_DIGITS = 4;
const CODE_QUERY = /^[v#]?(\d+)$/i;

export function formatJobCode(code: number): string {
	return `${CODE_PREFIX}${String(code).padStart(CODE_DIGITS, "0")}`;
}

export function matchesJobCode(word: string, code: number): boolean {
	const digits = CODE_QUERY.exec(word)?.[1];
	return digits !== undefined && Number(digits) === code;
}

export function jobLabel(
	code: number | null | undefined,
	title: string | null | undefined,
	company: string | null | undefined,
): string {
	return [code != null ? formatJobCode(code) : null, title ?? "Vaga sem título", company].filter(Boolean).join(" · ");
}
