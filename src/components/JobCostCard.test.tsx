import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { JobCostResponse, StageCostResponse } from "../api/types";
import { JobCostCard } from "./JobCostCard";

afterEach(cleanup);

const EXECUTED_ANALYSIS: StageCostResponse = {
	stage: "JOB_ANALYSIS",
	executed: true,
	tokensIn: 1200,
	tokensOut: 340,
	costUsd: 0.0004,
	costBrl: 0.0022,
	models: ["gpt-4o-mini"],
	estimated: false,
	cached: false,
};

const SKIPPED = {
	executed: false,
	tokensIn: 0,
	tokensOut: 0,
	costUsd: 0,
	costBrl: 0,
	estimated: false,
	cached: false,
};

function jobCost(overrides: Partial<JobCostResponse> = {}): JobCostResponse {
	return {
		totalCostUsd: 0.0004,
		totalCostBrl: 0.0022,
		usdBrlRate: 5.5,
		models: ["gpt-4o-mini"],
		estimated: false,
		cached: false,
		stages: [
			EXECUTED_ANALYSIS,
			{ ...SKIPPED, stage: "RESUME_ADAPTATION", models: [] },
			{ ...SKIPPED, stage: "INTERVIEW_PREPARATION", models: [] },
		],
		...overrides,
	};
}

describe("JobCostCard", () => {
	it("shows a total under one cent with four decimals and the phrase, never R$ 0,00", () => {
		const { container } = render(<JobCostCard cost={jobCost()} currency="BRL" />);

		expect(container.querySelector(".cost-card-total")?.textContent).toBe("R$ 0,0022");
		expect(screen.getByText(/inferior a R\$ 0,01/)).toBeTruthy();
		expect(screen.queryByText("R$ 0,00")).toBeNull();
	});

	it("marks a stage that did not run as not executed, without a cost", () => {
		render(<JobCostCard cost={jobCost()} currency="BRL" />);

		expect(screen.getAllByText("Não executada")).toHaveLength(2);
		expect(screen.getByText("Adaptação do currículo")).toBeTruthy();
	});

	it("shows tokens and model of a stage that ran", () => {
		render(<JobCostCard cost={jobCost()} currency="BRL" />);

		expect(screen.getByText(/1\.200 entrada \+ 340 saída · gpt-4o-mini/)).toBeTruthy();
	});

	it("flags a stage priced with an unregistered model as estimated", () => {
		const cost = jobCost({ estimated: true, stages: [{ ...EXECUTED_ANALYSIS, estimated: true }, ...jobCost().stages.slice(1)] });
		render(<JobCostCard cost={cost} currency="BRL" />);

		expect(screen.getByText("estimado")).toBeTruthy();
	});

	it("switches the amounts to dollars", () => {
		render(<JobCostCard cost={jobCost()} currency="USD" />);

		expect(screen.getAllByText("US$ 0,0004").length).toBeGreaterThan(0);
		expect(screen.getByText(/inferior a US\$ 0,01/)).toBeTruthy();
	});

	it("states the exchange rate and that it is not the provider invoice", () => {
		render(<JobCostCard cost={jobCost()} currency="BRL" />);

		expect(screen.getByText(/US\$ 1 = R\$ 5,50/)).toBeTruthy();
		expect(screen.getByText(/não é a fatura do provedor/)).toBeTruthy();
	});
});
