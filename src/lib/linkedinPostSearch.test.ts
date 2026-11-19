import { describe, expect, it } from "vitest";
import {
	applyChange,
	buildKeywords,
	buildPostSearchUrl,
	canAddTo,
	EMPTY_POST_SEARCH,
	fitToLimit,
	LINKEDIN_OPERATOR_LIMIT,
	operatorCost,
	type PostSearch,
} from "./linkedinPostSearch";

const BARE: PostSearch = { ...EMPTY_POST_SEARCH, hiringOnly: false, language: "any" };

describe("buildKeywords", () => {
	it("agrupa termos com OR, sem aspas nas frases, e combina com vaga via AND", () => {
		const keywords = buildKeywords({ ...EMPTY_POST_SEARCH, terms: ["Desenvolvedor Java", "Spring Boot"] });
		expect(keywords).toBe('((Desenvolvedor Java) OR (Spring Boot)) AND ("contratando" OR "vaga" OR "oportunidade")');
	});

	it("não restringe idioma quando qualquer idioma", () => {
		expect(buildKeywords({ ...BARE, terms: ["Java"] })).toBe('"Java"');
	});

	it("usa termos em inglês para inglês", () => {
		const keywords = buildKeywords({ ...EMPTY_POST_SEARCH, terms: ["Java"], language: "en" });
		expect(keywords).toContain('"hiring"');
		expect(keywords).not.toContain('"our team"');
	});

	it("usa marcadores de idioma quando não exige contratação", () => {
		const keywords = buildKeywords({ ...EMPTY_POST_SEARCH, terms: ["Java"], hiringOnly: false });
		expect(keywords).toBe('"Java" AND ("nossa" OR "equipe" OR "estamos")');
	});

	it("oculta perfis antes das palavras excluídas", () => {
		const keywords = buildKeywords({ ...BARE, terms: ["Java"], blockedAuthors: ["Vagas Remotas"], excluded: ["estágio"] });
		expect(keywords).toBe('"Java" NOT ((Vagas Remotas) OR "estágio")');
	});

	it("exclui palavras com NOT e remove aspas digitadas", () => {
		const keywords = buildKeywords({ ...BARE, terms: ['"Java"'], excluded: ["estágio", "jovem aprendiz"] });
		expect(keywords).toBe('"Java" NOT ("estágio" OR (jovem aprendiz))');
	});

	it("devolve vazio sem nenhum termo", () => {
		expect(buildKeywords(BARE)).toBe("");
	});
});

describe("qualquer idioma", () => {
	it("sozinho não entra no link nem conta como filtro", () => {
		const search: PostSearch = { ...BARE, terms: ["Java"], language: "any" };
		expect(buildKeywords(search)).toBe('"Java"');
		expect(operatorCost(search)).toBe(0);
	});

	it("não consome espaço: trocar pt por any libera operadores", () => {
		const pt: PostSearch = { ...BARE, terms: ["Java"], language: "pt" };
		expect(operatorCost(pt)).toBeGreaterThan(operatorCost({ ...pt, language: "any" }));
	});
});

describe("operatorCost", () => {
	it("conta AND, OR e NOT do que é gerado", () => {
		const search: PostSearch = { ...EMPTY_POST_SEARCH, terms: ["A", "B"], blockedAuthors: ["Vagas Remotas"] };
		const operators = buildKeywords(search).match(/ (AND|OR|NOT) /g) ?? [];
		expect(operatorCost(search)).toBe(operators.length);
	});

	it("é zero para um único termo sem outros filtros", () => {
		expect(operatorCost({ ...BARE, terms: ["Java"] })).toBe(0);
	});
});

describe("applyChange", () => {
	it("aceita mudança dentro do limite", () => {
		const change = applyChange(EMPTY_POST_SEARCH, { ...EMPTY_POST_SEARCH, terms: ["A", "B"] });
		expect(change.clamped).toBe(false);
		expect(change.search.terms).toEqual(["A", "B"]);
	});

	it("corta só os itens novos de uma lista que estouraria o limite", () => {
		const current: PostSearch = { ...EMPTY_POST_SEARCH, terms: ["A", "B"] };
		const change = applyChange(current, { ...current, terms: ["A", "B", "C", "D", "E"] });
		expect(change.clamped).toBe(true);
		expect(operatorCost(change.search)).toBeLessThanOrEqual(LINKEDIN_OPERATOR_LIMIT);
		expect(change.search.terms.slice(0, 2)).toEqual(["A", "B"]);
	});

	it("recusa filtro novo que não cabe e mantém o estado anterior", () => {
		const full: PostSearch = { ...EMPTY_POST_SEARCH, terms: ["A", "B"], blockedAuthors: ["X"] };
		expect(operatorCost(full)).toBe(LINKEDIN_OPERATOR_LIMIT);
		const change = applyChange(full, { ...full, locations: ["Curitiba"] });
		expect(change.clamped).toBe(true);
		expect(change.search).toEqual(full);
	});

	it("sempre aceita remoções", () => {
		const full: PostSearch = { ...EMPTY_POST_SEARCH, terms: ["A", "B"], blockedAuthors: ["X"] };
		expect(applyChange(full, { ...full, terms: ["A"] }).clamped).toBe(false);
	});
});

describe("canAddTo", () => {
	it("bloqueia adição quando o limite foi atingido", () => {
		const full: PostSearch = { ...EMPTY_POST_SEARCH, terms: ["A", "B"], blockedAuthors: ["X"] };
		expect(canAddTo(full, "terms")).toBe(false);
		expect(canAddTo(full, "locations")).toBe(false);
	});

	it("permite adição com espaço sobrando", () => {
		expect(canAddTo({ ...EMPTY_POST_SEARCH, terms: ["A"] }, "terms")).toBe(true);
	});
});

describe("fitToLimit", () => {
	it("tira primeiro os itens de menor prioridade até caber", () => {
		const fitted = fitToLimit({
			...EMPTY_POST_SEARCH,
			terms: ["A", "B", "C", "D"],
			excluded: ["x", "y", "z"],
			locations: ["Curitiba"],
			workModels: ["REMOTE", "HYBRID"],
		});
		expect(operatorCost(fitted)).toBeLessThanOrEqual(LINKEDIN_OPERATOR_LIMIT);
		expect(fitted.workModels).toEqual([]);
		expect(fitted.terms.length).toBeGreaterThanOrEqual(1);
	});

	it("não altera o que já cabe", () => {
		const search: PostSearch = { ...EMPTY_POST_SEARCH, terms: ["Java"] };
		expect(fitToLimit(search)).toBe(search);
	});
});

describe("buildPostSearchUrl", () => {
	it("monta data e ordenação no formato do LinkedIn", () => {
		const url = new URL(buildPostSearchUrl({ ...EMPTY_POST_SEARCH, terms: ["Java"] }) ?? "");
		expect(url.origin + url.pathname).toBe("https://www.linkedin.com/search/results/content/");
		expect(url.searchParams.get("datePosted")).toBe('"past-week"');
		expect(url.searchParams.get("sortBy")).toBe('"date_posted"');
	});

	it("omite o filtro de data quando é qualquer data", () => {
		const url = new URL(buildPostSearchUrl({ ...EMPTY_POST_SEARCH, terms: ["Java"], datePosted: "any" }) ?? "");
		expect(url.searchParams.has("datePosted")).toBe(false);
	});

	it("não gera link sem termos", () => {
		expect(buildPostSearchUrl(BARE)).toBeNull();
	});
});
