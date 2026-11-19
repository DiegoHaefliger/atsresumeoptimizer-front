import { describe, expect, it } from "vitest";
import { isPdf } from "./linkedinPdf";

describe("isPdf", () => {
	it("accepts a pdf by type or by extension", () => {
		expect(isPdf(new File(["x"], "Profile.pdf", { type: "application/pdf" }))).toBe(true);
		expect(isPdf(new File(["x"], "Profile.PDF", { type: "" }))).toBe(true);
	});

	it("refuses anything else", () => {
		expect(isPdf(new File(["x"], "curriculo.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }))).toBe(false);
	});
});
