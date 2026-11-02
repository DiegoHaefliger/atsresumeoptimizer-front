import { describe, expect, it } from "vitest";
import type { SelectionProcess, SelectionSchedule } from "../api/types";
import { attentionCopy, firstName, followUpMailto } from "./attentionCopy";
import { attentionFor } from "./processAttention";

const NOW = new Date("2026-10-30T12:00:00");

function process(overrides: Partial<SelectionProcess>): SelectionProcess {
	return {
		stage: "HR_INTERVIEW",
		appliedOn: null,
		nextStepOn: null,
		updatedAt: "2026-10-29T12:00:00Z",
		nextSchedule: null,
		stageSince: "2026-10-13T10:00:00",
		jobTitle: "Dev Java",
		contactEmail: null,
		...overrides,
	} as SelectionProcess;
}

function copyOf(overrides: Partial<SelectionProcess>) {
	const item = attentionFor(process(overrides), NOW);
	return item && attentionCopy(item, NOW);
}

describe("attentionCopy", () => {
	it("asks for a follow-up without repeating the day count shown next to the stage", () => {
		expect(copyOf({})).toEqual({ label: "Follow-up", headline: "Hora do follow-up", detail: "sem retorno desde 13/10" });
	});

	it("nudges an interest that never became an application", () => {
		expect(copyOf({ stage: "INTERESTED" })).toEqual({ label: "Decidir", headline: "Candidatar ou descartar", detail: "desde 13/10" });
	});

	it("names the missed schedule and the upcoming one", () => {
		const schedule = (scheduledAt: string) => ({ stage: "TECHNICAL_INTERVIEW", scheduledAt, status: "SCHEDULED" }) as SelectionSchedule;
		expect(copyOf({ nextSchedule: schedule("2026-10-28T09:00:00") })).toEqual({
			label: "Atrasada",
			headline: "Etapa sem registro",
			detail: "Entrevista técnica de 28/10, 09:00",
		});
		expect(copyOf({ nextSchedule: schedule("2026-10-31T14:00:00") })).toEqual({
			label: "Amanhã",
			headline: "Entrevista técnica amanhã",
			detail: "31/10, 14:00",
		});
	});
});

describe("followUpMailto", () => {
	it("prepares an e-mail only when there is a contact address", () => {
		expect(followUpMailto(process({}))).toBeNull();
		expect(followUpMailto(process({ contactEmail: "rh@acme.com" }))).toBe("mailto:rh@acme.com?subject=Follow-up%3A%20Dev%20Java");
	});

	it("uses the contact's first name", () => {
		expect(firstName("  Maria Souza ")).toBe("Maria");
		expect(firstName(null)).toBeNull();
	});
});
