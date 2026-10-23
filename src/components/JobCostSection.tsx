import { useState } from "react";
import { type CostCurrency } from "../lib/costFormat";
import { useJobCost } from "../lib/useJobCost";
import { JobCostCard } from "./JobCostCard";
import { LoadFailed } from "./LoadFailed";
import { SegmentedTabs } from "./SegmentedTabs";
import { Skeleton } from "./Skeleton";
import { StateMessage } from "./StateMessage";

const CURRENCY_OPTIONS: { value: CostCurrency; label: string }[] = [
	{ value: "BRL", label: "R$" },
	{ value: "USD", label: "US$" },
];

export function JobCostSection({ jobId }: { jobId: string }) {
	const { cost, failed, reload } = useJobCost(jobId);
	const [currency, setCurrency] = useState<CostCurrency>("BRL");

	return (
		<section className="job-cost" aria-label="Custo de IA">
			{cost?.stages.some((stage) => stage.executed) && (
				<div className="job-cost-header">
					<SegmentedTabs label="Moeda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
				</div>
			)}
			{failed ? (
				<LoadFailed message="Não deu pra carregar o custo desta vaga." onRetry={reload} />
			) : !cost ? (
				<div role="status" aria-busy="true">
					<span className="sr-only">Carregando custo...</span>
					<Skeleton width="100%" height={280} radius="var(--radius-lg)" />
				</div>
			) : !cost.stages.some((stage) => stage.executed) ? (
				<StateMessage variant="empty" message="Esta vaga ainda não usou IA, então não há custo a mostrar." />
			) : (
				<JobCostCard cost={cost} currency={currency} />
			)}
		</section>
	);
}
