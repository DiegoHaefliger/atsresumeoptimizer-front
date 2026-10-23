import { describe, expect, it } from "vitest";
import { formatCost, isSubCent, subCentPhrase } from "./costFormat";

describe("formatCost", () => {
	it("shows four decimals below one cent instead of rounding to zero", () => {
		expect(formatCost(0.0004, "BRL")).toBe("R$ 0,0004");
		expect(formatCost(0.0099, "USD")).toBe("US$ 0,0099");
	});

	it("shows two decimals from one cent up", () => {
		expect(formatCost(0.01, "BRL")).toBe("R$ 0,01");
		expect(formatCost(12.5, "BRL")).toBe("R$ 12,50");
	});

	it("shows an exact zero as zero", () => {
		expect(formatCost(0, "BRL")).toBe("R$ 0,00");
	});
});

describe("isSubCent", () => {
	it("is true only for positive values below one cent", () => {
		expect(isSubCent(0.0004)).toBe(true);
		expect(isSubCent(0)).toBe(false);
		expect(isSubCent(0.01)).toBe(false);
	});
});

describe("subCentPhrase", () => {
	it("names the threshold in the chosen currency", () => {
		expect(subCentPhrase("BRL")).toBe("inferior a R$ 0,01");
		expect(subCentPhrase("USD")).toBe("inferior a US$ 0,01");
	});
});
