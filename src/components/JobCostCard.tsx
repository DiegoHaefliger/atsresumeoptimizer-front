import type { JobCostResponse, StageCostResponse } from "../api/types";
import { formatCost, formatTokens, isSubCent, subCentPhrase, type CostCurrency } from "../lib/costFormat";

const STAGE_LABELS: Record<StageCostResponse["stage"], string> = {
	JOB_ANALYSIS: "Análise da vaga",
	RESUME_ADAPTATION: "Adaptação do currículo",
	INTERVIEW_PREPARATION: "Preparação para a entrevista",
};

function amount(cost: { costUsd: number; costBrl: number }, currency: CostCurrency): number {
	return currency === "BRL" ? cost.costBrl : cost.costUsd;
}

export function JobCostCard({ cost, currency }: { cost: JobCostResponse; currency: CostCurrency }) {
	const total = amount({ costUsd: cost.totalCostUsd, costBrl: cost.totalCostBrl }, currency);

	return (
		<article className="cost-card" aria-label="Custo total por candidatura">
			<span className="cost-card-eyebrow">ATS Resume Optimizer</span>
			<h3 className="cost-card-title">Custo total por candidatura</h3>
			<p className="cost-card-total">{formatCost(total, currency)}</p>
			<p className="cost-card-note">
				{isSubCent(total) ? `Valor exato, ${subCentPhrase(currency)}` : "Valor somado de todas as etapas"}
				{cost.estimated && " · estimado"}
			</p>
			<ul className="cost-card-stages">
				{cost.stages.map((stage) => (
					<StageRow key={stage.stage} stage={stage} currency={currency} />
				))}
			</ul>
			<p className="cost-card-footer">
				Cotação usada: US$ 1 = {formatCost(cost.usdBrlRate, "BRL")}. Estimativa pela tabela de preços dos modelos, não
				é a fatura do provedor.
			</p>
		</article>
	);
}

function StageRow({ stage, currency }: { stage: StageCostResponse; currency: CostCurrency }) {
	return (
		<li className="cost-card-stage">
			<div className="cost-card-stage-info">
				<span className="cost-card-stage-name">{STAGE_LABELS[stage.stage]}</span>
				{stage.executed && (
					<span className="cost-card-stage-detail">
						{formatTokens(stage.tokensIn)} entrada + {formatTokens(stage.tokensOut)} saída
						{stage.models.length > 0 && ` · ${stage.models.join(", ")}`}
						{stage.cached && " · cache"}
					</span>
				)}
			</div>
			{stage.executed ? (
				<span className="cost-card-stage-cost">
					{formatCost(amount(stage, currency), currency)}
					{stage.estimated && <span className="cost-card-estimated">estimado</span>}
				</span>
			) : (
				<span className="cost-card-stage-skipped">Não executada</span>
			)}
		</li>
	);
}
