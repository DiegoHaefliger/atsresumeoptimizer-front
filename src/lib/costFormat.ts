export type CostCurrency = "BRL" | "USD";

const SMALLEST_CENT = 0.01;
const SUB_CENT_DIGITS = 4;

const SYMBOLS: Record<CostCurrency, string> = { BRL: "R$", USD: "US$" };

function number(value: number, digits: number): string {
	return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function isSubCent(value: number): boolean {
	return value > 0 && value < SMALLEST_CENT;
}

export function formatCost(value: number, currency: CostCurrency): string {
	const digits = isSubCent(value) ? SUB_CENT_DIGITS : 2;
	return `${SYMBOLS[currency]} ${number(value, digits)}`;
}

export function subCentPhrase(currency: CostCurrency): string {
	return `inferior a ${formatCost(SMALLEST_CENT, currency)}`;
}

export function formatTokens(value: number): string {
	return number(value, 0);
}
