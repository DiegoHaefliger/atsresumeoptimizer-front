import { beforeEach, describe, expect, it } from "vitest";
import { capturedSections, detailUrl, emptyDraft, loadDraft, mergeCapture, missingSections, parseFragment, saveDraft } from "./linkedinDraft";

function fragmentOf(value: unknown): string {
	return `#${btoa(unescape(encodeURIComponent(JSON.stringify(value))))}`;
}

beforeEach(() => window.localStorage.clear());

describe("mergeCapture", () => {
	it("keeps what was read before and replaces a section only with a non-empty reading", () => {
		const first = mergeCapture(emptyDraft(), { profile: { headline: "Dev", skills: ["Java"], about: "Sobre" } }, 1);
		const second = mergeCapture(first, { profile: { skills: ["Java", "Spring"], about: null, experiences: [] } }, 2);

		expect(second.profile).toEqual({ headline: "Dev", skills: ["Java", "Spring"], about: "Sobre" });
		expect(second.updatedAt).toBe(2);
	});

	it("tells what was read and what is still missing", () => {
		const draft = mergeCapture(emptyDraft(), { profile: { headline: "Dev", skills: ["Java"] } });

		expect(capturedSections(draft)).toEqual(["headline", "skills"]);
		expect(missingSections(draft)).toContain("experiences");
		expect(missingSections(draft)).not.toContain("skills");
	});
});

describe("detailUrl", () => {
	it("builds the linkedin page for a section from the profile url", () => {
		expect(detailUrl("https://www.linkedin.com/in/ana/", "skills")).toBe("https://www.linkedin.com/in/ana/details/skills/");
	});

	it("has no page for sections that live on the profile and refuses foreign urls", () => {
		expect(detailUrl("https://www.linkedin.com/in/ana/", "about")).toBeNull();
		expect(detailUrl("https://evil.example/in/ana/", "skills")).toBeNull();
		expect(detailUrl(undefined, "skills")).toBeNull();
	});
});

describe("parseFragment", () => {
	it("decodes what the reader sends, accents included", () => {
		expect(parseFragment(fragmentOf({ profile: { headline: "Engenheira de Software – São Paulo" } }))?.profile?.headline).toBe(
			"Engenheira de Software – São Paulo",
		);
	});

	it("ignores empty or broken fragments", () => {
		expect(parseFragment("")).toBeNull();
		expect(parseFragment("#@@@")).toBeNull();
		expect(parseFragment(fragmentOf({ other: 1 }))).toBeNull();
	});
});

describe("draft storage", () => {
	it("restores a recent draft and drops an old one", () => {
		saveDraft({ profile: { headline: "Dev" }, updatedAt: 1000 });

		expect(loadDraft(1000 + 60_000).profile.headline).toBe("Dev");
		expect(loadDraft(1000 + 31 * 60_000).profile).toEqual({});
		saveDraft(null);
		expect(loadDraft(1000).profile).toEqual({});
	});
});
