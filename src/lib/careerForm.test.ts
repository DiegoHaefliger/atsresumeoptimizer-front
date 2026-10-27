import { describe, expect, it } from "vitest";
import { EMPTY_CAREER_FORM, isSameCareerForm, missingCareerFields, toCareerForm, toCareerRequest } from "./careerForm";

describe("careerForm", () => {
	it("asks for the area and the target job title", () => {
		expect(missingCareerFields(EMPTY_CAREER_FORM)).toEqual(["área de atuação", "próximo cargo desejado"]);
		expect(missingCareerFields({ ...EMPTY_CAREER_FORM, areaOfExpertise: "TI", targetJobTitle: "Tech Lead" })).toEqual([]);
		expect(missingCareerFields({ ...EMPTY_CAREER_FORM, areaOfExpertise: "  ", targetJobTitle: "Tech Lead" })).toEqual(["área de atuação"]);
	});

	it("sends blank optional fields as absent and trims the required ones", () => {
		const request = toCareerRequest({ ...EMPTY_CAREER_FORM, areaOfExpertise: " TI ", targetJobTitle: "Tech Lead ", location: "  " });

		expect(request.areaOfExpertise).toBe("TI");
		expect(request.targetJobTitle).toBe("Tech Lead");
		expect(request.location).toBeUndefined();
		expect(request.tone).toBe("TECHNICAL");
	});

	it("fills defaults for fields the server left out", () => {
		const form = toCareerForm({ areaOfExpertise: "TI", targetJobTitle: "Tech Lead", targetIndustries: [], targetCompanies: [], languages: [], strengths: [], tone: "EXECUTIVE", profileLanguage: "en" });

		expect(form.currentJobTitle).toBe("");
		expect(form.tone).toBe("EXECUTIVE");
		expect(form.profileLanguage).toBe("en");
	});

	it("detects pending changes by the request payload", () => {
		expect(isSameCareerForm(EMPTY_CAREER_FORM, { ...EMPTY_CAREER_FORM, notes: "   " })).toBe(true);
		expect(isSameCareerForm(EMPTY_CAREER_FORM, { ...EMPTY_CAREER_FORM, strengths: ["Java"] })).toBe(false);
	});
});
