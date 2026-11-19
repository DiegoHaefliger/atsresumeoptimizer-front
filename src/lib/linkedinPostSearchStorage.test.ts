import { describe, expect, it } from "vitest";
import { EMPTY_POST_SEARCH, operatorCost, LINKEDIN_OPERATOR_LIMIT } from "./linkedinPostSearch";
import { parsePostSearch } from "./linkedinPostSearchStorage";

describe("parsePostSearch", () => {
	it("volta ao padrão sem nada salvo ou com JSON inválido", () => {
		expect(parsePostSearch(null)).toBe(EMPTY_POST_SEARCH);
		expect(parsePostSearch("{quebrado")).toBe(EMPTY_POST_SEARCH);
	});

	it("restaura os filtros salvos", () => {
		const saved = { ...EMPTY_POST_SEARCH, terms: ["Java"], blockedAuthors: ["Vagas Remotas"], language: "en", workModels: [] };
		expect(parsePostSearch(JSON.stringify(saved))).toMatchObject({
			terms: ["Java"],
			blockedAuthors: ["Vagas Remotas"],
			language: "en",
			workModels: [],
		});
	});

	it("migra a cidade salva como texto único para a lista", () => {
		expect(parsePostSearch(JSON.stringify({ terms: ["Java"], location: "Curitiba" })).locations).toEqual(["Curitiba"]);
	});

	it("ignora valores inválidos e respeita o limite de operadores", () => {
		const loaded = parsePostSearch(
			JSON.stringify({ terms: ["A", "B", "C", "D", "E", "F"], language: "xx", workModels: ["REMOTE", "NOPE"], sortBy: 3 }),
		);
		expect(loaded.language).toBe(EMPTY_POST_SEARCH.language);
		expect(loaded.sortBy).toBe(EMPTY_POST_SEARCH.sortBy);
		expect(loaded.workModels).not.toContain("NOPE");
		expect(operatorCost(loaded)).toBeLessThanOrEqual(LINKEDIN_OPERATOR_LIMIT);
	});
});
